# JIRA TOTVS - Guia para Atualizar Issues (PATCH)

## 🎯 O que é PATCH?

PATCH é um método HTTP para **atualizar parcialmente** um recurso existente.
- Endpoint: `/api/issue/{issue_key}`
- Método: `PATCH`
- Autenticação: **Bearer Token** (recomendado)

---

## 📋 Campos Atualizáveis

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `status` | string | "To Do", "In Progress", "In Review", "Done" |
| `priority` | string | "Low", "Medium", "High", "Critical" |
| `assignee` | object | `{"name": "usuario"}` |
| `labels` | array | `["bug", "urgent"]` |
| `description` | string | "Descrição da issue" |
| `resolution` | string | "Fixed", "Won't Fix", "Duplicate" |
| `duedate` | string | "2024-12-31" |

---

## 🚀 Exemplo Mínimo (Copia e Cola)

```python
import requests

# CONFIGURE
url = "https://seu-jira.totvs.com/api/issue/DEVOPS-123"
token = "seu_token_api"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# PATCH
response = requests.patch(
    url,
    json={"fields": {"status": {"name": "In Progress"}}},
    headers=headers
)

print(f"Status: {response.status_code}")  # 200 ou 204 = sucesso
```

---

## 📝 Casos de Uso Comuns

### 1️⃣ Atualizar Status
```python
payload = {"fields": {"status": {"name": "Done"}}}
```

### 2️⃣ Atualizar Prioridade
```python
payload = {"fields": {"priority": {"name": "High"}}}
```

### 3️⃣ Atribuir Usuário
```python
payload = {"fields": {"assignee": {"name": "joao.santillo"}}}
```

### 4️⃣ Atualizar Múltiplos Campos
```python
payload = {
    "fields": {
        "status": {"name": "In Progress"},
        "priority": {"name": "High"},
        "assignee": {"name": "joao.santillo"},
        "labels": ["urgent", "backend"]
    }
}
```

### 5️⃣ Fechar Issue (Status + Resolution)
```python
payload = {
    "fields": {
        "status": {"name": "Done"},
        "resolution": {"name": "Fixed"}
    }
}
```

---

## ⚠️ Códigos de Erro Comuns

| Código | Significado | Solução |
|--------|-------------|---------|
| **200/204** | ✅ Sucesso | - |
| **400** | Payload inválido | Verifique nomes de campos |
| **401** | Token inválido | Gere novo token em Settings |
| **403** | Sem permissão | Verifique permissões do usuário |
| **404** | Issue não existe | Verifique issue_key |
| **429** | Rate limit | Aguarde 60s e tente novamente |

---

## 🔐 Como Obter Token da API

1. Acesse seu JIRA TOTVS
2. Clique em **Settings** (⚙️)
3. Vá para **API Tokens**
4. Clique em **Create Token**
5. Copie o token gerado

---

## 📚 Arquivo de Referência Completa

Veja `../examples/update/patch_issues.py` para 6 exemplos com tratamento de erro.

---

## 💡 Dicas Práticas

✅ **Sempre use Bearer Token** para PATCH  
✅ **Teste com issue_key conhecida** antes de automatizar  
✅ **Implemente retry** para erro 429  
✅ **Use try/except** para timeouts  
✅ **Valide status possíveis** antes de fazer PATCH  

---

## 🧪 Teste Rápido

```bash
python ../examples/update/test_patch_quick.py
```
(Configure BASE_URL, ISSUE_KEY e BEARER_TOKEN dentro do arquivo)

---

## 🔗 Referência

- [API_REFERENCE.md](API_REFERENCE.md) — Endpoints técnicos
- [AUTH_GUIDE.md](AUTH_GUIDE.md) — Autenticação
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Erros comuns
