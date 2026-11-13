"""Juego 2 · Verbos separables (solo los que están en el temario)."""
import html
import random

import streamlit as st

from core import datos, ui

K = "verb"
VERBOS = datos.verbos()
PREFIJOS = sorted({v["prefijo"] for v in VERBOS})
MODOS = ["Completa la frase", "¿Cuál es el prefijo?"]


def nueva_pregunta() -> None:
    ss = st.session_state
    anterior = ss.get("verb_q")
    v = random.choice(VERBOS)
    for _ in range(10):
        if v["infinitivo"] != anterior:
            break
        v = random.choice(VERBOS)
    ss.verb_q = v["infinitivo"]
    ss.verb_frase = random.choice(v["frases"])
    ss.verb_res = None
    # opciones de prefijo (el correcto + 3 distintos) para el modo 2
    otros = [p for p in PREFIJOS if p != v["prefijo"]]
    opciones = random.sample(otros, min(3, len(otros))) + [v["prefijo"]]
    random.shuffle(opciones)
    ss.verb_opciones = opciones
    ss.pop("verb_eleccion", None)


def quitar_prefijo(frase: str, prefijo: str) -> str:
    """Sustituye la última palabra (el prefijo) por un hueco."""
    pal = frase.split()
    ultima = pal[-1]
    signos = ultima[len(prefijo):] if ultima.lower().startswith(prefijo) else ""
    pal[-1] = "_____" + signos
    return " ".join(pal)


ui.cabecera("Verbos separables", "El prefijo viaja al final de la frase")
ui.marcador(K)
modo = st.radio("Modo de juego", MODOS, horizontal=True, key="verb_modo", on_change=nueva_pregunta)
if "verb_q" not in st.session_state:
    nueva_pregunta()

ss = st.session_state
verbo = next(v for v in VERBOS if v["infinitivo"] == ss.verb_q)
res = ss.verb_res

if modo == MODOS[0]:
    ayuda = st.toggle("Mostrar el verbo en infinitivo como ayuda", value=True, key="verb_ayuda")
    hueco = html.escape(quitar_prefijo(ss.verb_frase, verbo["prefijo"]))
    ui.tarjeta("Escribe el prefijo que falta", hueco)
    pista = f"Significado: <b>{html.escape(verbo['es'])}</b>"
    if ayuda:
        pista += f" &nbsp;·&nbsp; Verbo: <b>{verbo['infinitivo']}</b>"
    st.markdown(f'<div class="pista">{pista}</div>', unsafe_allow_html=True)

    if res is None:
        with st.form("verb_form", clear_on_submit=True):
            resp = st.text_input("Prefijo", placeholder="p. ej. auf")
            enviado = st.form_submit_button("Comprobar ✚", type="primary")
        ui.nota_teclado()
        if enviado:
            if not resp.strip():
                st.warning("Escribe el prefijo y pulsa «Comprobar». ¡Tú puedes!")
            else:
                v = ui.evaluar(resp, [verbo["prefijo"]])
                ui.registrar(K, v != "ko")
                ss.verb_res = {"v": v, "resp": resp}
                st.rerun()
else:
    ui.tarjeta("¿Qué prefijo se separa de este verbo?",
               f'{verbo["infinitivo"]}<div class="pista">{html.escape(verbo["es"])}</div>',
               "numero-grande")
    if res is None:
        eleccion = st.radio("Elige el prefijo", ss.verb_opciones, horizontal=True,
                            index=None, key="verb_eleccion")
        if st.button("Comprobar ✚", type="primary", disabled=eleccion is None):
            ok = eleccion == verbo["prefijo"]
            ui.registrar(K, ok)
            ss.verb_res = {"v": "ok" if ok else "ko", "resp": eleccion}
            st.rerun()

if res is not None:
    completa = html.escape(ss.verb_frase)
    resumen = (f'<div class="pista">{verbo["infinitivo"]} = '
               f'<b>{verbo["prefijo"]}</b> + {verbo["base"]} · {html.escape(verbo["es"])}</div>')
    if res["v"] in ("ok", "alt"):
        ui.resultado_ok(f'<div class="palabra"><span class="bien">{completa}</span></div>{resumen}')
    else:
        bien, tuya = ui.diff_html(verbo["prefijo"], res["resp"])
        ui.resultado_ko(f'<div class="palabra">{bien}</div>'
                        f'<div class="tuya">Tu respuesta: {tuya}</div>'
                        f'<div class="pista">{completa}</div>{resumen}')
    st.button("Siguiente →", type="primary", on_click=nueva_pregunta)
