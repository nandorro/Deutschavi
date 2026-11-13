"""Deutschavi · Alemán A1 para estudiantes de Medicina.
Ejecutar en local:  streamlit run app.py
"""
import streamlit as st

st.set_page_config(page_title="Deutschavi · Alemán para Medicina", page_icon="🩺",
                   layout="centered")

from core import ui  # noqa: E402

ui.inyectar_css()

navegacion = st.navigation([
    st.Page("paginas/inicio.py", title="Inicio", icon="🏥", default=True),
    st.Page("paginas/numeros.py", title="Números", icon="🔢"),
    st.Page("paginas/verbos.py", title="Verbos separables", icon="🧩"),
    st.Page("paginas/frases.py", title="Frases desordenadas", icon="🧵"),
    st.Page("paginas/mayusculas.py", title="¿Qué mayúscula falta?", icon="🔠"),
])
navegacion.run()
