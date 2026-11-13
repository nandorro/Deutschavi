"""Prueba de humo de los 4 juegos simulando clics.
Ejecutar desde la raíz:  python tests/test_paginas.py
"""
import os
import sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
os.chdir(RAIZ)
sys.path.insert(0, RAIZ)

from streamlit.testing.v1 import AppTest  # noqa: E402

from core.numeros_de import palabra  # noqa: E402


def sin_errores(at, nombre):
    assert not at.exception, (nombre, [e.value for e in at.exception])


def test_inicio():
    at = AppTest.from_file(os.path.join(RAIZ, "app.py"), default_timeout=30).run()
    sin_errores(at, "inicio")


def test_numeros():
    at = AppTest.from_file(os.path.join(RAIZ, "paginas", "numeros.py"), default_timeout=30).run()
    sin_errores(at, "numeros")
    n = at.session_state["num_q"]
    # respuesta correcta
    at.text_input[0].set_value(palabra(n))
    at.button[0].click().run()  # form submit
    sin_errores(at, "numeros-ok")
    assert at.session_state["num_aciertos"] == 1, "debía contar acierto"
    at.button[0].click().run()  # Siguiente
    # respuesta incorrecta -> letras en rojo
    n = at.session_state["num_q"]
    at.text_input[0].set_value("xxx")
    at.button[0].click().run()
    sin_errores(at, "numeros-ko")
    assert at.session_state["num_racha"] == 0
    html = " ".join(m.value for m in at.markdown)
    assert 'class="mal"' in html, "debían salir letras en rojo"
    # variante sin teclado alemán: dreißig == dreissig
    at.session_state["num_q"] = 30
    at.session_state["num_res"] = None
    at.run()
    at.text_input[0].set_value("dreissig")
    at.button[0].click().run()
    assert at.session_state["num_res"]["v"] == "alt"


def test_verbos():
    for modo in (0, 1):
        at = AppTest.from_file(os.path.join(RAIZ, "paginas", "verbos.py"), default_timeout=30).run()
        sin_errores(at, "verbos")
        if modo == 1:
            at.radio[0].set_value("¿Cuál es el prefijo?").run()
            sin_errores(at, "verbos-modo2")
            from core import datos
            v = next(x for x in datos.verbos() if x["infinitivo"] == at.session_state["verb_q"])
            at.radio[1].set_value(v["prefijo"]).run()
            at.button[0].click().run()
        else:
            from core import datos
            v = next(x for x in datos.verbos() if x["infinitivo"] == at.session_state["verb_q"])
            at.text_input[0].set_value(v["prefijo"])
            at.button[0].click().run()
        sin_errores(at, "verbos-resp")
        assert at.session_state["verb_aciertos"] == 1


def test_frases():
    at = AppTest.from_file(os.path.join(RAIZ, "paginas", "frases.py"), default_timeout=30).run()
    sin_errores(at, "frases")
    from core import datos, ui
    f = next(x for x in datos.frases() if x["de"] == _frase(at))
    toks = ui.separar(f["de"])
    # clic en las fichas en el orden correcto
    usadas = set()
    for t in toks:
        btn = next(b for b in at.button if b.label == t and b.key not in usadas)
        usadas.add(btn.key)
        btn.click().run()
        sin_errores(at, "frases-clic")
    [b for b in at.button if b.label == "Comprobar ✚"][0].click().run()
    assert at.session_state["frase_aciertos"] == 1


def _frase(at):
    from core import datos
    return datos.frases()[at.session_state["frase_i"]]["de"]


def test_mayusculas():
    for modo in ("Fácil: falta una mayúscula", "Avanzado: ¡todas en minúscula!"):
        at = AppTest.from_file(os.path.join(RAIZ, "paginas", "mayusculas.py"), default_timeout=30).run()
        at.radio[0].set_value(modo).run()
        sin_errores(at, "mayus-" + modo[:5])


if __name__ == "__main__":
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_"):
            fn()
            print("OK", nombre)
