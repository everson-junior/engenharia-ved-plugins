# Test Prompt 4: Find and Update High-Priority Bugs from Last 7 Days

## Request
Write a Python script that finds all high-priority bugs created in the last 7 days and updates their status to 'In Progress' if they're currently 'To Do'. Include error handling for auth failures and rate limiting.

## Response

### Reasoning
This requires:
1. Search for bugs created in the last 7 days with High priority and status "To Do"
2. For each issue found, update status to "In Progress"
3. Handle authentication errors (401, 403)
4. Handle rate limiting (429)
5. Implement retry logic with exponential backoff
6. Batch operations when possible to minimize API calls

### Solution

#### Complete Python Script

```python
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta
import time
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class JIRABugUpdater:
    """Handle searching and updating bugs in JIRA"""
    
    def __init__(self, url, username, token, max_retries=3):
        """
        Initialize JIRA client
        
        Args:
            url: JIRA instance URL
            username: JIRA username
            token: API token
            max_retries: Maximum retry attempts for rate limiting
        """
        self.url = url
        self.auth = HTTPBasicAuth(username, token)
        self.max_retries = max_retries
        self.base_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method, endpoint, json_data=None, params=None):
        """
        Make HTTP request with retry logic for rate limiting
        
        Args:
            method: HTTP method (GET, POST, PATCH, etc.)
            endpoint: API endpoint path
            json_data: Request body
            params: Query parameters
        
        Returns:
            Response object or None on failure
        """
        url = f"{self.url}{endpoint}"
        retries = 0
        backoff_seconds = 1
        
        while retries <= self.max_retries:
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    json=json_data,
                    params=params,
                    headers=self.base_headers,
                    auth=self.auth,
                    timeout=30
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = int(response.headers.get('Retry-After', backoff_seconds))
                    logger.warning(
                        f"Rate limited. Waiting {retry_after} seconds before retry "
                        f"(attempt {retries + 1}/{self.max_retries})"
                    )
                    time.sleep(retry_after)
                    retries += 1
                    backoff_seconds *= 2  # Exponential backoff
                    continue
                
                # Handle authentication errors
                if response.status_code == 401:
                    logger.error("Authentication failed: Invalid credentials (401)")
                    return None
                
                if response.status_code == 403:
                    logger.error("Access forbidden: Insufficient permissions (403)")
                    return None
                
                # Handle other errors
                if response.status_code >= 400:
                    logger.error(
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    return None
                
                return response
            
            except requests.exceptions.ConnectTimeout:
                logger.error("Connection timeout")
                return None
            except requests.exceptions.RequestException as e:
                logger.error(f"Request error: {e}")
                return None
        
        logger.error(f"Max retries ({self.max_retries}) exceeded")
        return None
    
    def find_high_priority_bugs_from_last_7_days(self):
        """
        Find all high-priority bugs created in last 7 days with status 'To Do'
        
        Returns:
            List of issue keys and summaries, or None on error
        """
        # Calculate date 7 days ago
        seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        # JQL query
        jql = (
            f"type = Bug "
            f"AND priority = High "
            f"AND status = 'To Do' "
            f"AND created >= {seven_days_ago}"
        )
        
        logger.info(f"Searching for bugs with JQL: {jql}")
        
        params = {
            "jql": jql,
            "fields": ["key", "summary", "status", "priority", "created"],
            "maxResults": 100
        }
        
        response = self._make_request("GET", "/rest/api/3/search", params=params)
        
        if not response:
            logger.error("Failed to search for bugs")
            return None
        
        try:
            data = response.json()
            issues = data.get("issues", [])
            
            logger.info(f"Found {len(issues)} high-priority bugs to update")
            
            return issues
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse response: {e}")
            return None
    
    def update_issue_status(self, issue_key, new_status):
        """
        Update issue status
        
        Args:
            issue_key: JIRA issue key (e.g., 'DEVOPS-123')
            new_status: New status name (e.g., 'In Progress')
        
        Returns:
            True if successful, False otherwise
        """
        payload = {
            "fields": {
                "status": {
                    "name": new_status
                }
            }
        }
        
        endpoint = f"/rest/api/3/issues/{issue_key}"
        response = self._make_request("PATCH", endpoint, json_data=payload)
        
        if response and response.status_code in [200, 204]:
            logger.info(f"✓ {issue_key}: Status updated to '{new_status}'")
            return True
        else:
            logger.error(f"✗ {issue_key}: Failed to update status")
            return False
    
    def process_bugs(self):
        """
        Main workflow: find bugs and update status
        
        Returns:
            Dictionary with results
        """
        logger.info("Starting bug update process...")
        
        # Step 1: Find bugs
        issues = self.find_high_priority_bugs_from_last_7_days()
        
        if issues is None:
            return {
                "success": False,
                "error": "Failed to search for bugs",
                "updated": 0,
                "failed": 0
            }
        
        if not issues:
            logger.info("No bugs found matching criteria")
            return {
                "success": True,
                "updated": 0,
                "failed": 0,
                "message": "No bugs found"
            }
        
        # Step 2: Update each bug
        updated_count = 0
        failed_count = 0
        
        for issue in issues:
            issue_key = issue["key"]
            summary = issue["fields"]["summary"]
            
            logger.info(f"Processing {issue_key}: {summary}")
            
            if self.update_issue_status(issue_key, "In Progress"):
                updated_count += 1
                time.sleep(0.5)  # Rate limiting friendly delay
            else:
                failed_count += 1
        
        logger.info(f"\n=== Summary ===")
        logger.info(f"Total processed: {len(issues)}")
        logger.info(f"Successfully updated: {updated_count}")
        logger.info(f"Failed: {failed_count}")
        
        return {
            "success": True,
            "total": len(issues),
            "updated": updated_count,
            "failed": failed_count
        }

# Usage Example
def main():
    """Main execution"""
    
    # Configuration
    JIRA_URL = "https://your-jira-instance.com"
    USERNAME = "your-username"
    API_TOKEN = "your-api-token"
    
    # Create updater instance
    updater = JIRABugUpdater(JIRA_URL, USERNAME, API_TOKEN, max_retries=3)
    
    # Process bugs
    results = updater.process_bugs()
    
    # Output results
    print("\n=== Results ===")
    print(json.dumps(results, indent=2))
    
    return results.get("success", False)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
```

