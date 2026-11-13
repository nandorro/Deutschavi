"""Juego 3 · Frases desordenadas: tocar las palabras en el orden correcto."""
import html
import random

import streamlit as st

from core import datos, ui

K = "frase"
FRASES = datos.frases()


def nueva_pregunta() -> None:
    ss = st.session_state
    anterior = ss.get("frase_i")
    i = random.randrange(len(FRASES))
    for _ in range(10):
        if i != anterior:
            break
        i = random.randrange(len(FRASES))
    ss.frase_i = i
    f = FRASES[i]
    toks = ui.separar(f["de"])
    validas = [toks] + [ui.separar(a) for a in f["alt"]]
    orden = list(range(len(toks)))
    for _ in range(30):  # que no salga ya ordenada
        random.shuffle(orden)
        if [toks[j] for j in orden] not in validas:
            break
    ss.frase_orden = orden
    ss.frase_elegidas = []
    ss.frase_res = None
    ss.frase_ronda = ss.get("frase_ronda", 0) + 1


def elegir(j: int) -> None:
    st.session_state.frase_elegidas.append(j)


def deshacer() -> None:
    if st.session_state.frase_elegidas:
        st.session_state.frase_elegidas.pop()


def reiniciar() -> None:
    st.session_state.frase_elegidas = []


def comprobar() -> None:
    ss = st.session_state
    f = FRASES[ss.frase_i]
    toks = ui.separar(f["de"])
    dadas = [toks[j] for j in ss.frase_elegidas]
    validas = [toks] + [ui.separar(a) for a in f["alt"]]
    ok = dadas in validas
    ui.registrar(K, ok)
    ss.frase_res = {"ok": ok, "dadas": dadas}


ui.cabecera("Frases desordenadas", "Toca las palabras en el orden correcto")
ui.marcador(K)
if "frase_i" not in st.session_state:
    nueva_pregunta()

ss = st.session_state
frase = FRASES[ss.frase_i]
toks = ui.separar(frase["de"])
ui.tarjeta("Significado", html.escape(frase["es"]))

if ss.frase_res is None:
    elegidas = [toks[j] for j in ss.frase_elegidas]
    fichas = "".join(f'<span class="ficha">{html.escape(t)}</span>' for t in elegidas)
    st.markdown(f'<div class="bandeja">{fichas or "<span class=vacia>Toca las palabras de abajo…</span>"}</div>',
                unsafe_allow_html=True)

    libres = [j for j in ss.frase_orden if j not in ss.frase_elegidas]
    with st.container(horizontal=True):
        for j in libres:
            st.button(toks[j], key=f"fr_{ss.frase_ronda}_{j}", on_click=elegir, args=(j,))

    c1, c2, c3 = st.columns(3)
    c1.button("↩ Deshacer", on_click=deshacer, disabled=not ss.frase_elegidas, width="stretch")
    c2.button("✕ Empezar de nuevo", on_click=reiniciar, disabled=not ss.frase_elegidas, width="stretch")
    c3.button("Comprobar ✚", type="primary", on_click=comprobar, disabled=bool(libres), width="stretch")
else:
    res = ss.frase_res
    if res["ok"]:
        ui.resultado_ok(f'<div class="palabra"><span class="bien">{html.escape(" ".join(res["dadas"]))}</span></div>')
    else:
        correcta = toks
        partes_bien = []
        for pos, t in enumerate(correcta):
            mal = pos >= len(res["dadas"]) or res["dadas"][pos] != t
            partes_bien.append(f'<span class="{"mal" if mal else "bien"}">{html.escape(t)}</span>')
        tuya = " ".join(html.escape(t) for t in res["dadas"])
        ui.resultado_ko(f'<div class="cinta">{" ".join(partes_bien)}</div>'
                        f'<div class="tuya">Tu orden: {tuya}</div>'
                        f'<div class="pista">En rojo, las palabras que no iban en ese lugar. '
                        f'Recuerda: en las frases afirmativas el verbo conjugado va en la posición 2.</div>')
    st.button("Siguiente →", type="primary", on_click=nueva_pregunta)
