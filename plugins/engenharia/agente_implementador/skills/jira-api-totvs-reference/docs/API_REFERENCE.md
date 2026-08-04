# JIRA TOTVS - Referência Técnica de Endpoints

## 📡 Base URL
```
https://seu-jira.totvs.com/api
```

## 🔍 Search Issues (GET)

**Endpoint:** `/issue/search`

**Parâmetros:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `jql` | string | JQL query (obrigatório) |
| `maxResults` | int | Máx resultados (default: 50) |
| `startAt` | int | Offset para paginação |
| `fields` | string | Campos retornados (comma-separated) |
| `orderBy` | string | Campo para ordenação |

**Exemplo:**
```
GET /issue/search?jql=project=DEVOPS&maxResults=50&orderBy=updated DESC
```

**Response:**
```json
{
  "total": 42,
  "issues": [
    {
      "key": "DEVOPS-123",
      "fields": {
        "summary": "Issue title",
        "status": {"name": "To Do"},
        "priority": {"name": "High"}
      }
    }
  ]
}
```

---

## ➕ Create Issue (POST)

**Endpoint:** `/issue`

**Body (JSON):**
```json
{
  "fields": {
    "project": {"key": "DEVOPS"},
    "summary": "Issue title",
    "issuetype": {"name": "Task"},
    "priority": {"name": "High"},
    "description": "Issue description",
    "labels": ["tag1", "tag2"],
    "assignee": {"name": "username"}
  }
}
```

**Response (201):**
```json
{
  "id": "10000",
  "key": "DEVOPS-123",
  "self": "https://seu-jira.totvs.com/rest/api/2/issue/10000"
}
```

---

## ✏️ Update Issue (PATCH)

**Endpoint:** `/issue/{issue-key}`

**Body (JSON):**
```json
{
  "fields": {
    "status": {"name": "In Progress"},
    "priority": {"name": "Critical"},
    "labels": ["urgent"],
    "description": "Updated description"
  }
}
```

**Response (204):** No content (sucesso)

---

## ❌ Delete Issue (DELETE)

**Endpoint:** `/issue/{issue-key}`

**Response (204):** No content (sucesso)

---

## 📊 HTTP Status Codes

| Code | Significado | Ação |
|------|-------------|------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado |
| 204 | No Content | Sucesso sem corpo de resposta |
| 400 | Bad Request | Payload ou parâmetro inválido |
| 401 | Unauthorized | Token inválido/expirado |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Conflito (ex: dependências) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Server Error | Erro do servidor |

---

## 🎯 Issue Type (Tipos)

```
- Task
- Bug
- Story
- Epic
- Sub-task
```

---

## 📈 Priority (Prioridades)

```
- Low
- Medium
- High
- Critical
```

---

## ✅ Status (Estados)

```
- To Do
- In Progress
- In Review
- Done
```

---

## 🏷️ Fields (Campos Principais)

```
- project        → Projeto (obrigatório ao criar)
- summary        → Título (obrigatório ao criar)
- description    → Descrição
- issuetype      → Tipo (obrigatório ao criar)
- priority       → Prioridade
- status         → Status
- assignee       → Responsável
- labels         → Tags
- duedate        → Data limite (YYYY-MM-DD)
- resolution     → Resolução (Fixed, Won't Fix, etc)
- fixVersions    → Versões
- components     → Componentes
```

---

## 📋 JQL Operators (Sintaxe de Busca)

```
=               igual
!=              não igual
in ()           está em lista
not in ()       não está em lista
>=              maior ou igual
<=              menor ou igual
>               maior
<               menor

AND             e lógico
OR              ou lógico
NOT             negação

"..."           string exata
-30d            últimos 30 dias
currentUser()   usuário atual
EMPTY           campo vazio
NULL            sem valor
```

---

## 🔗 Exemplo Completo

```python
import requests

token = "seu_token"
headers = {"Authorization": f"Bearer {token}"}

# Search
r1 = requests.get(
    "https://seu-jira.totvs.com/api/issue/search",
    params={"jql": "project = DEVOPS AND status != Done"},
    headers=headers
)

# Create
r2 = requests.post(
    "https://seu-jira.totvs.com/api/issue",
    json={"fields": {"project": {"key": "DEVOPS"}, "summary": "Task"}},
    headers=headers
)

# Update
r3 = requests.patch(
    "https://seu-jira.totvs.com/api/issue/DEVOPS-123",
    json={"fields": {"status": {"name": "Done"}}},
    headers=headers
)

# Delete
r4 = requests.delete(
    "https://seu-jira.totvs.com/api/issue/DEVOPS-123",
    headers=headers
)
```
