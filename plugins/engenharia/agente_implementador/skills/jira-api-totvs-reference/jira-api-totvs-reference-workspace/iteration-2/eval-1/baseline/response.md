# Resposta - Eval 1: Script Python para Buscar Issues com Filtros

## Pergunta
Preciso criar um script Python que busque todos os issues de um projeto específico com status diferente de 'Concluído' e que tenham sido criados nos últimos 30 dias. O script deve retornar apenas os campos 'chave', 'resumo', 'status' e 'criado'. Como faço isso usando a API JIRA?

## Resposta

### Solução Utilizando JQL e requests

Para resolver esse problema, você precisa:

1. **Construir uma query JQL** que filtre por:
   - Projeto específico
   - Status diferente de 'Concluído'
   - Data de criação nos últimos 30 dias

2. **Usar a biblioteca `requests` do Python** para fazer chamadas à API REST do JIRA

### Script Completo

```python
import requests
from datetime import datetime, timedelta
import json

# Configurações
JIRA_URL = "https://seu-jira.atlassian.net"
PROJECT_KEY = "SEU_PROJETO"
EMAIL = "seu-email@example.com"
API_TOKEN = "seu-api-token"

# Calcular data de 30 dias atrás
data_30_dias_atras = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

# Construir query JQL
jql_query = f"""
    project = {PROJECT_KEY} 
    AND status != "Concluído"
    AND created >= -{30}d
"""

# Headers com autenticação
headers = {
    "Authorization": f"Basic {EMAIL}:{API_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Parâmetros da requisição
params = {
    "jql": jql_query,
    "fields": "key,summary,status,created",
    "maxResults": 100,
    "startAt": 0
}

try:
    # Fazer requisição
    response = requests.get(
        f"{JIRA_URL}/rest/api/3/search",
        headers=headers,
        params=params
    )
    response.raise_for_status()
    
    # Processar resultado
    data = response.json()
    issues = data.get("issues", [])
    
    print(f"Total de issues encontrados: {len(issues)}\n")
    
    for issue in issues:
        fields = issue.get("fields", {})
        print(f"Chave: {issue['key']}")
        print(f"Resumo: {fields.get('summary', 'N/A')}")
        print(f"Status: {fields.get('status', {}).get('name', 'N/A')}")
        print(f"Criado: {fields.get('created', 'N/A')}")
        print("-" * 50)
    
    # Salvar em JSON (opcional)
    resultado = [
        {
            "chave": issue["key"],
            "resumo": issue["fields"].get("summary"),
            "status": issue["fields"].get("status", {}).get("name"),
            "criado": issue["fields"].get("created")
        }
        for issue in issues
    ]
    
    with open("issues_result.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    
    print(f"\nResultados salvos em 'issues_result.json'")

except requests.exceptions.RequestException as e:
    print(f"Erro na requisição: {e}")
    if hasattr(e.response, 'text'):
        print(f"Resposta do servidor: {e.response.text}")
```

### Pontos Importantes

1. **Autenticação**: Use Basic Auth com email e API token (encode em base64)
2. **JQL Query**: A sintaxe `-30d` busca issues criados nos últimos 30 dias
3. **Fields**: Especifique apenas os campos necessários para otimizar performance
4. **Paginação**: Se tiver mais de 100 issues, implemente paginação com `maxResults` e `startAt`
5. **Tratamento de Erros**: Adicione tratamento para diferentes tipos de erro

### Alternativa com Biblioteca `jira` (python-jira)

```python
from jira import JIRA
from datetime import datetime, timedelta

jira = JIRA(
    server='https://seu-jira.atlassian.net',
    basic_auth=('seu-email@example.com', 'seu-api-token')
)

jql = '''
    project = "PROJETO" 
    AND status != "Concluído"
    AND created >= -30d
'''

issues = jira.search_issues(jql, fields='key,summary,status,created')

for issue in issues:
    print(f"{issue.key}: {issue.fields.summary} - {issue.fields.status.name}")
```

### Tratamento de Paginação em Massa

```python
def fetch_all_issues(jql_query, fields):
    all_issues = []
    start_at = 0
    max_results = 50
    
    while True:
        response = requests.get(
            f"{JIRA_URL}/rest/api/3/search",
            headers=headers,
            params={
                "jql": jql_query,
                "fields": fields,
                "maxResults": max_results,
                "startAt": start_at
            }
        )
        
        data = response.json()
        issues = data.get("issues", [])
        
        if not issues:
            break
        
        all_issues.extend(issues)
        start_at += max_results
    
    return all_issues
```

### Notas de Segurança

- Não hardcode credenciais no código
- Use variáveis de ambiente: `os.getenv("JIRA_EMAIL")`, `os.getenv("JIRA_TOKEN")`
- Para Jira Cloud, prefira API Tokens gerados no painel de admin
- Para Jira Server/Data Center, use o token ou Basic Auth
