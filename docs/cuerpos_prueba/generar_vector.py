"""Genera cuerpos JSON para probar el reconocimiento facial de la API SARA.

En el sistema real, la cámara del comedor extrae del rostro un vector de 128
números (los rasgos de la cara) y lo envía a la API; nunca envía la foto.
Para las pruebas, los rostros de los datos de prueba (02_dml.sql) se generaron
con una fórmula fija a partir del id del usuario. Este script usa la misma
fórmula, así que produce el "rostro" de cualquier usuario de prueba.

Uso (desde la carpeta del proyecto, con el venv activo):
  python docs/cuerpos_prueba/generar_vector.py 7
      -> rostro exacto del usuario 7
  python docs/cuerpos_prueba/generar_vector.py 7 --ruido 0.05
      -> el mismo rostro con pequeñas variaciones (como otra foto de la misma persona)
  python docs/cuerpos_prueba/generar_vector.py 7 --registro 21
      -> cuerpo para POST /api/v1/biometria (registrar el rostro del usuario 21)

El archivo queda en docs/cuerpos_prueba/ y en pantalla se muestra la
similitud con el rostro original, para explicar el umbral del 90 %.
"""
import argparse
import json
import math
import os
import random

CARPETA = os.path.dirname(os.path.abspath(__file__))


def vector(semilla: int, dim: int = 128) -> list[float]:
    """Misma fórmula usada en 02_dml.sql y en la colección de Postman."""
    out = []
    for k in range(dim):
        x = math.sin((semilla + 1) * (k + 1) * 12.9898) * 43758.5453
        out.append(round(x - math.floor(x) - 0.5, 6))
    return out


def similitud(a: list[float], b: list[float]) -> float:
    """Similitud coseno de 0 a 100 (la misma que calcula la API en app/core/biometria.py)."""
    punto = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return round(max(0.0, punto / (na * nb)) * 100, 2)


def main() -> None:
    ap = argparse.ArgumentParser(description="Genera vectores faciales de prueba para la API SARA")
    ap.add_argument("semilla", type=int, help="id del usuario de prueba (por ejemplo 7 para aprendiz@sara.edu.co)")
    ap.add_argument("--ruido", type=float, default=0.0, help="variación aleatoria de cada número (0.05 = foto parecida)")
    ap.add_argument("--registro", type=int, help="genera el cuerpo para registrar el rostro de este usuario_id")
    args = ap.parse_args()

    original = vector(args.semilla)
    v = original
    if args.ruido:
        rnd = random.Random(args.semilla * 1000 + int(args.ruido * 1000))
        v = [round(x + rnd.uniform(-args.ruido, args.ruido), 6) for x in original]

    if args.registro:
        cuerpo = {"usuario_id": args.registro, "vector_facial": v, "autorizacion_firmada": True}
        nombre = f"registro_usuario_{args.registro}.json"
    else:
        cuerpo = {"vector_facial": v}
        nombre = f"facial_usuario_{args.semilla}" + (f"_ruido_{args.ruido}" if args.ruido else "") + ".json"

    ruta = os.path.join(CARPETA, nombre)
    with open(ruta, "w", encoding="utf8") as f:
        json.dump(cuerpo, f, separators=(",", ":"))
    print(f"Archivo creado: {ruta}")
    print(f"Similitud con el rostro original: {similitud(original, v)} %  (la API acepta desde 90 %)")


if __name__ == "__main__":
    main()
