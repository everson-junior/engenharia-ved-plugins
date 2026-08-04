#!/usr/bin/env python3
"""
Fetch and parse the TOTVS JIRA API OpenAPI specification.
Extracts key endpoints, parameters, and schemas for reference.
"""

import requests
import yaml
import json
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin
import sys

SWAGGER_URL = "https://totvsti-cdn.azureedge.net/apis/production/swagger/swagger-jira-api.yaml"

class JiraAPIParser:
    def __init__(self, swagger_url: str = SWAGGER_URL):
        self.swagger_url = swagger_url
        self.spec = None
        self.endpoints = {}
        
    def fetch_spec(self) -> Dict[str, Any]:
        """Fetch and parse the OpenAPI YAML specification."""
        try:
            response = requests.get(self.swagger_url, timeout=10)
            response.raise_for_status()
            self.spec = yaml.safe_load(response.text)
            return self.spec
        except Exception as e:
            print(f"Error fetching spec: {e}", file=sys.stderr)
            return None
    
    def extract_issue_endpoints(self) -> Dict[str, Any]:
        """Extract endpoints related to issues (GET, POST, PATCH, DELETE)."""
        if not self.spec or 'paths' not in self.spec:
            return {}
        
        issue_endpoints = {}
        paths = self.spec.get('paths', {})
        
        for path, methods in paths.items():
            if 'issue' in path.lower() or 'search' in path.lower():
                issue_endpoints[path] = {}
                for method in ['get', 'post', 'patch', 'put', 'delete']:
                    if method in methods:
                        endpoint_info = methods[method]
                        issue_endpoints[path][method.upper()] = {
                            'summary': endpoint_info.get('summary', 'N/A'),
                            'description': endpoint_info.get('description', ''),
                            'parameters': endpoint_info.get('parameters', []),
                            'requestBody': endpoint_info.get('requestBody', {}),
                        }
        
        return issue_endpoints
    
    def extract_auth_info(self) -> Dict[str, Any]:
        """Extract authentication scheme information."""
        if not self.spec:
            return {}
        
        components = self.spec.get('components', {})
        security_schemes = components.get('securitySchemes', {})
        return security_schemes
    
    def get_endpoint_example(self, path: str, method: str = 'GET') -> Dict[str, Any]:
        """Get detailed information about a specific endpoint."""
        if not self.spec or 'paths' not in self.spec:
            return {}
        
        paths = self.spec.get('paths', {})
        if path not in paths:
            return {'error': f'Path {path} not found'}
        
        if method.lower() not in paths[path]:
            return {'error': f'Method {method} not supported for {path}'}
        
        endpoint = paths[path][method.lower()]
        return {
            'path': path,
            'method': method.upper(),
            'summary': endpoint.get('summary', ''),
            'description': endpoint.get('description', ''),
            'parameters': endpoint.get('parameters', []),
            'requestBody': endpoint.get('requestBody', {}),
            'responses': endpoint.get('responses', {}),
            'tags': endpoint.get('tags', []),
        }
    
    def list_all_issue_paths(self) -> List[str]:
        """List all issue-related endpoint paths."""
        if not self.spec or 'paths' not in self.spec:
            return []
        
        paths = self.spec.get('paths', {})
        issue_paths = [p for p in paths.keys() 
                      if 'issue' in p.lower() or 'search' in p.lower()]
        return sorted(issue_paths)
    
    def generate_python_client_stub(self, endpoint_path: str, method: str = 'GET') -> str:
        """Generate a Python client code stub for an endpoint."""
        endpoint_info = self.get_endpoint_example(endpoint_path, method)
        
        if 'error' in endpoint_info:
            return f"# Error: {endpoint_info['error']}"
        
        method_lower = method.lower()
        function_name = f"{method_lower}_issue"
        
        stub = f'''
import requests
from typing import Dict, Any, Optional

def {function_name}(
    base_url: str = "https://your-jira-instance.com/api",
    auth: tuple = ("username", "password"),
    **kwargs
) -> Dict[str, Any]:
    """
    {endpoint_info.get('summary', 'JIRA API call')}
    
    {endpoint_info.get('description', '')}
    
    Args:
        base_url: JIRA API base URL
        auth: (username, password) tuple for authentication
        **kwargs: Additional request parameters
    
    Returns:
        API response as dictionary
    """
    url = base_url + "{endpoint_path}"
    
    response = requests.{method_lower}(
        url,
        auth=auth,
        headers={{"Content-Type": "application/json"}},
        **kwargs
    )
    
    response.raise_for_status()
    return response.json()
'''
        return stub

def main():
    parser = JiraAPIParser()
    spec = parser.fetch_spec()
    
    if not spec:
        print("Failed to fetch API specification", file=sys.stderr)
        sys.exit(1)
    
    print("=== TOTVS JIRA API Reference ===\n")
    
    # Show API info
    info = spec.get('info', {})
    print(f"API: {info.get('title', 'Unknown')}")
    print(f"Version: {info.get('version', 'Unknown')}\n")
    
    # List issue endpoints
    issue_paths = parser.list_all_issue_paths()
    print(f"Issue-related endpoints ({len(issue_paths)}):")
    for path in issue_paths[:10]:  # Show first 10
        print(f"  - {path}")
    
    if len(issue_paths) > 10:
        print(f"  ... and {len(issue_paths) - 10} more")
    
    print("\n=== Authentication ===")
    auth = parser.extract_auth_info()
    for scheme_name, scheme_info in auth.items():
        print(f"{scheme_name}: {scheme_info.get('type', 'unknown')}")
    
    # Example: Get details for first issue endpoint
    if issue_paths:
        print(f"\n=== Example: {issue_paths[0]} ===")
        example = parser.get_endpoint_example(issue_paths[0], 'GET')
        print(f"Summary: {example.get('summary', 'N/A')}")
        print(f"Method: GET")
        print(f"\nParameters: {len(example.get('parameters', []))} defined")
        
        print(f"\n--- Generated Python Stub ---")
        stub = parser.generate_python_client_stub(issue_paths[0], 'GET')
        print(stub)

if __name__ == "__main__":
    main()
