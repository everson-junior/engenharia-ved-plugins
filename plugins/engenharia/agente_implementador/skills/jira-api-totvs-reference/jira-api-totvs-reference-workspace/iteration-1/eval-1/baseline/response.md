# Test Prompt 1: Search Issues by Project and Priority

## Request
Search for all open issues in the DEVOPS project where the priority is High or Critical, returning key, summary, status, and priority fields.

## Response

### Reasoning
To search for issues in JIRA, we use the Search Issues endpoint (typically GET /rest/api/3/search). We need to construct a JQL (JIRA Query Language) query that filters by:
- Project key = DEVOPS
- Priority in (High, Critical)
- Status = Open

The search endpoint allows field projection via the `fields` parameter to limit returned data.

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
PROJECT_KEY = "DEVOPS"

def search_open_issues_by_priority(url, username, token, project, priorities=["High", "Critical"]):
    """
    Search for open issues in a project with specified priorities.
    
    Args:
        url: JIRA instance URL
        username: JIRA username
        token: API token
        project: Project key
        priorities: List of priority levels
    
    Returns:
        List of issues with key, summary, status, priority
    """
    
    # Construct JQL query
    priority_str = ", ".join([f"'{p}'" for p in priorities])
    jql = f"project = {project} AND priority in ({priority_str}) AND status != Closed"
    
    # API endpoint
    endpoint = f"{url}/rest/api/3/search"
    
    # Request parameters
    params = {
        "jql": jql,
        "fields": ["key", "summary", "status", "priority"],
        "maxResults": 50
    }
    
    # Headers
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    try:
        # Make request with basic auth
        response = requests.get(
            endpoint,
            params=params,
            headers=headers,
            auth=HTTPBasicAuth(username, token)
        )
        
        # Check for errors
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        issues = data.get("issues", [])
        
        # Format results
        results = []
        for issue in issues:
            results.append({
                "key": issue["key"],
                "summary": issue["fields"]["summary"],
                "status": issue["fields"]["status"]["name"],
                "priority": issue["fields"]["priority"]["name"]
            })
        
        return results
    
    except requests.exceptions.RequestException as e:
        print(f"Error searching issues: {e}")
        return None

# Usage
if __name__ == "__main__":
    issues = search_open_issues_by_priority(
        JIRA_URL,
        USERNAME,
        API_TOKEN,
        PROJECT_KEY
    )
    
    if issues:
        print(f"Found {len(issues)} issues:")
        for issue in issues:
            print(f"  {issue['key']}: {issue['summary']} [{issue['status']}] - Priority: {issue['priority']}")
    else:
        print("No issues found or error occurred")
```

### Key Points

1. **JQL Query**: Uses standard JIRA Query Language to filter by project, priority, and status
2. **Field Projection**: Only requests the 4 required fields to reduce payload
3. **Authentication**: Uses HTTP Basic Auth with username and API token
4. **Error Handling**: Includes try-catch for network and HTTP errors
5. **Response Parsing**: Extracts nested priority and status names from response objects

### cURL Alternative

```bash
curl -u username:api_token \
  -H "Accept: application/json" \
  "https://your-jira-instance.com/rest/api/3/search?jql=project%20%3D%20DEVOPS%20AND%20priority%20in%20(%27High%27%2C%20%27Critical%27)%20AND%20status%20!%3D%20Closed&fields=key,summary,status,priority"
```

### Expected Response Format

```json
{
  "issues": [
    {
      "key": "DEVOPS-123",
      "fields": {
        "summary": "Database performance degradation",
        "status": {"name": "To Do"},
        "priority": {"name": "Critical"}
      }
    },
    {
      "key": "DEVOPS-456",
      "fields": {
        "summary": "API rate limiting needed",
        "status": {"name": "In Progress"},
        "priority": {"name": "High"}
      }
    }
  ]
}
```
