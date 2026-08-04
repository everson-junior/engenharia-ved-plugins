# Test Prompt 2: Create a Bug Issue

## Request
Create a new bug in the INFRASTRUCTURE project with high priority. Title: 'Database connection timeout', Description: 'Connection fails after 30 seconds'. Show code with proper authentication.

## Response

### Reasoning
To create an issue in JIRA, we use the Create Issue endpoint (POST /rest/api/3/issues). We need to:
1. Specify the project key (INFRASTRUCTURE)
2. Set issue type to "Bug"
3. Provide summary (title) and description
4. Set priority to "High"
5. Use proper authentication headers

### Solution

#### Python Code

```python
import requests
from requests.auth import HTTPBasicAuth
import json

# Configuration
JIRA_URL = "https://your-jira-instance.com"
USERNAME = "your-username"
API_TOKEN = "your-api-token"

def create_bug_issue(url, username, token, project_key, title, description, priority="High"):
    """
    Create a new bug issue in JIRA.
    
    Args:
        url: JIRA instance URL
        username: JIRA username
        token: API token (or password)
        project_key: Target project key
        title: Bug summary/title
        description: Bug description
        priority: Priority level (default: High)
    
    Returns:
        Created issue key on success, None on failure
    """
    
    # API endpoint
    endpoint = f"{url}/rest/api/3/issues"
    
    # Request payload
    payload = {
        "fields": {
            "project": {
                "key": project_key
            },
            "issuetype": {
                "name": "Bug"
            },
            "summary": title,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": description
                            }
                        ]
                    }
                ]
            },
            "priority": {
                "name": priority
            }
        }
    }
    
    # Headers
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    try:
        # Make request with basic auth
        response = requests.post(
            endpoint,
            json=payload,
            headers=headers,
            auth=HTTPBasicAuth(username, token)
        )
        
        # Check for errors
        if response.status_code not in [200, 201]:
            print(f"Error creating issue: {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        # Parse response
        data = response.json()
        issue_key = data.get("key")
        
        print(f"✓ Successfully created issue: {issue_key}")
        return issue_key
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return None

# Usage
if __name__ == "__main__":
    issue_key = create_bug_issue(
        JIRA_URL,
        USERNAME,
        API_TOKEN,
        "INFRASTRUCTURE",
        "Database connection timeout",
        "Connection fails after 30 seconds"
    )
    
    if issue_key:
        print(f"Bug created: {JIRA_URL}/browse/{issue_key}")
```

#### Alternative: Using Atlassian's Official Library

```python
from jira import JIRA
from jira.exceptions import JIRAError

# Initialize JIRA client
jira = JIRA(
    server="https://your-jira-instance.com",
    basic_auth=("your-username", "your-api-token")
)

try:
    # Create issue
    new_issue = jira.create_issue(
        project="INFRASTRUCTURE",
        issuetype="Bug",
        summary="Database connection timeout",
        description="Connection fails after 30 seconds",
        priority="High"
    )
    
    print(f"Created issue: {new_issue.key}")

except JIRAError as e:
    print(f"JIRA error: {e}")
```

### Authentication Details

#### HTTP Basic Auth Header

```
Authorization: Basic <base64(username:api_token)>
```

**Example generation:**
```python
import base64
credentials = "username:api_token"
encoded = base64.b64encode(credentials.encode()).decode()
print(f"Authorization: Basic {encoded}")
```

#### Important Notes

1. **Modern JIRA Cloud**: Use API token (not password)
   - Generate at: https://id.atlassian.com/manage-profile/security/api-tokens
   
2. **JIRA Server (On-Premise)**: Can use either password or API token
3. **Header Must Include**: `Content-Type: application/json`
4. **Accept Header**: `application/json` for JSON responses

### Issue Description Format

**Note**: JIRA Cloud uses Atlassian Document Format (ADF) for descriptions. The format includes:
- Document structure with version
- Paragraph content
- Text nodes

**Simple text format:**
```json
"description": {
    "type": "doc",
    "version": 1,
    "content": [
        {
            "type": "paragraph",
            "content": [
                {
                    "type": "text",
                    "text": "Your description here"
                }
            ]
        }
    ]
}
```

### Expected Response

```json
{
    "id": "12345",
    "key": "INFRASTRUCTURE-789",
    "self": "https://your-jira-instance.com/rest/api/3/issue/12345"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid credentials | Check username/token |
| 403 Forbidden | Insufficient permissions | User needs create issue permission |
| 404 Not Found | Project doesn't exist | Verify project key |
| 400 Bad Request | Invalid field values | Check required fields and data types |
