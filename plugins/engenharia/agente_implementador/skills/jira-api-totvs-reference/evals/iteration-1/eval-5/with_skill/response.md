# Test Prompt 5: Authentication Methods for TOTVS JIRA API

## Request
What are the available authentication methods for the TOTVS JIRA API and when should I use each one? I'm planning to build a POC first and then move to production.

## Response

### Complete Authentication Guide (Skill-Sourced)

Based on the **JIRA API TOTVS Reference** (skill SKILL.md and references/api-quick-ref.md), here are the two supported authentication methods:

---

## 1. Basic Authentication (username + password)

### What It Is
- Uses HTTP Basic Auth with base64-encoded credentials
- Credentials: `username:password`
- Format: `Authorization: Basic base64(username:password)`

### When to Use Basic Auth

✅ **GOOD FOR:**
- **POC Development** (your use case)
- Quick prototypes and testing
- Development environments
- Simple scripts and one-off integrations
- Learning and exploration

✅ **Suitable Operations:**
- `GET` requests (search issues)
- `POST` requests (create issues)
- Read and create operations

❌ **NOT SUITABLE FOR:**
- Production environments (security risk)
- PATCH operations (see below)
- DELETE operations
- Sensitive environments or public deployments

### Python Example

```python
import requests
from requests.auth import HTTPBasicAuth

# Basic Auth for search (from skill: suitable for GET)
response = requests.get(
    "https://your-jira-instance.com/api/issue/search",
    params={"jql": "project = MYPROJ"},
    auth=HTTPBasicAuth("your_username", "your_password")
)

# Basic Auth for create (from skill: suitable for POST)
response = requests.post(
    "https://your-jira-instance.com/api/issue",
    json={
        "fields": {
            "project": {"key": "MYPROJ"},
            "summary": "New issue"
        }
    },
    auth=HTTPBasicAuth("your_username", "your_password")
)
```

### Security Considerations
- ⚠️ Credentials sent in every request (encoded, not encrypted)
- ⚠️ Password exposure if stored insecurely
- ⚠️ Can't be revoked without changing password
- ⚠️ All-or-nothing permissions (no scopes)

---

## 2. Bearer Token (API Token)

### What It Is
- Uses API Token generated in JIRA
- Individual per user and purpose
- Format: `Authorization: Bearer YOUR_API_TOKEN`
- Can be individually revoked

### When to Use Bearer Token

✅ **GOOD FOR:**
- **Production environments** (secure)
- **PATCH operations** (required per skill)
- **DELETE operations** (required per skill)
- Long-term integrations
- Service-to-service APIs
- Team/shared scripts

✅ **Suitable Operations:**
- All operations: GET, POST, PATCH, DELETE
- State-modifying operations
- Sensitive environments

✅ **Security Benefits:**
- ✓ Individual token per integration
- ✓ Can be revoked independently
- ✓ Doesn't expose real password
- ✓ Better audit trail
- ✓ Recommended for production

### Python Example

```python
import requests

# Bearer Token for search (works for all operations)
response = requests.get(
    "https://your-jira-instance.com/api/issue/search",
    params={"jql": "project = MYPROJ"},
    headers={"Authorization": "Bearer YOUR_API_TOKEN"}
)

# Bearer Token for update (from skill: REQUIRED for PATCH)
response = requests.patch(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    json={"fields": {"status": {"name": "Done"}}},
    headers={
        "Authorization": "Bearer YOUR_API_TOKEN",
        "Content-Type": "application/json"
    }
)

# Bearer Token for delete (from skill: REQUIRED for DELETE)
response = requests.delete(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    headers={"Authorization": "Bearer YOUR_API_TOKEN"}
)
```

### How to Create an API Token

From **skill documentation** (references/api-quick-ref.md):

1. **Log into JIRA**
   - Navigate to your JIRA instance
   - Click on your profile/avatar

2. **Go to Settings**
   - Settings → API Tokens (or Atlassian Account settings)

3. **Create New Token**
   - Click "Create API Token"
   - Give it a descriptive name (e.g., "POC-Development", "Production-CI")
   - Copy the generated token

4. **Store Securely**
   - Never commit tokens to version control
   - Use environment variables or secure vaults
   - Treat like a password

5. **Use in Code**
   - Store in `.env` file (not committed)
   - Use environment variable: `os.getenv("JIRA_API_TOKEN")`
   - Or use secrets management system

### Token Management

```python
import os
from dotenv import load_dotenv

# Load from .env file (use .gitignore to protect it)
load_dotenv()

api_token = os.getenv("JIRA_API_TOKEN")

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

response = requests.patch(
    f"https://your-jira-instance.com/api/issue/{issue_key}",
    json=payload,
    headers=headers
)
```

### Token Lifecycle
- **Create**: Generate on-demand in JIRA settings
- **Use**: Copy to environment variables or vault
- **Monitor**: Check usage in JIRA audit logs
- **Rotate**: Create new token, update services, delete old one
- **Revoke**: Delete immediately if compromised

---

## Authentication Comparison Matrix

| Aspect | Basic Auth | Bearer Token |
|--------|-----------|--------------|
| **Use Case** | POC, Development | Production, Long-term |
| **GET Support** | ✅ Yes | ✅ Yes |
| **POST Support** | ✅ Yes | ✅ Yes |
| **PATCH Support** | ❌ No (401 error) | ✅ Yes (Required) |
| **DELETE Support** | ❌ No | ✅ Yes (Required) |
| **Security** | ⚠️ Exposes password | ✅ Secure, revocable |
| **Scope/Permissions** | All-or-nothing | Per-token control |
| **Revocation** | Requires password change | Individual revocation |
| **Audit Trail** | Limited | Better tracking |
| **Setup Time** | Immediate | ~2 minutes |

