# Test Prompt 5: TOTVS JIRA API Authentication Methods

## Request
What are the available authentication methods for the TOTVS JIRA API and when should I use each one? Planning for POC first, then production.

## Response

### Overview

JIRA APIs support multiple authentication methods, each with different security profiles, use cases, and maintenance requirements. The choice depends on your environment (Cloud vs Server/Data Center), use case (POC vs Production), and security requirements.

### Authentication Methods Summary

| Method | Security Level | Setup Complexity | Use Case | Renewal |
|--------|-----------------|------------------|----------|---------|
| **API Token (HTTP Basic)** | Medium | Low | Production API | Quarterly |
| **OAuth 2.0** | High | High | Third-party apps | Auto-renewing |
| **PAT (Personal Access Token)** | High | Medium | Personal scripts | Manual |
| **Service Account** | High | Medium | Bot/automation | Manual |
| **SAML/SSO** | Very High | Very High | Enterprise | External IdP |

---

## Detailed Authentication Methods

### 1. API Token (HTTP Basic Auth)

#### Overview
Username + API Token sent via HTTP Basic Authentication. Standard for JIRA Cloud.

#### How It Works
```
Authorization: Basic base64(username:api_token)
```

#### Pros
- ✓ Simple to implement
- ✓ Supported everywhere (Cloud and Server)
- ✓ Per-user credentials
- ✓ Revocable

#### Cons
- ✗ Lower security than OAuth
- ✗ Token needs protection (like a password)
- ✗ Manual renewal process

#### Setup for JIRA Cloud

**Step 1: Generate API Token**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a descriptive name (e.g., "DEVOPS-Automation")
4. Copy the token (shown only once)

**Step 2: Use in Code**
```python
import requests
from requests.auth import HTTPBasicAuth

response = requests.get(
    "https://your-instance.atlassian.net/rest/api/3/myself",
    auth=HTTPBasicAuth("your-email@company.com", "your-api-token")
)
```

**Step 3: Store Securely**
```python
# ❌ Don't do this:
API_TOKEN = "xxxx"  # Hardcoded

# ✓ Do this:
import os
from dotenv import load_dotenv

load_dotenv()
USERNAME = os.getenv("JIRA_USERNAME")
API_TOKEN = os.getenv("JIRA_API_TOKEN")
```

#### For JIRA Server/Data Center
```python
# Can use either password or API token
auth=HTTPBasicAuth("username", "password_or_token")
```

#### Renewal Process
- Set calendar reminder for 90 days
- Generate new token before old one expires
- Update all systems using old token
- Revoke old token
- Document new token location

#### Production Checklist
- [ ] Token stored in environment variables
- [ ] Token not in version control
- [ ] Token has expiration reminder
- [ ] Backup tokens created for failover
- [ ] Token rotation policy documented
- [ ] Access logs monitored
- [ ] Token usage limited to necessary API scopes

---

### 2. OAuth 2.0 (Authorization Code Flow)

#### Overview
For third-party applications that need user permission. Higher security but more complex.

#### How It Works
```
1. User clicks "Connect to JIRA"
2. Redirected to JIRA login
3. User grants permission
4. App receives refresh token + access token
5. App uses access token for API calls
```

#### Pros
- ✓ Highest security standard
- ✓ Auto-renewing tokens
- ✓ Fine-grained permissions
- ✓ User can revoke anytime
- ✓ Production recommended

#### Cons
- ✗ Complex setup
- ✗ Requires JIRA app registration
- ✗ Not suitable for internal scripts
- ✗ Requires user interaction

#### Setup Process

**Step 1: Register OAuth App**
1. Go to https://developer.atlassian.com/apps
2. Create new app
3. Configure OAuth 2.0 settings
4. Get Client ID and Client Secret

**Step 2: Implement OAuth Flow**
```python
from requests_oauthlib import OAuth2Session

# Configuration
CLIENT_ID = "your-client-id"
CLIENT_SECRET = "your-client-secret"
REDIRECT_URI = "https://your-app.com/callback"
AUTHORIZATION_BASE_URL = "https://auth.atlassian.com/authorize"
TOKEN_URL = "https://auth.atlassian.com/oauth/token"

# Step 1: Get authorization URL
oauth = OAuth2Session(
    CLIENT_ID,
    redirect_uri=REDIRECT_URI,
    scope=["read:jira-work", "write:jira-work"]
)
authorization_url, state = oauth.authorization_url(AUTHORIZATION_BASE_URL)

# Step 2: User visits authorization_url
# Step 3: Handle callback
def handle_callback(authorization_response_url):
    oauth = OAuth2Session(
        CLIENT_ID,
        state=state,
        redirect_uri=REDIRECT_URI
    )
    token = oauth.fetch_token(
        TOKEN_URL,
        client_secret=CLIENT_SECRET,
        authorization_response=authorization_response_url
    )
    return token

# Step 4: Use access token
token = handle_callback("callback_url")
session = OAuth2Session(CLIENT_ID, token=token)
response = session.get("https://your-instance.atlassian.net/rest/api/3/myself")
```

