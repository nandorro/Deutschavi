# Deutschavi 🩺

Juegos de alemán A1 para estudiantes de Medicina. Todo el contenido sale del
temario del curso (carpeta local `Deutschavi`); no se añade nada que no esté ahí.

## Juegos

| Juego | Qué hace |
|---|---|
| **Números** | Sale una cifra; la escribes en alemán. Si fallas, se muestra la palabra correcta con las letras falladas en rojo. |
| **Verbos separables** | Completa la frase con el prefijo, o elige el prefijo de un verbo. |
| **Frases desordenadas** | Toca las palabras para ordenar la frase. |
| **¿Qué mayúscula falta?** | Fácil: falta una. Avanzado: marca todas las que llevan mayúscula. |

Sin teclado alemán se acepta `ae/oe/ue/ss` en lugar de `ä/ö/ü/ß`.

## Ejecutar en local

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Publicar (URL pública)

1. Entrar en <https://share.streamlit.io> con la cuenta de GitHub.
2. *Create app* → repositorio `nandorro/Deutschavi`, rama `main`, archivo `app.py`.
3. Streamlit da una URL que se puede compartir con los alumnos. Cada `git push` la actualiza sola.

## Ampliar cada semana

- **Desbloquear la semana siguiente:** subir `SEMANA_ACTUAL` en [`config.py`](config.py).
- **Añadir ejercicios:** editar los JSON de [`datos/`](datos). Cada elemento lleva su campo `"semana"`:
  - `frases.json`: `{"de": "...", "es": "...", "semana": 4, "alt": ["otro orden válido"]}`
    (la misma lista sirve para *Frases desordenadas* y *¿Qué mayúscula falta?*).
  - `verbos_separables.json`: `{"infinitivo", "prefijo", "base", "es", "semana", "frases": [...]}`
    (la frase debe terminar con el prefijo).
- **Números:** el generador (`core/numeros_de.py`) ya cubre 0 – 9.999.999; los niveles se definen en `paginas/numeros.py`.

Semanas actuales: 1 = Temas 0, 0.5 y 1 · 2 = Tema 2 · 3 = Tema 2.5.

## Pruebas

```bash
python tests/test_numeros.py     # números contra los ejemplos del temario
python tests/test_paginas.py     # los 4 juegos simulando clics
```
