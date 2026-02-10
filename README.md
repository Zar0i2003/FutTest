# FutVote

Modern full-stack application for voting for the best football player.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion-ready UI patterns
- **Backend:** Flask, Flask-SQLAlchemy, Flask-CORS, SQLite

## Project structure

```text
backend/
  app.py
  requirements.txt
frontend/
  src/app/
  src/components/
  src/lib/
```

## Run locally

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Backend starts on `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend starts on `http://localhost:3000`.

## Features

- Beautiful minimal homepage with scroll-based flying football animation
- Candidate cards section populated from backend
- Vote page with login/register flow
  - unique username validation
  - repeated password check during registration
- Admin panel
  - admin authentication
  - create candidate cards (photo, gender, age, description)
  - view votes with voter username and selected player
- One vote per user (vote can be updated)
