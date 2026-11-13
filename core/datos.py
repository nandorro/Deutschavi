"""Carga del contenido (datos/*.json) filtrado por la semana desbloqueada."""
import json
from functools import lru_cache
from pathlib import Path

from config import SEMANA_ACTUAL

RAIZ = Path(__file__).resolve().parent.parent / "datos"


@lru_cache(maxsize=None)
def _cargar(nombre: str) -> list[dict]:
    with open(RAIZ / nombre, encoding="utf8") as f:
        return json.load(f)


def frases() -> list[dict]:
    return [x for x in _cargar("frases.json") if x["semana"] <= SEMANA_ACTUAL]


def verbos() -> list[dict]:
    return [x for x in _cargar("verbos_separables.json") if x["semana"] <= SEMANA_ACTUAL]
