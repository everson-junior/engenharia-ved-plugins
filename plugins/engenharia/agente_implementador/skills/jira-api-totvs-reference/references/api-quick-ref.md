# JIRA API TOTVS - Quick Reference

## API Endpoint Base
```
https://your-jira-instance.com/api
```

## Common Operations

### 1. Search Issues (GET)
**Endpoint:** `/issue/search`

**Authentication:** Basic Auth (username:password)

**Query Parameters:**
- `jql` (required): JQL query string
- `startAt` (optional): Pagination start index (default: 0)
- `maxResults` (optional): Max results per page (default: 50, max: 1000)
- `fields` (optional): Comma-separated field names to return

**Python Example:**
```python
import requests
from requests.auth import HTTPBasicAuth

response = requests.get(
    "https://your-jira-instance.com/api/issue/search",
    params={
        "jql": "project = PROJ AND status = 'To Do'",
        "maxResults": 100,
        "fields": ["key", "summary", "status"]
    },
    auth=HTTPBasicAuth("username", "password")
)

issues = response.json()
for issue in issues.get('issues', []):
    print(f"{issue['key']}: {issue['fields']['summary']}")
```

### 2. Create Issue (POST)
**Endpoint:** `/issue`

**Authentication:** Basic Auth (username:password)

**Request Body (JSON):**
```json
{
  "fields": {
    "project": {
      "key": "PROJECT_KEY"
    },
    "summary": "Issue summary text",
    "description": "Issue description",
    "issuetype": {
      "name": "Bug"  // or "Task", "Story", etc
    },
    "priority": {
      "name": "High"
    }
  }
}
```

**Python Example:**
```python
import requests
import json

payload = {
    "fields": {
        "project": {"key": "MYPROJ"},
        "summary": "New bug found",
        "description": "Detailed description here",
        "issuetype": {"name": "Bug"},
        "priority": {"name": "High"}
    }
}

response = requests.post(
    "https://your-jira-instance.com/api/issue",
    json=payload,
    auth=HTTPBasicAuth("username", "password"),
    headers={"Content-Type": "application/json"}
)

if response.status_code == 201:
    issue_key = response.json()['key']
    print(f"Created issue: {issue_key}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### 3. Update Issue (PATCH)
**Endpoint:** `/issue/{issue_key}`

**Authentication:** Basic Auth or Bearer Token

**Note:** PATCH operations may require API token authentication (not just username/password)

**Request Body (JSON):**
```json
{
  "fields": {
    "status": {
      "name": "In Progress"
    },
    "assignee": {
      "name": "username"
    },
    "labels": ["bug", "urgent"]
  }
}
```

**Python Example:**
```python
import requests

payload = {
    "fields": {
        "status": {"name": "Done"},
        "resolution": {"name": "Fixed"}
    }
}

response = requests.patch(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    json=payload,
    headers={
        "Authorization": "Bearer YOUR_API_TOKEN",
        "Content-Type": "application/json"
    }
)

if response.status_code in [200, 204]:
    print("Issue updated successfully")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### 3. Update Issue (PATCH)
**Endpoint:** `/issue/{issue_key}`

**Authentication:** Bearer Token (typically required)

**Request Body (JSON):**
```json
{
  "fields": {
    "status": {
      "name": "Done"
    },
    "resolution": {
      "name": "Fixed"
    }
  }
}
```

**Python Example:**
```python
import requests

payload = {
    "fields": {
        "status": {"name": "Done"},
        "resolution": {"name": "Fixed"}
    }
}

response = requests.patch(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    json=payload,
    headers={
        "Authorization": "Bearer YOUR_API_TOKEN",
        "Content-Type": "application/json"
    }
)

if response.status_code in [200, 204]:
    print("Issue updated successfully")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### 4. Delete Issue (DELETE)
**Endpoint:** `/issue/{issue_key}`

**Authentication:** Bearer Token (typically required)

**Python Example:**
```python
import requests

response = requests.delete(
    "https://your-jira-instance.com/api/issue/MYPROJ-123",
    headers={"Authorization": "Bearer YOUR_API_TOKEN"}
)

if response.status_code in [200, 204, 404]:
    print("Issue deleted successfully")
else:
    print(f"Error: {response.status_code}")
```

## Authentication Methods

### Basic Auth (GET, POST)
```python
from requests.auth import HTTPBasicAuth

auth = HTTPBasicAuth("your_username", "your_password")
response = requests.get(url, auth=auth)
```

### Bearer Token (PATCH, DELETE, and other sensitive operations)
```python
headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}
response = requests.patch(url, json=payload, headers=headers)
```

**Getting an API Token:**
- Log into JIRA
- Navigate to Settings → API Tokens (or Atlassian Account)
- Click "Create API Token"
- Use: `authorization: Bearer <token>`

## Common JQL Queries

```
# Find open issues in a project
project = "MYPROJ" AND status != "Done"

# Find issues assigned to you
assignee = currentUser()

# Find high priority bugs created in the last 7 days
type = Bug AND priority = High AND created >= -7d

# Find issues with specific label
labels = "urgent"

# Complex query
project = "MYPROJ" AND type in (Bug, Task) AND (priority = High OR assignee = EMPTY) AND created >= 2024-01-01
```

## Response Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful update/delete |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Auth failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - API error |

## Error Handling Pattern

```python
try:
    response = requests.get(url, auth=auth)
    response.raise_for_status()  # Raise exception for non-2xx status
    data = response.json()
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e.response.status_code}")
    print(f"Details: {e.response.json()}")
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
```

## Useful Resources

- **Full API Documentation:** Use `swagger-jira-api.yaml`
- **JQL Syntax:** https://your-jira-instance.com/secure/JiqlHelpFactory
- **Field Configuration:** Check project settings for available fields and issue types
