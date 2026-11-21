# SARA · Frontend

Página web de SARA hecha con React 19, Vite 6, Tailwind 4 y HeroUI v3.

## Ejecutar

Abra una terminal aparte de la que usa la API:

```powershell
cd frontend
npm install
npm run dev
```

Luego abra <http://localhost:5173>.

## Conexión con la API

- El inicio de sesión llama a `POST /api/v1/auth/login` con correo y contraseña. Use los usuarios de prueba del README principal; la contraseña es `Sara2026*`.
- La API se busca en `http://127.0.0.1:8000/api/v1`. Para cambiar la dirección, copie `.env.example` como `.env` y ajuste `VITE_API_URL`.
- Si la API no está en ejecución, la pantalla de inicio de sesión ofrece un **modo demostración** para recorrer las pantallas.
