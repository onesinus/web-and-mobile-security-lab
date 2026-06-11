# Web & Mobile Security Lab

A hands-on security lab environment for teaching web and mobile application security.

## Architecture

| Service | Purpose | URL | Credentials |
|---------|---------|-----|-------------|
| Juice Shop | OWASP vulnerable web app (learning) | http://localhost:3000 | - |
| Vulnerable API | Custom vulnerable REST API | http://localhost:8080 | See week 05 |
| PostgreSQL | Database backend | localhost:5432 | student / student123 |
| OWASP ZAP | Automated security scanner (proxy) | localhost:8090 (proxy) | See below |
| Grafana | Monitoring dashboards | http://localhost:3001 | admin / admin |
| Loki | Log aggregation | http://localhost:3100 | - |
| MobSF | Mobile security framework | http://localhost:8000 | - |
| SonarQube | Code quality analysis | http://localhost:9000 | admin / admin |

## Docker Networking (Important!)

Inside a container, `localhost` refers to the container itself, **not** your host machine.

| From your browser | From inside a container |
|---|---|
| `localhost:3000` → Juice Shop | `http://juice-shop:3000` |
| `localhost:8080` → Vulnerable API | `http://vulnerable-api:8080` |
| `localhost:5432` → PostgreSQL | `postgres:5432` |

When using **ZAP Desktop inside Docker** (Option 5), use the **Docker service names** as targets:
- `http://juice-shop:3000` (not localhost:3000)
- `http://vulnerable-api:8080` (not localhost:8080)

To access a service running on your **host machine** from a container, use:
- **Windows/Mac**: `host.docker.internal`
- **Linux**: `172.17.0.1` (or `--add-host host.docker.internal:host-gateway`)

This applies to all tools inside containers (ZAP, Burp, scan scripts, etc.).

## ZAP Usage (Daemon Mode)

ZAP runs as a **forward proxy**, not a web server. You cannot open it in a browser directly.

### Option 1: Configure Browser Proxy (for intercepting traffic)

Set your browser proxy to `localhost:8090`, then browse to the actual target apps:

| Target | URL |
|--------|-----|
| Juice Shop | http://localhost:3000 |
| Vulnerable API | http://localhost:8080 |

**Chrome:** Settings → System → Open proxy settings → LAN → Proxy server: `localhost:8090`
**Firefox:** Settings → Network Settings → Manual proxy → HTTP Proxy: `localhost:8090`
**Edge:** Settings → System and performance → Open proxy settings

### Option 2: CURL with proxy flag

```bash
curl --proxy http://localhost:8090 http://juice-shop:3000
```

### Option 3: Access the ZAP API

```bash
curl --proxy http://localhost:8090 "http://zap/JSON/core/view/version/"
```

### Option 4: Python zapv2 library

```python
pip install python-zapv2
```

```python
from zapv2 import ZAPv2
zap = ZAPv2(proxies={'http': 'http://localhost:8090', 'https': 'http://localhost:8090'})
print(zap.core.version)
```

### Option 5: ZAP Desktop in Docker (browser-based UI)

Start the optional ZAP Desktop container:

```bash
docker compose --profile zap-ui up -d zap-ui
```

Then open http://localhost:5800 in your browser for a full ZAP Desktop GUI.

**Important:** When adding targets in ZAP, use Docker service names, not `localhost`:

| Target | URL in ZAP |
|--------|-----------|
| Juice Shop | `http://juice-shop:3000` |
| Vulnerable API | `http://vulnerable-api:8080` |

ZAP proxy also available at `localhost:8091` for API access.

### Option 6: ZAP Desktop (native install)

Install [ZAP Desktop](https://www.zaproxy.org/download/) on your host machine, then connect it to the daemon:
**Tools → Options → API → Enable** and set the proxy to `localhost:8090`.

## Quick Start

```bash
docker compose up -d
```

Services with profiles (mobile week, advanced labs):

```bash
docker compose --profile mobile --profile advanced up -d
```

ZAP Desktop (browser-based GUI):
```bash
docker compose --profile zap-ui up -d zap-ui
```

## Course Outline

| Week | Topic | Platform |
|------|-------|----------|
| 01 | Environment Setup & Reconnaissance | Juice Shop |
| 02 | SQL Injection (SQLi) | Vulnerable API |
| 03 | Cross-Site Scripting (XSS) | Juice Shop |
| 04 | Broken Authentication | Vulnerable API |
| 05 | Insecure Direct Object References (IDOR) | Vulnerable API |
| 06 | Cross-Site Request Forgery (CSRF) | Juice Shop |
| 07 | Security Misconfiguration & Data Exposure | Vulnerable API |
| 08 | SSRF & Command Injection | Vulnerable API |
| 09 | Mobile Security | MobSF |
| 10 | Capture The Flag (CTF) | All |

## Tools Required

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Burp Suite Community](https://portswigger.net/burp/communitydownload) or OWASP ZAP
- [Postman](https://www.postman.com/downloads/)
- [Python 3](https://www.python.org/downloads/) (for exploit scripts)
- [Node.js](https://nodejs.org/) (optional, for custom scripts)
- Web browser (Chrome/Firefox with dev tools)