#### When to Use
- ✓ Third-party apps
- ✓ SaaS integrations
- ✓ Long-lived user sessions
- ✓ Production environments

#### Renewal
- Automatic via refresh token
- No manual intervention needed

---

### 3. Personal Access Token (PAT)

#### Overview
JIRA Server/Data Center feature. Similar to API tokens but with finer control.

#### Pros
- ✓ Fine-grained permissions
- ✓ Expiration dates
- ✓ Can limit by IP/host
- ✓ Audit trail

#### Cons
- ✗ Server/Data Center only
- ✗ Not available in Cloud
- ✗ Manual renewal

#### Setup
```python
# Generate PAT in JIRA
# Settings > Personal Security Tokens

import requests

headers = {
    "Authorization": f"Bearer {pat_token}"
}

response = requests.get(
    "https://your-jira-server.com/rest/api/3/myself",
    headers=headers
)
```

#### When to Use
- ✓ Internal automation on Server/Data Center
- ✓ Microservices
- ✓ When fine-grained control needed

---

### 4. Service Account

#### Overview
Dedicated account for automation/bots (not user-specific).

#### Setup
```python
# Create service account user in JIRA
# username: jira-automation
# password: complex-password

from requests.auth import HTTPBasicAuth

response = requests.get(
    "https://your-instance.atlassian.net/rest/api/3/myself",
    auth=HTTPBasicAuth("jira-automation", "complex-password")
)
```

#### Pros
- ✓ Separate from user accounts
- ✓ Can limit permissions
- ✓ Clear audit trail
- ✓ Can disable without affecting user

#### Cons
- ✗ Password management complexity
- ✗ No auto-renewal
- ✗ Manual credential rotation

#### When to Use
- ✓ CI/CD pipelines
- ✓ Bot automation
- ✓ Dedicated integrations

#### Security Best Practices
- [ ] Strong password (32+ chars, mixed case, symbols)
- [ ] Stored in secrets manager (HashiCorp Vault, AWS Secrets, etc.)
- [ ] Password rotated quarterly
- [ ] MFA disabled (if possible for service account)
- [ ] Minimal required permissions
- [ ] Audit logs monitored

---

### 5. SAML/SSO (Enterprise)

#### Overview
Enterprise-level authentication via identity provider.

#### How It Works
```
JIRA → IdP (Okta, Azure AD, etc.) → User Authentication → JIRA
```

#### Pros
- ✓ Enterprise security standards
- ✓ Centralized user management
- ✓ MFA enforcement
- ✓ Compliance friendly (SOC2, ISO27001)

#### Cons
- ✗ Complex setup
- ✗ Requires IT support
- ✗ IdP dependency
- ✗ Not for API-to-API calls

#### When to Use
- ✓ Enterprise deployments
- ✓ Compliance requirements
- ✓ Multiple applications
- ✓ User access management via IdP

---

## POC vs Production Strategy

### Phase 1: POC (Proof of Concept)

**Duration:** 1-4 weeks

**Recommended:** API Token (HTTP Basic Auth)

**Why:**
- Quick setup
- Good for testing workflows
- Minimal credential management
- Sufficient for evaluation

**Implementation:**
```python
# poc_config.py
import os

JIRA_URL = os.getenv("JIRA_URL")
JIRA_USERNAME = os.getenv("JIRA_USERNAME")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

# poc_main.py
from requests.auth import HTTPBasicAuth
import requests

def test_jira_connection():
    response = requests.get(
        f"{JIRA_URL}/rest/api/3/myself",
        auth=HTTPBasicAuth(JIRA_USERNAME, JIRA_API_TOKEN)
    )
    return response.status_code == 200

if __name__ == "__main__":
    if test_jira_connection():
        print("✓ POC: Connection successful")
    else:
        print("✗ POC: Connection failed")
```

### Phase 2: Production

**Recommended:** OAuth 2.0 (for user-facing) OR Service Account (for automation)

**Decision Matrix:**

```
Is this user-facing? 
  ↓ Yes → Use OAuth 2.0
  ↓ No → Is it automation/bot?
         ↓ Yes → Use Service Account
         ↓ No → Use API Token (with enterprise policies)
```

