# Week 09: Mobile Application Security

## Learning Objectives
- Set up MobSF for static and dynamic analysis
- Analyze Android APK for security vulnerabilities
- Identify insecure data storage, hardcoded secrets, and misconfigurations

## Setup

Start MobSF (requires the mobile profile):

```bash
docker compose --profile mobile up -d mobsf
```

Access MobSF at http://localhost:8000

## Exercises

### Exercise 1: Static Analysis with MobSF
1. Download a test APK (e.g., OWASP MSTG Hacking Playground or an APK you create)
2. Upload the APK to MobSF via the web interface
3. Review the static analysis report

Key areas to examine:
- **Manifest Analysis**: Permissions, exported activities, debuggable flag
- **Code Analysis**: Hardcoded secrets, insecure API calls
- **Network Security**: Cleartext traffic, certificate pinning
- **Storage**: SharedPreferences, SQLite databases, internal storage

**Questions:**
- What permissions does the app request?
- Are there any exported activities that shouldn't be?
- Is the app debuggable?
- Are there any hardcoded API keys or tokens?

### Exercise 2: Insecure Data Storage Analysis
1. Install the target app on an emulator
2. Use ADB to examine app data storage:

```bash
# Connect to emulator
adb shell

# Navigate to app data
run-as com.example.vulnerableapp
cd /data/data/com.example.vulnerableapp

# Check SharedPreferences
cat shared_prefs/*.xml

# Check databases
cd databases
sqlite3 app.db .dump
```

**Questions:**
- What sensitive data is stored in plaintext?
- Are passwords or tokens stored insecurely?
- What encryption should be used?

### Exercise 3: Network Traffic Analysis
1. Configure Burp Suite or ZAP as a proxy on the emulator
2. Install the Burp CA certificate on the emulator
3. Monitor the app's network traffic

**Questions:**
- Is traffic encrypted (HTTPS)?
- Are there any cert pinning bypasses?
- What API endpoints does the app communicate with?

### Exercise 4: Dynamic Analysis with MobSF (Optional)
1. Use MobSF's dynamic analyzer with an Android VM
2. Monitor API calls, file operations, and network activity

### Exercise 5: Building a Secure Mobile App
Create a simple Android app that demonstrates:
- Secure data storage (EncryptedSharedPreferences)
- Certificate pinning
- Proper API key management (BuildConfig, not hardcoded)
- Input validation

## Deliverable
- Static analysis report from MobSF
- Identify at least 3 security issues in the analyzed APK
- Code snippet demonstrating secure mobile development practice