### Error Handling Details

#### 1. Authentication Errors (401, 403)

```python
# 401 - Unauthorized (invalid credentials)
if response.status_code == 401:
    logger.error("Invalid username or API token")
    return None

# 403 - Forbidden (user lacks permissions)
if response.status_code == 403:
    logger.error("User lacks permission to update issues")
    return None
```

#### 2. Rate Limiting (429)

```python
# Implement exponential backoff
if response.status_code == 429:
    retry_after = int(response.headers.get('Retry-After', 1))
    logger.warning(f"Rate limited, waiting {retry_after}s")
    time.sleep(retry_after)
    # Retry request
```

#### 3. Network Errors

```python
try:
    response = requests.get(url, timeout=30)
except requests.exceptions.ConnectTimeout:
    logger.error("Connection timeout")
except requests.exceptions.RequestException as e:
    logger.error(f"Request failed: {e}")
```

### Advanced Features

#### Batch Updates Using Bulk Change

```python
def bulk_update_issues(self, issue_keys):
    """Update multiple issues in single API call"""
    
    # Note: Not all JIRA instances support bulk API
    # Alternative: Use issue navigator and bulk change
    
    payload = {
        "issues": [
            {
                "key": key,
                "fields": {"status": {"name": "In Progress"}}
            }
            for key in issue_keys
        ]
    }
    
    response = self._make_request(
        "POST",
        "/rest/api/3/issues/bulk",
        json_data=payload
    )
    
    return response is not None
```

#### Monitoring and Metrics

```python
import time
from collections import defaultdict

class UpdateMetrics:
    def __init__(self):
        self.start_time = time.time()
        self.api_calls = 0
        self.errors_by_type = defaultdict(int)
    
    def record_error(self, error_type):
        self.errors_by_type[error_type] += 1
    
    def get_summary(self):
        elapsed = time.time() - self.start_time
        return {
            "elapsed_seconds": elapsed,
            "api_calls": self.api_calls,
            "errors": dict(self.errors_by_type)
        }
```

### Testing the Script

```bash
# Run with test dry-run mode
python bug_updater.py --dry-run

# Run with verbose logging
python bug_updater.py --verbose

# Run with specific project filter
python bug_updater.py --project DEVOPS
```

### Best Practices

1. **Rate Limiting**: Always implement exponential backoff
2. **Logging**: Use structured logging for debugging
3. **Retries**: Don't retry on 401/403 (credentials won't change)
4. **Timeouts**: Always set request timeouts
5. **Delays**: Add small delays between API calls
6. **Monitoring**: Track metrics and error rates
7. **Testing**: Test with `--dry-run` first