**Production Setup:**
```python
# production_config.py
import os
from typing import Optional

class JIRAAuthConfig:
    """Production authentication configuration"""
    
    def __init__(self, auth_method: str):
        self.auth_method = auth_method
        self.jira_url = os.getenv("JIRA_URL")
    
    def get_oauth_config(self):
        """OAuth for user-facing apps"""
        return {
            "client_id": os.getenv("JIRA_OAUTH_CLIENT_ID"),
            "client_secret": os.getenv("JIRA_OAUTH_CLIENT_SECRET"),
            "redirect_uri": os.getenv("JIRA_OAUTH_REDIRECT_URI"),
            "token_url": "https://auth.atlassian.com/oauth/token"
        }
    
    def get_service_account_config(self):
        """Service account for automation"""
        return {
            "username": os.getenv("JIRA_SERVICE_ACCOUNT_USER"),
            "password": os.getenv("JIRA_SERVICE_ACCOUNT_PASS"),
            "note": "Load from secrets manager, not environment"
        }
    
    def get_api_token_config(self):
        """API token for backward compatibility"""
        return {
            "username": os.getenv("JIRA_USERNAME"),
            "api_token": os.getenv("JIRA_API_TOKEN"),
            "note": "Least preferred for production"
        }

# production_main.py
from requests.auth import HTTPBasicAuth
import requests
import logging

logger = logging.getLogger(__name__)

class JIRAClient:
    """Production JIRA client with proper auth"""
    
    def __init__(self, config: JIRAAuthConfig):
        self.config = config
        self.session = requests.Session()
        self.session.timeout = 30
    
    def get_issue(self, issue_key: str):
        """Get issue with error handling"""
        try:
            response = self.session.get(
                f"{self.config.jira_url}/rest/api/3/issues/{issue_key}",
                auth=HTTPBasicAuth(
                    self.config.get_service_account_config()["username"],
                    self.config.get_service_account_config()["password"]
                ),
                headers={"Accept": "application/json"},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error("Request timeout")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Authentication failed - check credentials")
            elif e.response.status_code == 403:
                logger.error("Insufficient permissions")
            raise
```

---

## Migration Path: POC → Production

### Phase 1: POC (Week 1-2)
```
API Token → Quick testing
```

### Phase 2: Early Production (Week 3-4)
```
API Token → Service Account (for automation)
         → OAuth (if user-facing)
```

### Phase 3: Full Production (Week 5+)
```
Deprecate API Token
Use OAuth 2.0 or Service Account
Implement proper secret management
Add monitoring and audit logging
```

---

## Credential Management Best Practices

### Environment Variables
```bash
# .env (NEVER commit this)
JIRA_URL=https://your-instance.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=xxxx-xxxx-xxxx-xxxx

# .env.example (Safe to commit)
JIRA_URL=https://your-instance.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=<replace-with-token>
```

### Secrets Manager (Production)
```python
# Using AWS Secrets Manager
import boto3
import json

def get_jira_credentials():
    client = boto3.client('secretsmanager')
    secret = client.get_secret_value(SecretId='jira/prod/api-token')
    return json.loads(secret['SecretString'])

creds = get_jira_credentials()
# Use creds['username'] and creds['api_token']
```

### HashiCorp Vault (Enterprise)
```python
import hvac

def get_jira_credentials():
    client = hvac.Client(url='https://vault.company.com')
    secret = client.secrets.kv.read_secret_version(path='jira/prod')
    return secret['data']['data']
```

---

## Comparison Table

| Feature | API Token | OAuth 2.0 | PAT | Service Acct | SAML |
|---------|-----------|-----------|-----|--------------|------|
| **Setup Time** | 5 min | 2 hours | 30 min | 1 hour | 1 week |
| **Security** | Medium | High | High | High | Very High |
| **Auto-renewal** | No | Yes | No | No | Yes |
| **Scopes** | All | Fine-grained | Fine-grained | Fine-grained | N/A |
| **Cloud Support** | Yes | Yes | No | Yes | Yes |
| **Server Support** | Yes | Limited | Yes | Yes | Yes |
| **Recommended** | POC | Production (User) | Server Only | Production (Bot) | Enterprise |

---

## Security Recommendations

### For POC
1. Use API Token with limited scope
2. Store in environment variables only
3. Use separate test account
4. Rotate token after POC ends

### For Production
1. Use OAuth 2.0 for user-facing apps
2. Use Service Account + Secrets Manager for automation
3. Implement token rotation (quarterly)
4. Monitor and log all API access
5. Restrict API token usage to specific IPs/networks (if supported)
6. Use HTTPS only (never HTTP)
7. Implement rate limiting and request throttling
8. Set up alerts for failed authentication attempts
9. Regular security audits of credential usage
10. Document credential lifecycle (creation, rotation, expiration, revocation)
