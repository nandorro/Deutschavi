"""Estética médica, mensajes amables y utilidades comunes a los juegos."""
import difflib
import html
import random
import re

import streamlit as st

CSS = """
:root {
  --teal: #0e7c86; --teal-osc: #0a5c64; --menta: #e1f2f2; --blanco: #ffffff;
  --rojo: #d6293e; --verde: #1f8a5b; --tinta: #12343b; --gris: #5b7a80;
}
.block-container { max-width: 760px; padding-top: 1.4rem; }
h1, h2, h3 { color: var(--teal-osc); letter-spacing: -0.01em; }
#MainMenu, footer { visibility: hidden; }

.cabecera {
  background: linear-gradient(135deg, #0e7c86 0%, #17a2a8 100%);
  color: #fff; border-radius: 18px; padding: 1.2rem 1.4rem 0.9rem;
  box-shadow: 0 6px 18px rgba(14,124,134,.22); margin-bottom: 1rem;
}
.cabecera .cruz { font-size: 1.1rem; background: #fff; color: var(--rojo);
  width: 1.9rem; height: 1.9rem; border-radius: 8px; display: inline-flex;
  align-items: center; justify-content: center; font-weight: 800; margin-right: .55rem; }
.cabecera h1 { color: #fff; margin: 0; font-size: 1.7rem; display: flex; align-items: center; }
.cabecera p { margin: .25rem 0 0; opacity: .95; font-size: 1rem; }
.cabecera svg { display: block; width: 100%; height: 26px; margin-top: .5rem; opacity: .75; }

.tarjeta {
  background: var(--blanco); border: 1px solid #cfe6e8; border-left: 6px solid var(--teal);
  border-radius: 14px; padding: 1rem 1.2rem; margin: .6rem 0;
  box-shadow: 0 2px 10px rgba(14,124,134,.08);
}
.tarjeta .etiqueta { color: var(--gris); font-size: .85rem; text-transform: uppercase; letter-spacing: .06em; }
.numero-grande { font-size: 2.6rem; font-weight: 800; color: var(--teal-osc); line-height: 1.15; word-break: break-all; }
.frase-grande { font-size: 1.35rem; font-weight: 600; color: var(--tinta); line-height: 1.5; }
.pista { color: var(--gris); font-size: .95rem; }

.marcador { display: flex; gap: .6rem; margin: .2rem 0 .6rem; }
.marcador div { flex: 1; background: var(--menta); border-radius: 12px; padding: .45rem .5rem; text-align: center; }
.marcador b { display: block; font-size: 1.35rem; color: var(--teal-osc); }
.marcador span { font-size: .75rem; color: var(--gris); text-transform: uppercase; letter-spacing: .05em; }

.resultado { border-radius: 14px; padding: .9rem 1.1rem; margin: .7rem 0; }
.resultado.ok { background: #e6f6ee; border: 1px solid #a9dcc3; color: #145c3c; }
.resultado.ko { background: #fff5f5; border: 1px solid #f0c4ca; color: var(--tinta); }
.resultado .titulo { font-weight: 700; font-size: 1.05rem; margin-bottom: .3rem; }
.palabra { font-size: 1.5rem; font-weight: 700; letter-spacing: .02em; word-break: break-word; }
.palabra .mal { color: var(--rojo); text-decoration: underline wavy var(--rojo); text-underline-offset: 4px; }
.palabra .bien { color: var(--verde); }
.tuya .extra { color: var(--rojo); text-decoration: line-through; }
.tuya { font-size: 1.1rem; color: var(--gris); }

.bandeja { min-height: 3.2rem; background: #fff; border: 2px dashed #9fcfd2; border-radius: 14px;
  padding: .55rem .7rem; margin: .5rem 0; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
.bandeja .vacia { color: #8fb0b4; font-style: italic; }
.ficha { background: var(--teal); color: #fff; border-radius: 10px; padding: .25rem .7rem; font-weight: 600; }
.cinta { font-size: 1.3rem; font-weight: 600; line-height: 2; }
.cinta .mal { color: var(--rojo); font-weight: 800; text-decoration: underline wavy var(--rojo); text-underline-offset: 5px; }
.cinta .bien { color: var(--verde); font-weight: 800; }
.cinta .sobra { color: #b4570f; text-decoration: line-through; }

.stButton > button, .stFormSubmitButton > button { border-radius: 12px; font-weight: 600; }
.stButton > button[kind="primary"], .stFormSubmitButton > button[kind="primary"] { background: var(--teal); border-color: var(--teal); }
[data-testid="stSidebar"] { background: #e9f6f6; }
"""

ECG = ('<svg viewBox="0 0 400 26" preserveAspectRatio="none"><polyline fill="none" stroke="#fff" '
       'stroke-width="2" stroke-linejoin="round" points="0,13 90,13 100,13 108,4 116,22 124,13 '
       '170,13 180,13 188,2 198,24 208,13 300,13 310,13 318,6 326,20 334,13 400,13"/></svg>')

