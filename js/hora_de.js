// La hora en alemán según el Tema 3.
//  - Formal (24 h): "Es ist vierzehn Uhr dreißig."
//  - Coloquial (12 h): en punto, Viertel nach, halb + hora siguiente, Viertel vor, fünf/zehn nach/vor.
(function (root) {
  const N = typeof module !== "undefined" && module.exports ? require("./numeros_de.js") : root.NumerosDe;
  const p2 = (n) => String(n).padStart(2, "0");

  // Horas y minutos que se preguntan (solo lo que enseña el temario)
  const HORAS_FORMAL = Array.from({ length: 22 }, (_, i) => i + 2);   // 2-23
  const MIN_FORMAL = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const HORAS_COLOQUIAL = Array.from({ length: 10 }, (_, i) => i + 2); // 2-11
  const MIN_COLOQUIAL = [0, 5, 10, 15, 30, 45, 50, 55];

  const conEsIst = (t) => [`Es ist ${t}`, t];

  function formal(h, m) {
    const t = `${N.palabra(h)} Uhr` + (m ? ` ${N.palabra(m)}` : "");
    return conEsIst(t);
  }

  function coloquial(h, m) {
    const W = N.palabra, sig = h + 1;
    switch (m) {
      case 0: return [...conEsIst(W(h)), ...conEsIst(`${W(h)} Uhr`)];
      case 5: return conEsIst(`fünf nach ${W(h)}`);
      case 10: return conEsIst(`zehn nach ${W(h)}`);
      case 15: return conEsIst(`Viertel nach ${W(h)}`);
      case 30: return conEsIst(`halb ${W(sig)}`);
      case 45: return conEsIst(`Viertel vor ${W(sig)}`);
      case 50: return conEsIst(`zehn vor ${W(sig)}`);
      case 55: return conEsIst(`fünf vor ${W(sig)}`);
      default: throw new Error("minutos no previstos: " + m);
    }
  }

  const texto = (h, m) => `${p2(h)}:${p2(m)}`;
  const api = { formal, coloquial, texto, HORAS_FORMAL, MIN_FORMAL, HORAS_COLOQUIAL, MIN_COLOQUIAL };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HoraDe = api;
})(typeof window !== "undefined" ? window : globalThis);
