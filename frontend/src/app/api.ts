/**
 * Cliente mínimo de la API SARA (FastAPI + PostgreSQL).
 * La URL se configura con VITE_API_URL (ver frontend/.env.example).
 */
import type { User } from "./types";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000/api/v1";

const CLAVE_SESION = "sara.tokens";

interface Tokens {
  access_token: string;
  refresh_token: string;
  rol: string;
}

interface UsuarioApi {
  id: number;
  nombre_completo: string;
  tipo_documento: "CC" | "TI" | "CE" | "PP";
  numero_documento: string;
  rol: "administrador" | "instructor" | "aprendiz";
  aprendiz: { ficha_numero: string; tipo: string } | null;
}

export class ErrorApi extends Error {
  constructor(public status: number, mensaje: string) {
    super(mensaje);
  }
}

async function solicitud<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: { "Content-Type": "application/json", ...(opciones.headers ?? {}) },
    });
  } catch {
    throw new ErrorApi(0, "No se pudo conectar con la API. Verifique que esté en ejecución.");
  }
  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, cuerpo?.error?.mensaje ?? "Ocurrió un error inesperado.");
  }
  return cuerpo as T;
}

function aUsuarioFrontend(u: UsuarioApi): User {
  return {
    id: String(u.id),
    name: u.nombre_completo,
    role: u.rol === "administrador" ? "admin" : u.rol,
    ficha: u.aprendiz?.ficha_numero,
    beneficiary: u.aprendiz?.tipo === "beneficiario",
    documentType: u.tipo_documento === "CC" || u.tipo_documento === "TI" ? u.tipo_documento : undefined,
    documentNumber: u.numero_documento,
  };
}

/** Inicia sesión con correo y contraseña y devuelve el usuario autenticado. */
export async function iniciarSesion(correo: string, contrasena: string): Promise<User> {
  const tokens = await solicitud<Tokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, contrasena }),
  });
  try {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(tokens));
  } catch {
    /* almacenamiento no disponible: la sesión dura mientras la pestaña esté abierta */
  }
  const yo = await solicitud<UsuarioApi>("/auth/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  return aUsuarioFrontend(yo);
}

export function cerrarSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    /* sin almacenamiento */
  }
}
