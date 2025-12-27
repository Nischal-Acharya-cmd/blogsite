# Blog Backend (file uploads + SMTP guide)

This backend accepts file uploads, stores files in `server/uploads`, and supports admin auth.

## Quick start

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET` (do not commit `.env`).
2. Install deps and start the server:

```bash
cd server
npm install
npm run dev
```

## Endpoints

- `POST /api/upload` (form field `file`) — uploads file and returns saved metadata
- `GET /api/files` — lists uploaded file metadata
- `GET /api/files/:id` — returns metadata for a single file
- `GET /uploads/:filename` — serves uploaded files

## Email token login (removed)

The project previously supported a token-based email login flow. That feature has been removed to simplify the codebase.

If you need an email login flow in the future we can reintroduce it with a secure provider and rate-limiting.

## Security

- Validate file types and sizes for uploads.
- Use cloud storage for production storage needs.
- Keep debug features disabled in production — the server will not return codes in API responses.
- Rotate App Passwords if leaked.
