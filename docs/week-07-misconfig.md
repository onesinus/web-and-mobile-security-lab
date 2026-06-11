# Week 07: Security Misconfiguration & Sensitive Data Exposure

## Learning Objectives
- Identify security misconfigurations in web applications
- Exploit debug endpoints and verbose error messages
- Discover and protect sensitive data

## Exercises

### Exercise 1: Debug Endpoint
The vulnerable API exposes a debug endpoint:

```bash
# Access the debug endpoint
curl "http://localhost:8080/products/debug/env"
```

**Questions:**
- What credentials are exposed?
- What database connection details are leaked?
- Why should debug endpoints be disabled in production?

### Exercise 2: Verbose Error Messages
Trigger errors to leak information:

```bash
# SQL error message leaks table structure
curl "http://localhost:8080/products?category=Electronics'"

# Stack trace on invalid input
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# 500 error with full stack
curl "http://localhost:8080/users/search?q="
```

**Questions:**
- What information is leaked in error messages?
- How can an attacker use this information?
- What should production error responses look like?

### Exercise 3: Sensitive Data Exposure
The `/users/profile` endpoint exposes sensitive fields:

```bash
# Login and check profile
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/profile"
```

**Questions:**
- What sensitive data is returned (credit card, SSN)?
- Why should this data not be in API responses?
- How would you properly mask sensitive data?

### Exercise 4: Directory Listing
Check if directory listing is enabled:

```bash
curl -v "http://localhost:8080/"
curl -v "http://localhost:3000/"
```

**Questions:**
- Is directory listing enabled on any endpoints?
- What files/directories are exposed?

### Exercise 5: Admin Configuration Endpoint
The admin config endpoint is unprotected:

```bash
# This endpoint has no authentication!
curl "http://localhost:8080/admin/config"
```

**Questions:**
- What features does the debug mode enable?
- How would you exploit verbose error handling?

### Exercise 6: Mitigation

**Disable debug endpoints:**
```javascript
if (process.env.NODE_ENV === "production") {
  app.use("/products/debug", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}
```

**Mask sensitive data:**
```javascript
function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    credit_card: "****-****-****-" + user.credit_card.slice(-4),
  };
}
```

## Deliverable
- Find and exploit at least 3 security misconfigurations
- Document all exposed sensitive data
- Show how to fix each misconfiguration
