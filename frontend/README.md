# Frontend Simple - Search Service (IAW)

Frontend desarrollado con **React básico** (Vite + JavaScript/JSX) para consumir todos los endpoints de la API NestJS (`Sites` y `Snapshots`).

Diseñado de forma clara y directa, utilizando únicamente:
- Componentes funcionales simples
- Hooks elementales (`useState`, `useEffect`)
- `fetch` nativo del navegador
- CSS limpio sin dependencias adicionales

---

## Cómo ejecutar

1. **Asegurarse de tener el backend corriendo:**
   ```bash
   cd ../backend
   npm run start:dev
   ```
   *(El backend corre en `http://localhost:3000` con CORS habilitado).*

2. **Iniciar el servidor de desarrollo del frontend:**
   ```bash
   npm run dev
   ```
   El frontend estará accesible en `http://localhost:5173`.

3. **Para compilar a producción:**
   ```bash
   npm run build
   ```

---

## Endpoints implementados

### Sitios (`/api/sites`)
- `GET /api/sites`: Listar todos los sitios registrados.
- `POST /api/sites`: Crear un nuevo sitio (`name`, `url`, `depth`, `frequency`, `status`).
- `PATCH /api/sites/:id`: Modificar campos de un sitio existente.
- `DELETE /api/sites/:id`: Eliminar un sitio.
- `GET /api/sites/:id/snapshots`: Ver los snapshots vinculados al sitio.

### Snapshots (`/api/snapshots`)
- `GET /api/snapshots`: Listar todos los snapshots.
- `GET /api/snapshots?siteId=:siteId`: Filtrar snapshots por el sitio seleccionado.
- `POST /api/snapshots`: Crear un snapshot asignándole un sitio (`siteId`, `duration`, `docCount`, `status`).
- `PATCH /api/snapshots/:id`: Modificar un snapshot.
- `DELETE /api/snapshots/:id`: Eliminar un snapshot.
