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
| **¿Sein o haben?** | (Tema 3 y 3.5) Elige el auxiliar del Perfekt de cada verbo; si fallas, ves la regla y el Partizip II. |
| **El Perfekt en una frase** | (Tema 3 y 3.5) Dado el infinitivo y el pronombre, escribe auxiliar + Partizip II; o completa frases del temario. |
| **La hora** | (Tema 3) Te sale una hora y la escribes en alemán: formal (24 h) o coloquial (halb, Viertel nach/vor…). |
| **Vocabulario: artículo y plural** | (Tema 3.5) Bebidas, restaurante, ciudad y transporte: der/die/das y plural. |
| **Conjuga el verbo** | (Tema 3) Escribe la forma de können, müssen, mögen, möchten, o el Präteritum de sein y haben. |
| **El verbo modal en la frase** | (Tema 3) Elige el modal que falta en la frase, o qué modal expresa capacidad, obligación, gusto o deseo. |
| **Wie oft? (frecuencia)** | (Tema 3) Todos los grupos de expresiones de frecuencia: número de veces (einmal, zweimal…), unidad (pro Tag, pro Woche, im Monat, im Jahr) y habituales (jeden Tag, jede Woche, jedes Wochenende). Tres modos: la expresión, combinar número + unidad y responder a «Wie oft…?» con una frase. |
| **Sein, haben, war, hatte** | (Tema 3) Combina bin / habe / war / hatte en frases: elige la forma que falta (presente o Präteritum, sein o haben) o escribe la frase entera. |
| **Participios por grupos** | (Tema 3) Los 25 verbos del Perfekt agrupados por cómo forman el Partizip II: ge-…-t, prefijo + ge, sin ge-, vocal que no cambia, ei → ie, cambio a o y cambio a u / a. Tres modos: mezclado, grupo a grupo (los del mismo patrón seguidos) y «¿qué grupo?». |
| **Modal + infinitivo** | (Tema 3) El modal en la posición 2 y el infinitivo al final: elige la frase bien ordenada, escríbela desde el español o elige la pregunta bien formada (modal en posición 1). |
| **¿Cómo se dice?** | (Tema 3.5) Vocabulario de bebidas, carta, mesa, ciudad y transporte y frases del restaurante: del español al alemán (con artículo), del alemán al español y frases elegidas o escritas. |
| **Aduso** | ¿Dónde va el verbo, en la posición 1 o en la 2? Frase afirmativa, adverbio de tiempo o de lugar al inicio, pregunta de sí/no, pregunta con palabra W e imperativo. |
| **TeKaMoLo** | Ordena los bloques de tiempo, causa, modo y lugar de una frase completa. Si aciertas sale **TEKAMOLO!!!!!!**; si no, la palabra que formaste (KATEMOLO, MOLOKATE…) y «Da fehlt noch etwas!». |

Sin teclado alemán se acepta `ae/oe/ue/ss` en lugar de `ä/ö/ü/ß`.

## Registro de accesos

Botón pequeño **?** (abajo a la derecha) que muestra todos los accesos: nombre, fecha, hora,
dispositivo, juego y **progreso** (cada 5 intentos: aciertos y racha). El botón **«👥 Qué falta a cada alumno»** del panel muestra, por alumno, qué apartados ha practicado (✅), abierto (👀) o no ha tocado (❌). Está protegido con un **PIN** que solo conoces tú. Los accesos se guardan en una
hoja de Google de tu Drive. Está **desactivado** hasta que pongas `REGISTRO_URL`; los pasos
(3 minutos) están en [`registro/LEEME.md`](registro/LEEME.md). Cuando está activo, la app pide el
nombre del alumno al entrar y le avisa de que el profesor verá sus accesos.

En el inicio, **↻ Recargar** trae siempre la última versión (borra la copia guardada) y **Cerrar sesión** olvida el nombre de este dispositivo (el marcador se conserva).

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

Semanas actuales: 1 = Temas 0, 0.5 y 1 · 2 = Tema 2 · 3 = Tema 2.5 · 4 = Tema 3 · 5 = Tema 3.5.

## Pruebas

```bash
node tests/test_numeros.js     # números contra los ejemplos del temario
node tests/test_hora.js        # la hora contra los ejemplos del Tema 3
npm i jsdom && node tests/test_juegos.js && node tests/test_registro.js   # juegos y registro simulando toques
```

> Existe también una versión en Python (Streamlit) con los mismos juegos, guardada en local en la carpeta `Deutschavi_python`.
