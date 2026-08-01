# Contributing

Thanks for your interest in improving Bangla Call!

## Development setup

See [README.md](./README.md) for full setup. In short:

```bash
npm install
cp .dev.vars.example .dev.vars
npm run cf:dev   # full stack; the schema self-initializes
npm run build && npm run cf:dev
```

## Before you open a PR

- **Lint (ESLint, flat config):**
  ```bash
  npm run lint        # eslint src worker  (0 warnings expected)
  npm run lint:fix    # auto-fix (removes unused imports, etc.)
  ```
- **Typecheck both projects** (they use separate tsconfigs):
  ```bash
  npm run typecheck   # tsc for src/ and worker/
  ```
- **Build must pass:** `npm run build`.
- **Run the endpoint tests:** `npm test` (boots the Worker locally with
  `unstable_dev` + local D1/KV/R2 and exercises every API).
- Keep the frontend and Worker boundaries clean — the Worker runs on the Workers
  runtime, so no Node-only APIs (`fs`, `path`, native modules). Use Web Crypto,
  `fetch`, D1/KV/R2 bindings.

## Conventions

- API request/response bodies are `camelCase`; the D1 schema is `snake_case`
  (mapped in the router).
- Validate all new write endpoints with Zod (`worker/lib/validation.ts`).
- Never return secret values to clients. Add new secret keys to
  `SECRET_SETTING_KEYS` in `worker/lib/settings.ts`.
- New user-facing strings should be provided in both Bengali (`bn`) and English (`en`).
- Prefer the shared components: `KeyboardField`, `CopyButton`, `CameraCapture`, and
  the `copyToClipboard` / WhatsApp formatter helpers in `src/lib/`.

## Reporting security issues

Do not open public issues for vulnerabilities — see [SECURITY.md](./SECURITY.md).
