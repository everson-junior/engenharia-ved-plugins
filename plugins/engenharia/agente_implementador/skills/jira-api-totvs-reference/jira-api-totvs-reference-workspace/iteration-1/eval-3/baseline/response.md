# Test Prompt 3: Troubleshooting 401 Unauthorized Error

## Request
Getting 401 Unauthorized error when updating issue status using PATCH method with Basic auth header. What's the problem and how to fix it?

## Response

### Reasoning
A 401 Unauthorized error typically indicates authentication failure. Common causes when using HTTP Basic Auth:
1. Invalid credentials (wrong username or token)
2. Missing or malformed Authorization header
3. Token expired or revoked
4. API token instead of password (or vice versa)
5. Encoding issues in base64 conversion
6. Using deprecated authentication methods

### Problem Analysis

#### Common Issues

**Issue 1: Incorrect Header Format**
```
❌ Wrong:
Authorization: Basic username:password

✓ Correct:
Authorization: Basic base64(username:password)
```

**Issue 2: Base64 Encoding Errors**
```python
# Wrong - using string directly
import base64
auth_string = "username:password"
# Forgetting to encode to bytes first
header = f"Basic {auth_string}"  # ❌ Not base64 encoded

# Correct - proper encoding
auth_string = "username:password"
encoded = base64.b64encode(auth_string.encode()).decode()
header = f"Basic {encoded}"  # ✓ Properly encoded
```

**Issue 3: Using Password Instead of API Token (Cloud)**
```
❌ For JIRA Cloud: Using JIRA login password
✓ For JIRA Cloud: Use API token from https://id.atlassian.com/manage-profile/security/api-tokens
```

**Issue 4: Empty or Whitespace Issues**
```python
# Wrong - extra spaces or newlines
token = " your-api-token\n"
encoded = base64.b64encode(f"username:{token}".encode()).decode()

# Correct - stripped
token = "your-api-token".strip()
encoded = base64.b64encode(f"username:{token}".encode()).decode()
```

### Solutions

#### Solution 1: Verify and Fix Base64 Encoding

```python
import base64
import requests

# Your credentials
USERNAME = "your-username"
API_TOKEN = "your-api-token".strip()  # Remove any whitespace

# Correct encoding
credentials = f"{USERNAME}:{API_TOKEN}"
encoded_credentials = base64.b64encode(credentials.encode()).decode()

# Verify encoding
print(f"Username: {USERNAME}")
print(f"Token: {API_TOKEN}")
print(f"Encoded: {encoded_credentials}")

# Use in request
headers = {
    "Authorization": f"Basic {encoded_credentials}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

response = requests.patch(
    "https://your-jira-instance.com/rest/api/3/issues/ISSUE-123",
    json={"fields": {"status": "In Progress"}},
    headers=headers
)

print(f"Status: {response.status_code}")
if response.status_code == 401:
    print("Still getting 401 - check credentials")
```

#### Solution 2: Test Authentication

```python
import requests
from requests.auth import HTTPBasicAuth

# Configuration
URL = "https://your-jira-instance.com"
USERNAME = "your-username"
API_TOKEN = "your-api-token"

# Test endpoint (get current user)
test_endpoint = f"{URL}/rest/api/3/myself"

response = requests.get(
    test_endpoint,
    auth=HTTPBasicAuth(USERNAME, API_TOKEN)
)

if response.status_code == 200:
    user = response.json()
    print(f"✓ Authentication successful!")
    print(f"  Logged in as: {user.get('displayName')}")
else:
    print(f"✗ Authentication failed: {response.status_code}")
    print(f"  Response: {response.text}")
```

#### Solution 3: Use requests Library (Recommended)

```python
import requests
from requests.auth import HTTPBasicAuth

URL = "https://your-jira-instance.com"
USERNAME = "your-username"
API_TOKEN = "your-api-token"

# requests library handles base64 encoding automatically
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

response = requests.patch(
    f"{URL}/rest/api/3/issues/DEVOPS-123",
    json={"fields": {"status": {"name": "In Progress"}}},
    headers=headers,
    auth=HTTPBasicAuth(USERNAME, API_TOKEN)  # Automatic encoding
)

if response.status_code != 204:
    print(f"Error: {response.status_code}")
    print(f"Details: {response.text}")
else:
    print("✓ Issue status updated successfully")
```

#### Solution 4: Check API Token Generation (JIRA Cloud)

**For JIRA Cloud:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the generated token immediately (shown only once)
4. Use this token instead of your JIRA password

**For JIRA Server/Data Center:**
1. Token support depends on version
2. Can use either password or API token
3. Check with your admin for token generation process

### Complete Diagnostic Script

```python
import requests
from requests.auth import HTTPBasicAuth
import base64

def diagnose_auth(url, username, token):
    """Diagnose authentication issues"""
    
    print("=== JIRA Authentication Diagnostic ===\n")
    
    # Check 1: Credentials format
    print("1. Checking credentials format...")
    print(f"   Username: {username}")
    print(f"   Token length: {len(token)} chars")
    print(f"   Token (first 5 chars): {token[:5]}***\n")
    
    # Check 2: Base64 encoding
    print("2. Verifying base64 encoding...")
    creds = f"{username}:{token}"
    encoded = base64.b64encode(creds.encode()).decode()
    print(f"   Encoded (first 20 chars): {encoded[:20]}...\n")
    
    # Check 3: Test authentication
    print("3. Testing authentication...")
    headers = {
        "Authorization": f"Basic {encoded}",
        "Accept": "application/json"
    }
    
    response = requests.get(
        f"{url}/rest/api/3/myself",
        headers=headers
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        user = response.json()
        print(f"   ✓ Success! Authenticated as: {user.get('displayName')}")
        return True
    else:
        print(f"   ✗ Failed: {response.text}")
        return False

# Usage
diagnose_auth(
    "https://your-jira-instance.com",
    "your-username",
    "your-api-token"
)
```

### Prevention Checklist

- [ ] API token is from official token generation page
- [ ] Credentials are properly base64 encoded
- [ ] No extra whitespace in token or username
- [ ] Authorization header format: `Basic <base64>`
- [ ] Using `requests.auth.HTTPBasicAuth` for automatic encoding
- [ ] Testing with `/rest/api/3/myself` endpoint first
- [ ] Confirming correct JIRA instance URL
- [ ] Checking user has appropriate permissions
- [ ] Token hasn't expired or been revoked
- [ ] Using HTTPS (not HTTP)
