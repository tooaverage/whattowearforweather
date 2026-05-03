# Security

## Threat model (what's actually at risk here)

This is a static, single-screen weather app. There is **no backend, no
authentication, no database, no PII, and no API keys** — Open-Meteo is
keyless. That makes the attack surface narrow:

| Risk | Mitigation |
| --- | --- |
| Secret accidentally committed to the public repo | Pre-flight scan + CI secret-pattern grep + GitHub Push Protection (enable in repo settings → Code security → Secret scanning → Push protection) |
| Open-Meteo response gets weird (NaN, Infinity, strings, missing fields) | Defensive `num()`/`clamp()` coercion at the adapter boundary; a second `sanitizePoint()` pass at the engine boundary; 22 dedicated security tests |
| HTML/CSS injection through the rendered weather labels | All user-influenced strings go through an HTML-escape helper before `innerHTML`; layer-recipe strings are static |
| Page exfiltrating data or loading third-party trackers | `Content-Security-Policy` meta tag locks `connect-src` to `https://api.open-meteo.com`; `default-src 'none'`; no images, no frames |
| Browser leaks the source page in `Referer` header | `<meta name="referrer" content="no-referrer">` and `referrerPolicy: 'no-referrer'` on the fetch |
| Repo cloned, package install runs malicious script | `npm ci` runs in CI with no install scripts beyond the locked dep tree |

## What CI enforces on every push

[`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. `tsc -b` — type-check.
2. `npm test` — 47 unit tests including the security suite in
   [`src/engine/security.test.ts`](src/engine/security.test.ts) that throws
   `NaN`, `Infinity`, `undefined`, HTML payloads, and SQL-shaped strings at the
   engine and verifies it neither throws nor leaks the payload into output.
3. `vite build` — production build.
4. **Secret-pattern grep** — fails the build if AWS keys, GitHub PATs,
   Anthropic/OpenAI tokens, Slack tokens, Google API keys, private-key headers,
   or generic `password=…` literals appear in tree.
5. **Suspicious-filename grep** — fails if `.env`, `*.pem`, `*.key`,
   `credentials.json`, etc., are added.

## What you should also enable

The repo settings these workflows can't touch:

- **Settings → Code security → Secret scanning → Push protection.** This
  blocks pushes that contain known token formats *before* they reach the
  remote. Free for public repos.
- **Settings → Branches → Add rule → Require status checks to pass.** Wire it
  to the CI job above so a failing secret scan blocks merge to main.
- **Settings → Code security → Dependabot alerts + security updates.**
  Auto-PRs for dependency CVEs.

## Standalone preview specifics

[`standalone.html`](standalone.html) is the single-file build served via
htmlpreview. Its hardening:

- CSP meta:
  ```
  default-src 'none';
  script-src 'unsafe-inline';
  style-src 'unsafe-inline';
  connect-src https://api.open-meteo.com;
  img-src 'none';
  base-uri 'none';
  form-action 'none';
  frame-ancestors 'none';
  ```
  `'unsafe-inline'` is required because the bundle is one inline `<script>`
  and one inline `<style>`. Tightening to a hash- or nonce-based CSP would
  require a build step that emits the hash; not done because the threat
  model doesn't justify the complexity.
- All numeric values from the API are coerced via `num()` and clamped to
  physical ranges (RH 0–100, wind ≥ 0, etc.) before any arithmetic or DOM
  insertion.
- All string interpolation into `innerHTML` goes through `esc()`.
- Style-attribute heights are clamped to `[0, 100]` and `toFixed(2)`'d so
  CSS injection through arithmetic is impossible.
- `referrer="no-referrer"` and `cache: 'no-store'` on the API fetch.

## If you suspect a secret leaked

1. Rotate it immediately at the issuing service. Removing it from git
   history is **not** rotation — assume any commit pushed to a public repo is
   forever public.
2. Force-push history rewrite is acceptable only if you're certain no one
   else has cloned the bad commit. For a one-author public repo the practical
   answer is rotate-and-move-on.
3. Open an issue describing what was leaked and what was rotated.

## Reporting

Found something? Open a private security advisory at
<https://github.com/tooaverage/whattowearforweather/security/advisories/new>.
