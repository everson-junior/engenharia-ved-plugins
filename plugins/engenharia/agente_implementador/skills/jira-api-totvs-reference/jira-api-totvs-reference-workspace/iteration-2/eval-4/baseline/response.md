# Resposta - Eval 4: Query JQL Complexa com Múltiplos Critérios

## Pergunta
Preciso filtrar issues do JIRA usando múltiplos critérios: projeto 'DEVOPS', tipo 'Bug' ou 'Task', prioridade 'Alta' ou 'Crítica', status != 'Concluído', e que tenham uma label específica. Como escrevo a query JQL?

## Resposta

### Construção Completa da Query JQL

Para combinar múltiplos critérios, use operadores lógicos `AND` (intersecção) e `OR` (união). Quando usar `OR`, coloque entre parênteses.

### Query Básica e Explicitada

```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
```

---

## Breakdown da Query

### 1. **Projeto Específico**
```jql
project = DEVOPS
```
- Use `=` para um projeto
- Se múltiplos: `project in (DEVOPS, INFRA)`

### 2. **Tipo (Bug ou Task)**
```jql
issuetype in (Bug, Task)
```
- Sintaxe: `issuetype in (Tipo1, Tipo2, Tipo3)`
- Nota: Nomes são case-sensitive no JIRA

### 3. **Prioridade (Alta ou Crítica)**
```jql
priority in ("Alta", "Crítica")
```
- Use aspas duplas se o nome tem espaço ou caractere especial
- Prioridades comuns: Blocker, Critical, High, Medium, Low

### 4. **Status Diferente de Concluído**
```jql
status != "Concluído"
```
- Ou use múltiplos valores: `status in ("Em Progresso", "Open", "Em Revisão")`

### 5. **Label Específica**
```jql
labels = "minha-label"
```
- Para múltiplas labels (AND): `labels = label1 AND labels = label2`
- Para múltiplas labels (OR): `labels in (label1, label2, label3)`

---

## Query Completa Final

```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
```

### Variações Úteis

#### **Com múltiplas labels (qualquer uma)**
```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels in ("minha-label", "urgente", "prod")
```

#### **Com múltiplas labels (todas obrigatórias)**
```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
AND labels = "urgente"
```

#### **Com data (criadas nesta semana)**
```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
AND created >= -7d
```

#### **Com atribuição (não atribuída)**
```jql
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
AND assignee is EMPTY
```

---

## Script Python para Usar Essa Query

### Opção 1: Com requests direto

```python
import requests
import json

JIRA_URL = "https://seu-jira.atlassian.net"
EMAIL = "seu-email@example.com"
API_TOKEN = "seu-api-token"

jql_query = '''
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
ORDER BY priority DESC, created DESC
'''

headers = {"Accept": "application/json"}

response = requests.get(
    f"{JIRA_URL}/rest/api/3/search",
    params={
        "jql": jql_query,
        "fields": "key,summary,priority,status,issuetype,labels,created",
        "maxResults": 100
    },
    auth=(EMAIL, API_TOKEN),
    headers=headers
)

data = response.json()
print(f"Total encontrados: {data['total']}")

for issue in data.get("issues", []):
    print(f"\nChave: {issue['key']}")
    print(f"Resumo: {issue['fields']['summary']}")
    print(f"Prioridade: {issue['fields']['priority']['name']}")
    print(f"Status: {issue['fields']['status']['name']}")
    print(f"Labels: {issue['fields']['labels']}")
```

### Opção 2: Com biblioteca python-jira

```python
from jira import JIRA

jira = JIRA(
    server='https://seu-jira.atlassian.net',
    basic_auth=('seu-email@example.com', 'seu-api-token')
)

jql = '''
project = DEVOPS 
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
ORDER BY priority DESC
'''

issues = jira.search_issues(jql, maxResults=False)
print(f"Total: {len(issues)}")

for issue in issues:
    print(f"{issue.key}: {issue.fields.summary} - {issue.fields.priority}")
```

---

## Dicas e Notas Importantes

### 1. **Ordre de Prioridade**
```jql
ORDER BY priority DESC, created DESC
```
- DESC = descendente (valores maiores primeiro)
- ASC = ascendente (padrão)

### 2. **Buscar por Múltiplos Projetos**
```jql
project in (DEVOPS, INFRA, QA)
AND issuetype in (Bug, Task)
AND priority in ("Alta", "Crítica")
AND status != "Concluído"
AND labels = "minha-label"
```

### 3. **Negação (NOT)**
```jql
NOT issuetype = Epic
NOT labels = "no-proc"
```

### 4. **Campos Vazios**
```jql
assignee is EMPTY
labels is EMPTY
description is NOT EMPTY
```

### 5. **Buscar por Campo Customizado**
```jql
customfield_10000 = "valor"
cf[10000] = "valor"  # Alternativa
```

### 6. **Buscar por Regex (se habilitado)**
```jql
summary ~ "regex.*pattern"
```

### 7. **Paginação em Python**
```python
def fetch_all_issues(jql_query):
    all_issues = []
    start_at = 0
    
    while True:
        response = requests.get(
            f"{JIRA_URL}/rest/api/3/search",
            params={
                "jql": jql_query,
                "maxResults": 50,
                "startAt": start_at
            },
            auth=(EMAIL, API_TOKEN)
        )
        
        data = response.json()
        issues = data.get("issues", [])
        
        if not issues:
            break
        
        all_issues.extend(issues)
        start_at += 50
    
    return all_issues

# Usar
issues = fetch_all_issues(jql_query)
print(f"Total coletadas: {len(issues)}")
```

### 8. **Validar Query no JIRA UI Primeiro**

Antes de implementar em Python:
1. Acesse: `https://seu-jira.atlassian.net/issues/?jql=...`
2. Cole a query
3. Clique "Search"
4. Veja se retorna os resultados esperados

---

## Checklist de Sintaxe

- [ ] Projeto: `project = DEVOPS` ✓
- [ ] Tipos: `issuetype in (Bug, Task)` ✓
- [ ] Prioridades: `priority in ("Alta", "Crítica")` ✓
- [ ] Status: `status != "Concluído"` ✓
- [ ] Labels: `labels = "minha-label"` ✓
- [ ] Múltiplos critérios unidos com `AND` ✓
- [ ] Strings com espaço entre aspas duplas ✓
- [ ] Operadores IN com parênteses ✓
- [ ] Nomes case-sensitive quando apropriado ✓

---

## Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `project DEVOPS` | Falta `=` | `project = DEVOPS` |
| `issuetype = Bug, Task` | Falta `in` | `issuetype in (Bug, Task)` |
| `priority = Alta` | Múltiplos sem `in` | `priority in ("Alta", "Crítica")` |
| `labels minha-label` | Falta `=` | `labels = "minha-label"` |
| `status != Concluído` | Falta aspas | `status != "Concluído"` |
