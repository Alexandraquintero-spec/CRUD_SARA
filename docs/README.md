# Documentación del proyecto SARA

| Archivo | Contenido |
|---|---|
| `SARA_API.postman_collection.json` | Colección Postman con 140 pruebas de éxito y de error, organizadas en 11 carpetas |
| `G<n>_Anexo1_<nombre>.pdf` … `G<n>_Anexo6_<nombre>.pdf` | Anexos del proyecto, cada uno en un PDF aparte (pendiente de agregar) |

Los anexos 5 (Manual de configuración de la base de datos) y 6 (Manual técnico) se basan en los scripts de `database/` y en el `README.md` de la raíz.

## Ejecutar la colección desde la terminal (opcional)

```powershell
npx newman run docs/SARA_API.postman_collection.json
```

Antes de ejecutarla:

- la base debe estar recién cargada con `database/00` a `03`;
- la API debe estar en ejecución con `VALIDAR_HORARIOS=false`.
