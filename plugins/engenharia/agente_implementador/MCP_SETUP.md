# MCP setup

The VS Code agent-plugin loader currently registers only the `mcpServers` map from a plugin. It does not retain an `inputs` block, so `${input:...}` variables cannot be used in the plugin's `.mcp.json` file.

The bundled servers use these environment variables instead:

- `TOTVS_JIRA_MCP_AUTH_TOKEN`: Bearer token for the JIRA MCP server.
- `TOTVS_ADO_ORG`: Azure DevOps organization name.

To configure the values through VS Code prompts instead, disable the plugin's bundled `jira` and `azureDevopsLocal` MCP servers in **MCP: List Servers**, then add the following configuration to `.vscode/mcp.json` in the workspace:

```json
{
  "inputs": [
    {
      "id": "totvs-jira-token",
      "type": "promptString",
      "description": "Token Bearer do MCP JIRA TOTVS",
      "password": true
    },
    {
      "id": "totvs-ado-org",
      "type": "promptString",
      "description": "Nome da organizacao do Azure DevOps"
    }
  ],
  "servers": {
    "totvsJira": {
      "type": "http",
      "url": "http://develop.engenharia-vd.totvs.io:18066/mcp",
      "headers": {
        "Authorization": "Bearer ${input:totvs-jira-token}"
      }
    },
    "totvsAzureDevops": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@azure-devops/mcp",
        "${input:totvs-ado-org}",
        "-d",
        "core",
        "repositories",
        "pipelines",
        "-a",
        "azcli"
      ]
    }
  }
}
```

VS Code asks for both values when each workspace MCP server starts for the first time and stores them securely for subsequent starts.