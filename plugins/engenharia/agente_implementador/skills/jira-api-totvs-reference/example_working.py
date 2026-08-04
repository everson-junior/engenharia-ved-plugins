#!/usr/bin/env python3
"""
JIRA TOTVS API - Working Example
Tested and working on TOTVS JIRA Production (jiraproducao.totvs.com.br)
"""

import requests
from requests.auth import HTTPBasicAuth
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path, override=True)

# Configuration
BASE_URL = os.getenv("JIRA_BASE_URL", "https://jiraproducao.totvs.com.br/rest/api/2")
USERNAME = os.getenv("JIRA_USERNAME")  # e.g., "joao.santillo" (WITHOUT @totvs.com.br)
PASSWORD = os.getenv("JIRA_PASSWORD")

# Required headers to avoid XSRF and Cloudflare blocks
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "X-Atlassian-Token": "no-check"
}

print(f"🔐 Authenticating as: {USERNAME}")


def create_issue(project_key, summary, issue_type="Task", description=None, priority=None):
    """
    Create a JIRA issue
    
    Args:
        project_key (str): Project key (e.g., "DVARENGIA")
        summary (str): Issue title
        issue_type (str): Issue type (Task, Bug, Story, Epic)
        description (str, optional): Issue description
        priority (str, optional): Priority (Low, Medium, High, Critical)
    
    Returns:
        dict: Created issue data or None on error
    """
    url = f"{BASE_URL}/issue"
    
    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": summary,
            "issuetype": {"name": issue_type}
        }
    }
    
    # Add optional fields
    if description:
        payload["fields"]["description"] = description
    if priority:
        payload["fields"]["priority"] = {"name": priority}
    
    response = requests.post(url, json=payload, headers=HEADERS, auth=HTTPBasicAuth(USERNAME, PASSWORD))
    
    if response.status_code in [200, 201]:
        issue_data = response.json()
        print(f"✅ Issue created: {issue_data['key']}")
        print(f"   ID: {issue_data['id']}")
        print(f"   URL: {issue_data['self']}")
        return issue_data
    else:
        print(f"❌ Error {response.status_code}: {response.text[:300]}")
        return None


def search_issues(jql, max_results=50):
    """
    Search for issues using JQL
    
    Args:
        jql (str): JQL query string
        max_results (int): Maximum number of results
    
    Returns:
        list: List of issues or None on error
    """
    url = f"{BASE_URL}/search"
    params = {
        "jql": jql,
        "maxResults": max_results
    }
    
    response = requests.get(url, params=params, headers=HEADERS, auth=HTTPBasicAuth(USERNAME, PASSWORD))
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {data['total']} issues")
        return data['issues']
    else:
        print(f"❌ Error {response.status_code}: {response.text[:300]}")
        return None


def get_issue(issue_key):
    """
    Get details of a specific issue
    
    Args:
        issue_key (str): Issue key (e.g., "DVARENGIA-123")
    
    Returns:
        dict: Issue data or None on error
    """
    url = f"{BASE_URL}/issue/{issue_key}"
    
    response = requests.get(url, headers=HEADERS, auth=HTTPBasicAuth(USERNAME, PASSWORD))
    
    if response.status_code == 200:
        issue_data = response.json()
        print(f"✅ Issue: {issue_data['key']} - {issue_data['fields']['summary']}")
        return issue_data
    else:
        print(f"❌ Error {response.status_code}: {response.text[:300]}")
        return None


# Example usage
if __name__ == "__main__":
    print("=" * 70)
    print("JIRA TOTVS API - Working Example")
    print("=" * 70)
    
    # Example 1: Create a simple task
    project_key = "DVARENGIA"  # Change to your project
    create_issue(project_key, "Test issue from API")
    
    # Example 2: Create a bug with description and priority
    # create_issue(
    #     project_key,
    #     "Bug in login system",
    #     issue_type="Bug",
    #     description="Users cannot login with special characters in password",
    #     priority="High"
    # )
    
    # Example 3: Search for issues assigned to you
    # search_issues("assignee = currentUser() AND status != Done")
    
    # Example 4: Get specific issue details
    # get_issue("DVARENGIA-123")
    
    print("\n✅ Example completed!")
