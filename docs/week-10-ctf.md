# Week 10: Capture The Flag (CTF) - Final Project

## Objective
Apply all skills learned throughout the course to capture flags hidden across the lab environment.

## Rules
- Flags are in format `FLAG{...}`
- No denial of service attacks
- No destroying or corrupting data
- Document each flag with the vulnerability exploited

## Challenge Categories

### Challenge 1: SQL Injection (100 pts)
**Target:** Vulnerable API / Products endpoint

Find a way to extract all user credentials from the database. The flag is hidden in a field of the admin user.

**Hints:**
- Use UNION-based SQL injection
- Check all columns in the users table

### Challenge 2: XSS Cookie Theft (100 pts)
**Target:** Juice Shop

Steal the admin cookie from Juice Shop using stored XSS. A flag is stored in the admin's profile.

**Hints:**
- Use a webhook or your own server to receive cookies
- Check Juice Shop's review/feedback functionality

### Challenge 3: JWT Forgery (100 pts)
**Target:** Vulnerable API - Admin Endpoints

Forge a JWT token with admin privileges to access protected admin functionality.

**Hints:**
- The JWT secret is weak and exposed in the debug endpoint
- Change the role field to "admin"

### Challenge 4: IDOR Data Breach (100 pts)
**Target:** Vulnerable API

Access sensitive data belonging to other users through IDOR vulnerabilities.

**Hints:**
- Enumerate user IDs
- Check orders, profile, and review endpoints

### Challenge 5: Command Injection (150 pts)
**Target:** Vulnerable API - Admin Logs

Execute commands to find a flag file on the container filesystem.

**Hints:**
- You need admin access first (Challenge 3)
- Use the `/admin/logs` endpoint
- The flag is at `/flag.txt`

### Challenge 6: RCE via SSRF (150 pts)
**Target:** Vulnerable API

Chain SSRF with command injection to access internal services and find flags.

**Hints:**
- Scan internal Docker network
- Check other containers on the internal network

### Challenge 7: Privilege Escalation (150 pts)
**Target:** Vulnerable API - User Update

Escalate from a regular user to admin using mass assignment.

**Hints:**
- Check the PUT /users/:id endpoint
- What fields can you update?

### Challenge 8: Full Chain Exploit (200 pts)
**Target:** All Services

Chain multiple vulnerabilities together for a complete compromise:
1. Use SQLi to get credentials
2. Use weak JWT to gain admin
3. Use command injection for RCE
4. Escalate to access host system (break out of container)

## Scoring

| Points | Grade |
|--------|-------|
| 800+ | A (Excellent) |
| 650-799 | B (Good) |
| 500-649 | C (Satisfactory) |
| 300-499 | D (Pass) |
| < 300 | F (Fail) |

## Deliverable
Submit a penetration testing report including:
1. Executive summary
2. Methodology
3. Each flag captured with:
   - Vulnerability type
   - Steps to reproduce
   - Proof of concept (screenshots/commands)
   - Impact assessment
   - Remediation recommendation
4. Overall risk assessment
