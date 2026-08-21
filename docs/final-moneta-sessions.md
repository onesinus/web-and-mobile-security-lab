# Final Assessment: Moneta Bank Penetration Sprint

## Why a brand-new target?

The whole point of the final sessions is for students to **prove** they can find
and exploit real vulnerabilities. Re-using Juice Shop or the semester labs fails
that test — every answer is one Google search away, and the hint system gives it
away.

**Moneta Bank is a custom-built, fictional online banking app that has never
existed before this repo.** There are no write-ups, no walkthroughs, no hints.
Any answer students produce can only come from what they actually learned this
semester.

## Architecture

| Service | URL | Port (host) |
|---------|-----|-------------|
| Moneta Bank Web App | http://localhost:4000 | 4000 |
| Moneta Bank PostgreSQL (internal-only) | only on `internal` network | 5433 |
| Existing Juice Shop / Vulnerable API | as before | 3000 / 8888 |

Rules of the engagement:
- Target the `moneta-bank` container and the `internal` Docker network (service name: `moneta-bank`, `moneta-db`)
- Inside containers use `http://moneta-bank:8080` or `http://moneta-db:5432`
- **No DoS, no destroying data**, no attacking other students' containers
- A flag is only valid with a proof: screenshot of the request + the response showing the flag

## Built-in Vulnerabilities (by OWASP category)

| # | Category | Where | What to look for |
|---|----------|-------|------------------|
| 1 | A01 Broken Access Control (IDOR) | `GET /api/accounts/:accountNumber/statement` | Try other account numbers, e.g. `MB-1000-0002` — no ownership check |
| 2 | A03 Injection (SQLi) | `GET /api/transactions/search?q=` | UNION-based; dump customers table (admin password hash, SSN) |
| 3 | A04 Insecure Design / Business Logic | `POST /api/transfer` | Negative amounts, transferring from someone else's account ID |
| 4 | A05 Security Misconfiguration | `GET /auth/debug` | Leaks JWT secret + DB connection info. `PUT /api/profile` mass-assignment to set `role: admin` |
| 5 | A07 Identification & Auth Failures | `POST /auth/reset-password` | Predictable reset "secret" derived from MD5 of SSN — user enumeration + reset |
| 6 | A07 JWT Forgery | `POST /api/transfer` cookie | Forge a token with `role: admin` using leaked secret, access `/admin/api/flag` |
| 7 | A03 XSS (Stored) | `POST /support/api/tickets` | Message stored raw, rendered with `<%- %>` in `/admin/panel`. Steal admin cookie → access `/admin/api/flag` |
| 8 | A10 SSRF | `POST /api/verify-bank` | Point it at internal services, e.g. `http://moneta-db:5432` or zookeeper/metadata |
| 9 | Command Injection | `GET /api/export?account=` | Account value is interpolated into a shell command — `$(cat /flag.txt)` |
| 10 | A01 Path Traversal | `GET /api/download?file=` | `../` to read `/flag.txt` and arbitrary files |

## Flags

| Flag | File/Where |
|------|-----------|
| `FLAG{BANK_VAULT_BREACHED}` | `/flag.txt` in the moneta-bank container |
| `FLAG{ADMIN_SSN_LEAKED}` | admin customer's `ssn` field in the DB |
| `FLAG{ADMIN_PANEL_ACCESS_GRANTED}` | `GET /admin/api/flag` (admin JWT required) |
| DB dump via SQLi shows passwords hashes | use `john`/`hashcat` or crack the reset endpoint |

## Session Plan (4 sessions x 3 hours)

### Session 1 — "Get In" (recon + auth)
- **Open (15 min):** briefing, rules, target `http://localhost:4000`, deliverables + rubric
- **Practice (120 min):**
  - Recon the app (routes, cookies, API)
  - Register a normal account, map your own data
  - Find the leaked JWT secret / debug endpoint
  - Exploit login or password reset
- **Close (25 min):** 2 students demo one finding; leaderboard

### Session 2 — "Take Over" (auth bypass + privesc)
- **Open (15 min):** recalc leaderboard, set the goal "become admin"
- **Practice (120 min):**
  - Mass-assignment profile update → admin role
  - Forge admin JWT
  - Reach `/admin/api/flag`
- **Close (25 min):** group discussion of defense for each finding

### Session 3 — "Get Rich" (data + business logic)
- **Open (15 min):** goal "read everyone's money data"
- **Practice (120 min):**
  - IDOR statements of other accounts
  - SQLi to dump users/SSNs
  - Negative/multi-account transfers for free money
  - Command injection + path traversal for `/flag.txt`
- **Close (25 min):** evidence collection

### Session 4 — "Full Chain" (final practical + defense)
- **Open (15 min):** full kill-chain demo rules
- **Practice (120 min):** chain everything: SQLi → creds → JWT admin → flag; stored XSS → admin cookie; SSRF → internal network
- **Close (25 min):** each student submits report + live 1-min demo; final grade

## Deliverable / Grading Rubric (per student)

Score each evidence pack out of 100:

| Criteria | Weight | 4 (Excellent) | 2 (Partial) | 0 (Miss) |
|----------|--------|---------------|-------------|----------|
| Finding identified + named (class of vuln) | 20% | Correct class + why it's a vuln | Vague label | Wrong class |
| Reproduction (request/response proof) | 30% | Exact repro, screenshots | Partial trail | None |
| Impact explained (data/money/creds lost) | 20% | Specific business impact | Generic statement | None |
| Exploitation skill (worked against real app) | 20% | Fully exploited / flag captured | Partial exploit | Failed |
| Remediation recommendation | 10% | Correct, actionable fix | Generic advice | None or wrong |

## Reset Between Sessions

```bash
# Fully wipe the bank DB so one class's flags/accounts don't leak to the next
docker compose stop moneta-db
docker compose rm -f moneta-db
docker volume rm security-course_moneta_data
docker compose up -d moneta-db moneta-bank
```

To change flags/secret per class, edit `docker-compose.yml` (rotation recommended):

```yaml
environment:
  JWT_SECRET: moneta-super-secret-2024   # <-- change per class
```
and the seeded values in `moneta-bank/src/db.js` + `moneta-bank/Dockerfile`.

## Hints only if students are stuck

Keep them scarce — the point is proving self-sufficiency. Suggested escalation:
1. "What does `/auth/debug` say?"
2. "How does the search endpoint build its query?"
3. "Can you post a support ticket and look at it from the admin console?"
4. "What runs when you export a statement?"