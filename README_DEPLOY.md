Production deployment notes

Overview
- Frontend: Vite React app (built to `dist`). Recommended deploy: Vercel (static site).
- Backend: Express + MongoDB API in `server/index.js`. Recommended deploy: Render (web service).

Vercel (frontend)
1. Create a new project in Vercel, link the Git repo.
2. In project settings > Environment Variables, add:
   - `VITE_API_BASE_URL` = `https://<your-render-backend>/` (include protocol)
3. Build command: `npm run build`
   Output directory: `dist`
4. Deploy.

Render (backend)
1. Create a new Web Service in Render.
2. Use `render.yaml` or configure via the dashboard.
3. Set environment variables in Render:
   - `MONGO_URI` (production connection string)
   - `MONGO_DB_NAME` (e.g., orasnap)
   - `JWT_SECRET` (strong secret)
4. Start command: `npm start`

Local development with mock API
1. Start mock API: `npm run mock:api`
2. In another terminal: `npm run dev`
3. Open `http://localhost:8082` (Vite may choose a different port)

Helpful scripts added
- `npm run mock:api` — start local mock backend
- `npm run dev` — start Vite dev server
- `npm run build` — build frontend to `dist`
- `npm start` — start Express backend (used by Render)

Notes
- Ensure `VITE_API_BASE_URL` points to your backend URL in production.
- For Vercel serverless functions (alternative), move backend endpoints into `/api` and adapt Express handlers to serverless.
