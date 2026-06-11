# Web & Mobile Security Lab

A hands-on security lab environment for teaching web and mobile application security.

## Architecture

| Service | Purpose | URL | Credentials |
|---------|---------|-----|-------------|
| Juice Shop | OWASP vulnerable web app (learning) | http://localhost:3000 | - |
| Vulnerable API | Custom vulnerable REST API | http://localhost:8080 | See week 05 |
| PostgreSQL | Database backend | localhost:5432 | student / student123 |
| OWASP ZAP | Automated security scanner | http://localhost:8090 | - |
| Grafana | Monitoring dashboards | http://localhost:3001 | admin / admin |
| Loki | Log aggregation | http://localhost:3100 | - |
| MobSF | Mobile security framework | http://localhost:8000 | - |
| SonarQube | Code quality analysis | http://localhost:9000 | admin / admin |

## Quick Start

```bash
docker compose up -d
```

Services with profiles (mobile week, advanced labs):

```bash
docker compose --profile mobile --profile advanced up -d
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
