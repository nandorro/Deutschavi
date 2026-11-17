# Registro de accesos (hoja de Google)

La app guarda cada acceso en una hoja de cálculo de **tu** Google Drive. El botón **?** de la
esquina de la app muestra ese registro, pero solo si escribes tu PIN.

Se registra: fecha, hora, nombre del alumno, tipo de dispositivo, navegador/sistema y juego.

## Instalación (una sola vez, unos 3 minutos)

1. Crea una **hoja de cálculo nueva** en Google Drive (por ejemplo «Deutschavi · accesos»).
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega todo el contenido de
   [`Codigo.gs`](Codigo.gs). Guarda.
3. **Tu PIN:** en Apps Script, icono de engranaje (*Configuración del proyecto*) →
   *Propiedades de la secuencia de comandos* → *Añadir propiedad*:
   nombre `PIN`, valor el que quieras (por ejemplo 6 cifras).
4. **Implementar → Nueva implementación** → tipo *Aplicación web*:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   Autoriza los permisos que pide Google y copia la **URL de la aplicación web**
   (termina en `/exec`).
5. Pega esa URL en la configuración de la app:
   - Web (JavaScript): `window.REGISTRO_URL` en `js/config.js`
   - Python: `REGISTRO_URL` en `config.py`

Mientras `REGISTRO_URL` esté vacío, el registro está desactivado (la app no pide nombre).

## Cosas a saber

- Si cambias `Codigo.gs`, hay que hacer *Implementar → Gestionar implementaciones → editar →
  Nueva versión*; la URL no cambia.
- La URL de la aplicación web es pública (está en el código de la web): cualquiera podría
  enviar filas falsas, pero **no leer** nada sin el PIN. Para cambiar el PIN, edita la propiedad.
- Los alumnos ven un aviso de que el profesor verá cuándo acceden.
- En la hoja puedes filtrar, ordenar y exportar como Excel o CSV.
