# AgentTesting

This repository contains a minimal full-stack setup with a Node.js + Express backend and a React frontend written in TypeScript using Vite.

## Getting started

### Backend

```bash
cd server
npm install
npm run dev
```

The API is exposed on `http://localhost:4000` with a health check available at `/api/health`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the Express backend.
