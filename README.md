# MathMaster

MathMaster is a student-built math learning ecosystem that combines guided course pathways, quizzes, AI support, accessibility tools, and peer community support.

## Package Manager Policy

This repository is standardized on `npm`.

- Use `npm install` to install dependencies.
- Use `npm run dev` for local development.
- Do not commit `pnpm-lock.yaml` in this repo.
- Vercel is pinned to npm through `vercel.json` to avoid package-manager autodetect conflicts.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core Routes

- `/learn` - guided course-aware learning hub (also aliased by `/resources`)
- `/dashboard` - progress, recommendations, and community spotlight
- `/community` - Q&A and collaboration
- `/study-groups` - peer group discovery
- `/schedule` - sessions and office hours

## Deployment

Deploy on Vercel using the standard project setup. Build/install commands are defined in `vercel.json`:

- `installCommand`: `npm install`
- `buildCommand`: `npm run build`
