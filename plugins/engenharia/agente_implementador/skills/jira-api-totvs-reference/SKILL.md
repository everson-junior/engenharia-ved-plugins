---
name: jira-api-totvs-reference
description: "Use somente ao implementar ou depurar o servidor MCP/cliente interno da API JIRA TOTVS: endpoints, requests/responses, autenticacao, JQL, XSRF, Cloudflare WAF e exemplos tecnicos. Nao use para consultar issues operacionais fora das ferramentas MCP JIRA."
compatibility: "Requer: requests, python-dotenv para .env; Testado em: Python 3.x com JIRA TOTVS Producao (jiraproducao.totvs.com.br)"
---

# Referencia Interna da API JIRA TOTVS

Use esta skill para desenvolver ou depurar o proprio servidor MCP/cliente interno que integra com a API JIRA TOTVS. Ela serve para consultar endpoints, gerar exemplos Python de implementacao interna, resolver erros comuns e aplicar os headers/autenticacao que funcionam no ambiente de Producao TOTVS.

## Restricao Operacional Obrigatoria

Para consultar dados reais do JIRA durante o atendimento ao usuario, use exclusivamente as ferramentas MCP JIRA disponiveis. Nao use esta skill para substituir uma consulta operacional via MCP por chamada direta a API, `requests`, `curl`, navegador, scripts locais ou arquivos exportados.

Esta skill so autoriza uso direto da API quando a tarefa for implementar, testar ou depurar o servidor MCP, o `JiraClient`, services internos ou documentacao tecnica da integracao.

## Correcao Rapida

**Erro `403 XSRF check failed`**: adicione o header:

```python
headers = {"X-Atlassian-Token": "no-check"}
```

**Erro `403 Forbidden` por Cloudflare**: adicione `User-Agent`:

```python
headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
```

**Headers completos recomendados**:

```python
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "Accept": "application/json",
    "X-Atlassian-Token": "no-check",
}
```

## Quando Usar

- Implementar ou depurar ferramentas MCP que buscam issues por JQL, status, projeto, responsavel ou periodo.
- Implementar ou depurar ferramentas MCP que criam, atualizam, transicionam ou excluem issues pela API.
- Depurar `401`, `403`, `404`, `429`, XSRF ou bloqueio Cloudflare.
- Gerar codigo Python para o cliente interno do MCP ou exemplos tecnicos de integracao, nao para contornar o MCP em consultas operacionais.
- Entender Basic Auth, Bearer Token, headers obrigatorios e formato de usuario.
- Consultar endpoints e payloads antes de implementar uma ferramenta MCP.

## Conceitos Essenciais

### Autenticacao

**Basic Auth** e o caminho recomendado para scripts simples e POCs:

```python
from requests.auth import HTTPBasicAuth

auth = HTTPBasicAuth("joao.santillo", "senha_ou_token")
```

Use o usuario sem dominio:

- Correto: `joao.santillo`
- Incorreto: `joao.santillo@totvs.com.br`

**Bearer Token** tambem pode ser usado quando o cenario exigir token:

```python
headers = {"Authorization": "Bearer TOKEN"}
```

### Base URL

```python
BASE_URL = "https://jiraproducao.totvs.com.br/rest/api/2"
```

### JQL

Use JQL para filtrar buscas:

```text
project = DVARENGIA AND status != Done
assignee = currentUser()
created >= -7d
priority IN (High, Critical)
```

## Exemplos Rapidos

### Buscar issues

```python
import requests
from requests.auth import HTTPBasicAuth

response = requests.get(
    f"{BASE_URL}/search",
    params={"jql": "project = DVARENGIA AND status != Done"},
    headers=HEADERS,
    auth=HTTPBasicAuth(USERNAME, PASSWORD),
)
issues = response.json().get("issues", [])
```

### Criar issue

```python
response = requests.post(
    f"{BASE_URL}/issue",
    json={
        "fields": {
            "project": {"key": "DVARENGIA"},
            "summary": "Titulo da tarefa",
            "issuetype": {"name": "Task"},
        }
    },
    headers=HEADERS,
    auth=HTTPBasicAuth(USERNAME, PASSWORD),
)
```

### Transicionar issue

```python
response = requests.post(
    f"{BASE_URL}/issue/DVARENGIA-123/transitions",
    json={"transition": {"id": "21"}},
    headers=HEADERS,
    auth=HTTPBasicAuth(USERNAME, PASSWORD),
)
```

## Tratamento de Erros

| Erro | Causa provavel | Acao |
|------|----------------|------|
| `401 Unauthorized` | Credenciais invalidas ou usuario com dominio | Verifique usuario sem `@totvs.com.br` e senha/token |
| `403 XSRF check failed` | Falta `X-Atlassian-Token` | Adicione `X-Atlassian-Token: no-check` |
| `403 Forbidden` | Cloudflare ou permissao JIRA | Adicione `User-Agent`; se persistir, cheque permissao |
| `404 Not Found` | Chave ou endpoint incorreto | Verifique chave, URL e se a issue existe |
| `429` | Muitas requisicoes | Use backoff exponencial e paginacao menor |
| `400 Bad Request` | Payload/campo invalido | Confira campos obrigatorios, nomes e JSON |

## Arquivos de Referencia

- `example_working.py`: exemplo Python completo e testado.
- `.env.example`: modelo de variaveis de ambiente.
- `references/api-quick-ref.md`: endpoints e exemplos comuns.
- `scripts/fetch_and_parse_api.py`: utilitario para explorar o OpenAPI oficial.

## Boas Praticas

- Guarde credenciais em `.env`; nao hardcode senhas ou tokens.
- Inclua `Content-Type`, `Accept`, `User-Agent` e `X-Atlassian-Token`.
- Use `HTTPBasicAuth` em vez de montar Basic Auth manualmente.
- Registre `response.status_code` e `response.text` em falhas.
- Use `maxResults` e paginacao em buscas grandes.

## Integracao com MCP

Ao criar um servidor MCP para JIRA, use esta skill para entender endpoints e payloads. Encapsule as chamadas em services/tools MCP, mantendo validacao, tratamento de erro e formatacao de resposta no padrao do projeto.
