# JIRA TOTVS - Guia de Autenticação

## 🔐 Dois Métodos de Autenticação

### 1️⃣ Bearer Token (Recomendado para Produção)

**Mais seguro e melhor prática.**

#### Como obter o token

1. Acesse seu JIRA TOTVS
2. Clique em **Settings** (⚙️) no topo à direita
3. Vá para **API Tokens**
4. Clique em **Create Token**
5. Dê um nome descritivo (ex: "Python Integration")
6. Copie o token gerado

#### Como usar no código

```python
import requests

token = "seu_token_aqui"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(
    "https://seu-jira.totvs.com/api/issue/search",
    headers=headers
)
```

#### Melhor prática: Variáveis de ambiente

```bash
export JIRA_TOKEN="seu_token_aqui"
export JIRA_URL="https://seu-jira.totvs.com/api"
```

```python
import os
import requests

token = os.getenv("JIRA_TOKEN")
url = os.getenv("JIRA_URL")

headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{url}/issue/search", headers=headers)
```

#### Para DELETE/PATCH

Bearer Token é **obrigatório** ou fortemente recomendado:

```python
# ✅ Recomendado
response = requests.patch(
    f"{url}/issue/DEVOPS-123",
    json={"fields": {"status": {"name": "Done"}}},
    headers={"Authorization": f"Bearer {token}"}
)
```

---

### 2️⃣ Basic Auth (Username + Password)

**Simples mas menos seguro. Bom para POC e dev.**

#### Como usar

```python
import requests
from requests.auth import HTTPBasicAuth

response = requests.get(
    "https://seu-jira.totvs.com/api/issue/search",
    auth=HTTPBasicAuth("seu_email@example.com", "sua_senha")
)
```

#### Ou com headers

```python
import base64

user = "seu_email@example.com"
password = "sua_senha"
credentials = base64.b64encode(f"{user}:{password}".encode()).decode()

headers = {
    "Authorization": f"Basic {credentials}",
    "Content-Type": "application/json"
}
```

#### Limitações

⚠️ **NÃO use Basic Auth para PATCH/DELETE**
- Muitos JIRA rejeitam isso por segurança
- Use sempre Bearer Token

---

## ⚙️ Teste de Conexão

### Com curl

```bash
# Bearer Token
curl -H "Authorization: Bearer seu_token" \
     https://seu-jira.totvs.com/api/issue/search?jql=project=DEVOPS

# Basic Auth
curl -u seu_email@example.com:sua_senha \
     https://seu-jira.totvs.com/api/issue/search?jql=project=DEVOPS
```

### Com Python

```python
import requests

# Teste simples
token = "seu_token"
headers = {"Authorization": f"Bearer {token}"}

try:
    response = requests.get(
        "https://seu-jira.totvs.com/api/issue/search?jql=project=DEVOPS",
        headers=headers,
        timeout=5
    )
    
    if response.status_code == 200:
        print("✅ Autenticação OK!")
        print(f"   Encontradas {response.json()['total']} issues")
    
    elif response.status_code == 401:
        print("❌ Token inválido ou expirado")
    
    else:
        print(f"❌ Erro {response.status_code}")

except Exception as e:
    print(f"❌ Erro de conexão: {str(e)}")
```

---

## 🔄 Renovar Token

Os tokens JIRA têm validade. Para renovar:

1. Settings → API Tokens
2. Clique no token expirado → Delete
3. Crie um novo token
4. Atualize seu código

---

## 🛡️ Boas Práticas de Segurança

✅ **Sempre use Bearer Token** em produção  
✅ **Não commite tokens** no Git (use `.env` ou secrets)  
✅ **Rotacione tokens** regularmente  
✅ **Implemente retry** para erros de autenticação  
✅ **Valide certificados SSL** em produção  
✅ **Use HTTPS** apenas  

---

## 🚨 Erros Comuns

### 401 Unauthorized
```
Causa: Token inválido, expirado ou Basic Auth incorreto
Solução: Verifique token em Settings → API Tokens
```

### 403 Forbidden
```
Causa: Usuário sem permissão
Solução: Peça ao admin para adicionar permissões
```

### 404 Not Found
```
Causa: URL ou projeto errado
Solução: Verifique JIRA_URL e project key
```

---

## 📄 Arquivo .env (Exemplo)

```env
# .env
JIRA_URL=https://seu-jira.totvs.com/api
JIRA_TOKEN=seu_token_muito_secreto_aqui
JIRA_PROJECT=DEVOPS
```

```python
# main.py
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("JIRA_URL")
token = os.getenv("JIRA_TOKEN")
project = os.getenv("JIRA_PROJECT")
```

---

## 🔗 Referência

- [API_REFERENCE.md](API_REFERENCE.md) — Endpoints técnicos
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Mais erros
