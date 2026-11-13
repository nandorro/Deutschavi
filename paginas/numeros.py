"""Juego 1 · Números: aparece la cifra y se escribe en alemán."""
import random

import streamlit as st

from config import SEMANA_ACTUAL
from core import ui
from core.numeros_de import con_puntos, formas_validas, palabra

K = "num"

# nombre del nivel -> (semana en que se desbloquea, generador)
NIVELES = {
    "Del 0 al 20": (1, lambda: random.randint(0, 20)),
    "Del 21 al 100": (1, lambda: random.randint(21, 100)),
    "Del 100 al 999": (2, lambda: random.randint(100, 999)),
    "Del 1.000 al 999.999": (2, lambda: random.choice([
        random.randint(1000, 9999), random.randint(10_000, 99_999),
        random.randint(100_000, 999_999)])),
    "Millones": (2, lambda: random.randint(1, 9) * 1_000_000
                 + random.choice([0, 0, 500_000, 100_000, 250_000, 300_000])),
}
disponibles = {n: g for n, (sem, g) in NIVELES.items() if sem <= SEMANA_ACTUAL}


def nueva_pregunta() -> None:
    gen = disponibles[st.session_state.num_nivel]
    anterior = st.session_state.get("num_q")
    n = gen()
    for _ in range(10):
        if n != anterior:
            break
        n = gen()
    st.session_state.num_q = n
    st.session_state.num_res = None


ui.cabecera("Números", "Escribe la cifra en alemán, todo junto y sin prisa")
ui.marcador(K)

st.selectbox("Nivel", list(disponibles), key="num_nivel", on_change=nueva_pregunta)
if "num_q" not in st.session_state:
    nueva_pregunta()

n = st.session_state.num_q
ui.tarjeta("¿Cómo se escribe en alemán?", con_puntos(n), "numero-grande")

res = st.session_state.num_res
if res is None:
    with st.form("num_form", clear_on_submit=True):
        resp = st.text_input("Tu respuesta", placeholder="p. ej. einundzwanzig")
        enviado = st.form_submit_button("Comprobar ✚", type="primary")
    ui.nota_teclado()
    if enviado:
        if not resp.strip():
            st.warning("Escribe tu respuesta y pulsa «Comprobar». Sin presión, tómate tu tiempo.")
        else:
            veredicto = ui.evaluar(resp, formas_validas(n))
            ui.registrar(K, veredicto != "ko")
            st.session_state.num_res = {"v": veredicto, "resp": resp}
            st.rerun()
else:
    canon = palabra(n)
    if res["v"] == "ok":
        ui.resultado_ok(f'<div class="palabra"><span class="bien">{canon}</span></div>')
    elif res["v"] == "alt":
        ui.resultado_ok(
            f'<div>¡Correcto! Con teclado alemán se escribe: '
            f'<span class="palabra"><span class="bien">{canon}</span></span></div>')
    else:
        bien, tuya = ui.diff_html(canon, res["resp"])
        ui.resultado_ko(
            f'<div class="palabra">{bien}</div>'
            f'<div class="tuya">Tu respuesta: {tuya}</div>'
            f'<div class="pista">En rojo, las letras que faltaban o no coincidían.</div>')
    st.button("Siguiente →", type="primary", on_click=nueva_pregunta)