ACIERTOS = ["¡Muy bien! Diagnóstico acertado.", "¡Sehr gut! Eso estaba perfecto.",
            "¡Excelente! Tu alemán goza de buena salud.", "¡Alles gut! Lo has clavado.",
            "¡Estupendo! Sigue así, doctor/a."]
FALLOS = ["No pasa nada, así se aprende. Mira cómo se escribe:",
          "¡Casi! Cada error es parte de la recuperación. Así es:",
          "Tranquilo/a, ya lo tienes casi. Fíjate en esto:",
          "Un pequeño ajuste y listo. Así se escribe:"]


def inyectar_css() -> None:
    st.markdown(f"<style>{CSS}</style>", unsafe_allow_html=True)


def cabecera(titulo: str, subtitulo: str) -> None:
    st.markdown(
        f'<div class="cabecera"><h1><span class="cruz">✚</span>{html.escape(titulo)}</h1>'
        f'<p>{html.escape(subtitulo)}</p>{ECG}</div>', unsafe_allow_html=True)


def tarjeta(etiqueta: str, contenido_html: str, clase: str = "frase-grande") -> None:
    st.markdown(f'<div class="tarjeta"><div class="etiqueta">{html.escape(etiqueta)}</div>'
                f'<div class="{clase}">{contenido_html}</div></div>', unsafe_allow_html=True)


# ---------------------------------------------------------------- marcador
def _k(juego: str, campo: str) -> str:
    return f"{juego}_{campo}"


def registrar(juego: str, acierto: bool) -> None:
    ss = st.session_state
    ss[_k(juego, "intentos")] = ss.get(_k(juego, "intentos"), 0) + 1
    if acierto:
        ss[_k(juego, "aciertos")] = ss.get(_k(juego, "aciertos"), 0) + 1
        ss[_k(juego, "racha")] = ss.get(_k(juego, "racha"), 0) + 1
    else:
        ss[_k(juego, "racha")] = 0


def marcador(juego: str) -> None:
    ss = st.session_state
    st.markdown(
        '<div class="marcador">'
        f'<div><b>{ss.get(_k(juego, "aciertos"), 0)}</b><span>Aciertos</span></div>'
        f'<div><b>{ss.get(_k(juego, "intentos"), 0)}</b><span>Intentos</span></div>'
        f'<div><b>{ss.get(_k(juego, "racha"), 0)} ♥</b><span>Racha</span></div></div>',
        unsafe_allow_html=True)


def resultado_ok(extra: str = "") -> None:
    st.markdown(f'<div class="resultado ok"><div class="titulo">{random.choice(ACIERTOS)}</div>{extra}</div>',
                unsafe_allow_html=True)


def resultado_ko(contenido_html: str) -> None:
    st.markdown(f'<div class="resultado ko"><div class="titulo">{random.choice(FALLOS)}</div>'
                f'{contenido_html}</div>', unsafe_allow_html=True)


# ---------------------------------------------------------------- comparar texto
def normaliza(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def plegar(s: str) -> str:
    """Equivalencias de teclado español: ae/oe/ue/ss."""
    return (normaliza(s).replace("ä", "ae").replace("ö", "oe")
            .replace("ü", "ue").replace("ß", "ss"))


def evaluar(respuesta: str, correctas: list[str]) -> str:
    """'ok' exacta, 'alt' correcta escrita con ae/oe/ue/ss, 'ko' incorrecta."""
    r = normaliza(respuesta)
    if r in {normaliza(c) for c in correctas}:
        return "ok"
    if plegar(r) in {plegar(c) for c in correctas}:
        return "alt"
    return "ko"


def diff_html(correcta: str, respuesta: str) -> tuple[str, str]:
    """(palabra correcta con las letras falladas en rojo, respuesta del alumno
    con lo que sobra tachado)."""
    a, b = correcta, respuesta.strip()
    sm = difflib.SequenceMatcher(None, a.lower(), b.lower(), autojunk=False)
    ok_a, ok_b = [False] * len(a), [False] * len(b)
    for blk in sm.get_matching_blocks():
        for i in range(blk.size):
            ok_a[blk.a + i] = True
            ok_b[blk.b + i] = True

    def pinta(texto: str, marcas: list[bool], clase: str, visible_espacio: bool) -> str:
        out = []
        for ch, bien in zip(texto, marcas):
            if bien:
                out.append(html.escape(ch))
            else:
                ch_vis = "·" if (ch == " " and visible_espacio) else html.escape(ch)
                out.append(f'<span class="{clase}">{ch_vis}</span>')
        return "".join(out)

    return pinta(a, ok_a, "mal", True), pinta(b, ok_b, "extra", False)


def nota_teclado() -> None:
    st.caption("¿Sin teclado alemán? Puedes escribir ä = ae, ö = oe, ü = ue y ß = ss.")


def separar(frase: str) -> list[str]:
    """Palabras de una frase; la puntuación va pegada a su palabra."""
    return frase.split()
