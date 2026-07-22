<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Data fetching

**Prefer Server Components and direct server calls — not `route.ts` wrappers.**

- Load data in **Server Components** by calling functions in `lib/` (e.g. `lib/collaboration/service.ts`) directly.
- Pass fetched data to Client Components via **props** when interactivity is needed.
- Use **Server Actions** for mutations from forms or client UI when appropriate.
- Do **not** add `app/api/**/route.ts` just to expose read/write helpers that only the app uses internally. That pattern adds an extra HTTP hop and duplicates logic already in `lib/`.
- Reserve `route.ts` for cases that truly need an HTTP endpoint: webhooks, third-party callbacks, file uploads consumed externally, or other cross-origin clients.
<!-- END:nextjs-agent-rules -->
