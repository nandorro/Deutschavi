import streamlit as st

from config import SEMANA_ACTUAL
from core import ui

ui.cabecera("Deutschavi", "Alemán A1 para estudiantes de Medicina")

st.markdown("### Guten Tag! Wie geht es dir?")
st.write("Bienvenido/a a tu consulta de alemán. Aquí practicarás con calma lo que ya has "
         "visto en clase: cada ejercicio sale del temario, sin sorpresas. "
         "Equivocarse forma parte del tratamiento. ¡Ánimo!")

st.info(f"🩺 Contenido desbloqueado: **semana {SEMANA_ACTUAL}**. "
        "Cada semana se añade material nuevo a medida que avanzáis.")

JUEGOS = [
    ("paginas/numeros.py", "Números", "🔢", "Te aparece una cifra y la escribes en alemán. "
     "Si fallas, verás en rojo las letras que se te escaparon."),
    ("paginas/verbos.py", "Verbos separables", "🧩", "Completa la frase con el prefijo que "
     "se va al final (aufstehen → ich stehe … auf)."),
    ("paginas/frases.py", "Frases desordenadas", "🧵", "Ordena las palabras para formar la "
     "frase correcta (¡y recuerda dónde va el verbo!)."),
    ("paginas/mayusculas.py", "¿Qué mayúscula falta?", "🔠", "En alemán todos los sustantivos "
     "llevan mayúscula. ¿Sabes cuáles?"),
]
for ruta, titulo, icono, texto in JUEGOS:
    with st.container(border=True):
        st.markdown(f"#### {icono} {titulo}")
        st.write(texto)
        st.page_link(ruta, label=f"Jugar a {titulo}", icon="🩺")

st.caption("Bis bald! — ¡Hasta pronto!")
