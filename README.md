# Deutschavi 🩺

Juegos de alemán A1 para estudiantes de Medicina. Todo el contenido sale del
temario del curso; no se añade nada que no esté ahí.

**Web:** https://nandorro.github.io/Deutschavi/ · Funciona en el móvil y se puede
añadir a la pantalla de inicio del iPhone (Safari → Compartir → *Añadir a pantalla de inicio*).

## Juegos

| Juego | Qué hace |
|---|---|
| **Números** | Sale una cifra; la escribes en alemán. Si fallas, se muestra la palabra correcta con las letras falladas en rojo. El nivel sube solo con la racha: 5 aciertos seguidos → centenas, 10 → miles, 15 → cien miles, 20 → millones (un fallo vuelve al inicio). |
| **Verbos separables** | Completa la frase con el prefijo, o elige el prefijo de un verbo. |
| **Frases desordenadas** | Toca las palabras para ordenar la frase. |
| **¿Qué mayúscula falta?** | Fácil: falta una. Avanzado: marca todas las que llevan mayúscula. |

Sin teclado alemán se acepta `ae/oe/ue/ss` en lugar de `ä/ö/ü/ß`.

## Es una web estática

HTML + CSS + JavaScript, sin servidor ni instalación. GitHub Pages sirve los archivos tal cual;
cada `git push` a `main` actualiza la web en un minuto. En local basta abrir `index.html`.

## Ampliar cada semana

- **Desbloquear la semana siguiente:** subir `SEMANA_ACTUAL` en [`js/config.js`](js/config.js).
- **Añadir ejercicios:** editar [`datos/frases.js`](datos/frases.js) y [`datos/verbos_separables.js`](datos/verbos_separables.js).
  Cada elemento lleva su campo `"semana"`:
  - frases: `{"de": "...", "es": "...", "semana": 4, "alt": ["otro orden válido"]}`
    (la misma lista sirve para *Frases desordenadas* y *¿Qué mayúscula falta?*).
  - verbos: `{"infinitivo", "prefijo", "base", "es", "semana", "frases": [...]}`
    (la frase debe terminar con el prefijo).
- **Números:** el generador (`js/numeros_de.js`) cubre 0 – 9.999.999; los niveles se definen en `js/numeros.js`.

Semanas actuales: 1 = Temas 0, 0.5 y 1 · 2 = Tema 2 · 3 = Tema 2.5.

## Pruebas

```bash
node tests/test_numeros.js     # números contra los ejemplos del temario
npm i jsdom && node tests/test_juegos.js   # los 4 juegos simulando toques
```

> Existe también una versión en Python (Streamlit) con los mismos juegos, guardada en local en la carpeta `Deutschavi_python`.