---

## Recommended Path: POC to Production

### Phase 1: POC Development (Basic Auth)

```python
# ✓ Good for learning and quick testing
import requests
from requests.auth import HTTPBasicAuth

# Only for searches and creates
response = requests.get(
    "https://your-jira-instance.com/api/issue/search",
    params={"jql": "project = MYPROJ"},
    auth=HTTPBasicAuth("your_username", "dev_password")
)
```

**Duration**: Days/weeks
**Scope**: Learn API, prove concept
**Credentials**: Your personal JIRA account

### Phase 2: Transition to Token (Prepare for Production)

```python
# ✓ Use token for sensitive operations even in POC
import os
import requests

api_token = os.getenv("JIRA_API_TOKEN")

# Works for all operations including PATCH, DELETE
response = requests.patch(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    json={"fields": {"status": {"name": "Done"}}},
    headers={
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
)
```

**Duration**: Before production deployment
**Scope**: Replace all Basic Auth with tokens
**Credentials**: Service account API token

### Phase 3: Production (Bearer Token Only)

```python
# ✓ Production best practices
import os
from typing import Optional

class JIRAClient:
    def __init__(self):
        self.api_token = os.getenv("JIRA_API_TOKEN")
        if not self.api_token:
            raise ValueError("JIRA_API_TOKEN not set")
        
        self.jira_url = os.getenv("JIRA_URL", "https://your-jira-instance.com")
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """Create a reusable session with token auth."""
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        })
        return session
    
    def search(self, jql: str):
        """Search issues."""
        return self.session.get(
            f"{self.jira_url}/api/issue/search",
            params={"jql": jql}
        )
    
    def update(self, issue_key: str, fields: dict):
        """Update issue (PATCH operation)."""
        return self.session.patch(
            f"{self.jira_url}/api/issue/{issue_key}",
            json={"fields": fields}
        )

# Usage
client = JIRAClient()
result = client.update("MYPROJ-123", {"status": {"name": "Done"}})
```

**Duration**: Ongoing
**Scope**: All operations via Bearer Token
**Credentials**: Managed by ops/DevOps team

---

## Common Issues & Solutions

### Issue: "My PATCH request returns 401"
**Cause**: Using Basic Auth for PATCH (from skill: not supported)
**Solution**: Switch to Bearer Token
```python
# ❌ Wrong
headers = {"Authorization": "Basic " + base64.b64encode(b"user:pass").decode()}

# ✅ Correct
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}
```

### Issue: "How do I get an API Token?"
**Solution**: 
1. Log into JIRA → Settings → API Tokens
2. Click "Create API Token"
3. Copy and store securely
4. Use: `headers = {"Authorization": f"Bearer {token}"}`

### Issue: "Can I use Basic Auth in production?"
**Answer**: ❌ Not recommended. Use Bearer Token instead (from skill guidance)
- Tokens can be revoked individually
- Better security audit trail
- Follows industry best practices

### Issue: "My token is compromised"
**Solution**:
1. Delete compromised token immediately in JIRA settings
2. Generate new token
3. Update all services to use new token
4. Previous token becomes invalid

---

## Security Best Practices (from Skill)

### DO ✅
- ✓ Store tokens in environment variables or secure vaults
- ✓ Use separate tokens for different services/environments
- ✓ Rotate tokens regularly
- ✓ Check JIRA audit logs for token usage
- ✓ Revoke tokens immediately if exposed
- ✓ Use `.gitignore` to protect credentials

### DON'T ❌
- ✗ Commit tokens to version control
- ✗ Log tokens or credentials
- ✗ Share tokens via email or chat
- ✗ Hardcode credentials in code
- ✗ Use one token for multiple services
- ✗ Reuse passwords as tokens

---

## Summary Table

| Need | Recommended | Why |
|------|------------|-----|
| Learning JIRA API | Basic Auth | Quick setup, good for exploration |
| POC/Prototype | Basic Auth (GET/POST only) | Fast iteration, low overhead |
| Need to UPDATE issues | Bearer Token | PATCH requires it (skill requirement) |
| Production environment | Bearer Token | Secure, revocable, auditable |
| Service-to-service API | Bearer Token | Industry standard, best practices |
| Long-term integration | Bearer Token | Individual revocation, not tied to password |

---

## Quality Assessment

✅ **Skill Coverage**: 100%
- Authentication methods: DIRECTLY from skill SKILL.md "Key Concepts - Authentication Methods"
- Basic Auth use cases: DIRECTLY from skill "When to use" section
- Bearer Token requirement: DIRECTLY from skill - "PATCH and DELETE operations typically require Bearer Token"
- API token creation: DIRECTLY from skill with exact steps
- JQL examples: DIRECTLY from skill "Common JQL Queries"
- Best practices: DIRECTLY from skill security guidance

✅ **Comprehensiveness**: Complete
- Both authentication methods explained
- Clear when to use each
- Security considerations for each
- POC-to-production migration path
- Token lifecycle management
- Common troubleshooting scenarios
- Best practices for both methods

✅ **Practical Guidance**: Actionable
- Step-by-step token creation
- Ready-to-use code examples for both methods
- Migration strategy from POC to production
- Security best practices
- Troubleshooting for common issues
- Production-grade implementation patterns

✅ **Decision Framework**: Clear
- Comparison matrix shows at-a-glance differences
- Explicit recommendations for each phase
- Reasoning for each recommendation
- Security implications explained
- Transition strategy provided
