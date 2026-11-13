"""Juego 4 · ¿Qué mayúscula falta? (sustantivos, nombres propios, Sie...)"""
import html
import random

import streamlit as st

from core import datos, ui

K = "may"
MODOS = ["Fácil: falta una mayúscula", "Avanzado: ¡todas en minúscula!"]
FRASES = datos.frases()


def tiene_mayus(tok: str) -> bool:
    return bool(tok) and tok[0].isupper()


# Para el modo fácil hace falta al menos un sustantivo que no sea la primera palabra.
FACIL = [f for f in FRASES
         if any(tiene_mayus(t) for t in ui.separar(f["de"])[1:])]


def nueva_pregunta() -> None:
    ss = st.session_state
    pool = FACIL if ss.may_modo == MODOS[0] else FRASES
    anterior = ss.get("may_i")
    f = random.choice(pool)
    for _ in range(10):
        if f["de"] != anterior:
            break
        f = random.choice(pool)
    ss.may_i = f["de"]
    toks = ui.separar(f["de"])
    ss.may_objetivo = random.choice([j for j in range(1, len(toks)) if tiene_mayus(toks[j])]) \
        if ss.may_modo == MODOS[0] else None
    ss.may_res = None
    ss.may_ronda = ss.get("may_ronda", 0) + 1


def frase_actual():
    return next(f for f in FRASES if f["de"] == st.session_state.may_i)


ui.cabecera("¿Qué mayúscula falta?", "En alemán, todos los sustantivos se escriben con mayúscula")
ui.marcador(K)
st.radio("Modo de juego", MODOS, horizontal=True, key="may_modo", on_change=nueva_pregunta)
if "may_i" not in st.session_state:
    nueva_pregunta()

ss = st.session_state
f = frase_actual()
toks = ui.separar(f["de"])
facil = ss.may_modo == MODOS[0]
clave = f"may_sel_{ss.may_ronda}"

# Cómo se muestra cada palabra en la pregunta
if facil:
    visibles = [t if j != ss.may_objetivo else t[0].lower() + t[1:] for j, t in enumerate(toks)]
    consigna = "Toca la palabra que debería llevar mayúscula."
else:
    visibles = [t.lower() for t in toks]
    consigna = ("Toca **todas** las palabras que deben ir con mayúscula "
                "(sustantivos, nombres propios, la primera palabra de la frase y «Sie» de cortesía).")

ui.tarjeta("Significado", html.escape(f["es"]))

if ss.may_res is None:
    st.markdown(consigna)
    seleccion = st.pills("Palabras", options=list(range(len(toks))),
                         format_func=lambda j: visibles[j],
                         selection_mode="single" if facil else "multi",
                         key=clave, label_visibility="collapsed")
    elegidas = set() if seleccion is None else ({seleccion} if facil else set(seleccion))
    if st.button("Comprobar ✚", type="primary", disabled=not elegidas):
        if facil:
            ok = elegidas == {ss.may_objetivo}
        else:
            ok = elegidas == {j for j, t in enumerate(toks) if tiene_mayus(t)}
        ui.registrar(K, ok)
        ss.may_res = {"ok": ok, "sel": sorted(elegidas)}
        st.rerun()
else:
    res = ss.may_res
    necesarias = {ss.may_objetivo} if facil else {j for j, t in enumerate(toks) if tiene_mayus(t)}
    elegidas = set(res["sel"])
    partes = []
    for j, t in enumerate(toks):
        if j in necesarias and j in elegidas:
            partes.append(f'<span class="bien">{html.escape(t)}</span>')
        elif j in necesarias:
            partes.append(f'<span class="mal">{html.escape(t)}</span>')
        elif j in elegidas:
            partes.append(f'<span class="sobra">{html.escape(t)}</span>')
        else:
            partes.append(html.escape(visibles[j] if facil else t.lower()))
    linea = f'<div class="cinta">{" ".join(partes)}</div>'
    if res["ok"]:
        ui.resultado_ok(linea)
    else:
        ui.resultado_ko(linea + '<div class="pista">En rojo, la mayúscula que faltaba'
                        + ('' if facil else '; tachado, una palabra que no la necesitaba')
                        + '. Recuerda: los sustantivos siempre se escriben con mayúscula.</div>')
    st.button("Siguiente →", type="primary", on_click=nueva_pregunta)
