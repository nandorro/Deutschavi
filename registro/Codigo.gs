/**
 * Registro de accesos de Deutschavi (Google Apps Script, ligado a una Hoja de cálculo).
 * Pasos de instalación: ver LEEME.md
 *
 * - Cada acceso se añade como una fila en la hoja "Accesos".
 * - Leer el registro exige el PIN guardado en las "Propiedades del script" (clave: PIN).
 *   El PIN nunca está en el código de la web: solo en Google.
 */
const HOJA = "Accesos";
const COLUMNAS = ["Fecha", "Hora", "Nombre", "Dispositivo", "Navegador / sistema", "Evento", "Detalle"];
const MAX_FILAS_LECTURA = 500;
const MAX_FALLOS = 5;
const MINUTOS_BLOQUEO = 15;

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.insertSheet(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold").setBackground("#e1f2f2");
  }
  return h;
}

// Texto seguro para la hoja: recorta y evita que una celda se interprete como fórmula.
function limpia_(valor, max) {
  let s = String(valor == null ? "" : valor).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = " " + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, mensaje: "Registro de Deutschavi activo" });
}

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "datos" });
  }

  // ---- Leer el registro (solo con PIN)
  if (d.accion === "leer") {
    const props = PropertiesService.getScriptProperties();
    const ahoraMs = Date.now();
    if (Number(props.getProperty("BLOQUEO_HASTA") || 0) > ahoraMs) return json_({ ok: false, error: "bloqueado" });
    const pin = props.getProperty("PIN");
    if (!pin || String(d.pin || "") !== pin) {
      // 5 fallos seguidos bloquean la lectura 15 minutos (frena adivinar el PIN)
      const fallos = Number(props.getProperty("FALLOS") || 0) + 1;
      if (fallos >= MAX_FALLOS) {
        props.setProperty("BLOQUEO_HASTA", String(ahoraMs + MINUTOS_BLOQUEO * 60000));
        props.setProperty("FALLOS", "0");
      } else {
        props.setProperty("FALLOS", String(fallos));
      }
      return json_({ ok: false, error: "pin" });
    }
    props.setProperty("FALLOS", "0");
    const h = hoja_();
    const ultima = h.getLastRow();
    const total = Math.max(0, ultima - 1);
    if (total === 0) return json_({ ok: true, total: 0, filas: [] });
    const desde = Math.max(2, ultima - MAX_FILAS_LECTURA + 1);
    const filas = h.getRange(desde, 1, ultima - desde + 1, COLUMNAS.length).getDisplayValues().reverse();
    return json_({ ok: true, total: total, filas: filas });
  }

  // ---- Añadir un acceso
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ahora = new Date();
    const zona = Session.getScriptTimeZone();
    hoja_().appendRow([
      Utilities.formatDate(ahora, zona, "yyyy-MM-dd"),
      Utilities.formatDate(ahora, zona, "HH:mm:ss"),
      limpia_(d.nombre, 60),
      limpia_(d.dispositivo, 30),
      limpia_(d.agente, 200),
      limpia_(d.evento, 40),
      limpia_(d.detalle, 100),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
