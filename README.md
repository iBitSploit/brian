The frontend was made by the following
---

[![Netlify Status](https://api.netlify.com/api/v1/badges/4156a9a7-a453-4043-b16b-2f9826ddabb0/deploy-status)](https://app.netlify.com/projects/brian-rag/deploys)

I'm no software engineer, not even a dev

After asking DeekSeek about what the best option for to me pick for a frontend that would be most easy for an AI ti understand

I ended up picking `Vite` with `React Typescript`, using `Oxlint`

```sh
pnpm create vite --template react-ts --no-eslint --no-immediate ./frontend
cd frontend
pnpm install
```

Ending up with the following dependencies at the time of development

```sh
dependencies:
+ react 19.3.0
+ react-dom 19.3.0

devDependencies:
+ @types/node 24.13.6 (26.6.2 is available)
+ @types/react 19.3.0
+ @types/react-dom 19.3.0
+ @vitejs/plugin-react 6.1.1
+ oxlint 1.85.0
+ typescript 6.0.3 (7.0.2 is available)
+ vite 8.3.1
```

and honestly I trusted DeepSeek for this information...

However, I'm uncertain about the backend...Python or Go! ? :think:
but....I beleive after thinking and researching that...actually Python would be my better option for a backend...
however, I believe my agents would best be with Go!....or Rust?, lol I like fast and extremely minimal stuff

aaaand for Python, after further researching...I found that most LLMs can write Flask better than any other framework for python
So I've chose that for the main backend...

the microservices...as I said, Go!

```sh
cd backend
uv venv --python 3.14.7
source .venv/bin/activate
uv init
uv add pynetbox
uv add gunicorn
uv add fastapi
```
## Running with Docker

```sh
docker compose up --build
```

- Frontend: http://localhost:8080 (override with `BRIAN_PORT`)
- Backend health: proxied at http://localhost:8080/api/health

Each service can also be built on its own:

```sh
docker build -t brian-frontend ./frontend
docker build -t brian-backend ./backend
```

## Deploying to Netlify

`netlify.toml` at the repository root builds only the frontend (`frontend/`, output `dist/`), adds the SPA fallback redirect, and sets Node 22. Netlify does not run the Docker services; the backend needs its own host before the frontend can call `/api`.
