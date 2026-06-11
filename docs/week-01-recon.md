# Week 01: Environment Setup & Reconnaissance

## Learning Objectives
- Set up the lab environment
- Understand web application reconnaissance techniques
- Use developer tools, ZAP, and Burp Suite for information gathering

## Lab Setup

### 1. Start the Environment
```bash
docker compose up -d
```

### 2. Verify Running Services
```bash
docker compose ps
```

### 3. Tools Installation
- Install Burp Suite Community or use OWASP ZAP (already running)
- Install browser extensions: Wappalyzer, HackBar, Cookie-Editor

## Exercises

### Exercise 1: Manual Reconnaissance on Juice Shop
1. Open http://localhost:3000 in your browser
2. Open Developer Tools (F12) -> Network tab
3. Browse the shop and observe API requests
4. Check `robots.txt`: http://localhost:3000/robots.txt
5. Check `sitemap.xml`: http://localhost:3000/sitemap.xml
6. Look for JavaScript files that may contain API endpoints

**Questions:**
- What endpoints does the Juice Shop expose?
- What information is leaked in `robots.txt`?
- What technologies are used (check response headers)?

### Exercise 2: Automated Scanning with ZAP
1. Open ZAP: http://localhost:8090
2. Configure ZAP to target http://juice-shop:3000 (or http://host.docker.internal:3000 on Windows)
3. Run an automated scan
4. Review the alerts

**Questions:**
- What high-risk issues were found?
- Categorize the findings by OWASP Top 10 category

### Exercise 3: API Discovery with the Vulnerable API
1. Explore http://localhost:8080
2. Try different HTTP methods on various endpoints
3. Document all discovered endpoints

**Deliverable:** Create an API endpoint map showing all discovered routes and methods.

## Additional Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Juice Shop: https://owasp.org/www-project-juice-shop/
- OWASP ZAP User Guide: https://www.zaproxy.org/docs/
