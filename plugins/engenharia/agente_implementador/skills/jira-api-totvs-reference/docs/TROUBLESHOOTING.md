# JIRA TOTVS - Troubleshooting & Erros Comuns

## 🔴 Erros Frequentes

### 401 - Unauthorized

```
❌ Erro 401: Token inválido ou expirado
```

**Causas:**
- Token expirado
- Token copiado errado
- Usuário não tem permissão
- Token foi deletado

**Solução:**
```python
# 1. Verifique o token
print(f"Token: {token[:10]}...")  # Primeiros 10 caracteres

# 2. Regenere o token em Settings → API Tokens
token = "novo_token_aqui"

# 3. Teste
response = requests.get(
    "https://seu-jira.totvs.com/api/issue/search?jql=project=DEVOPS",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Status: {response.status_code}")  # Deve ser 200
```

---

### 403 - Forbidden

```
❌ Erro 403: Sem permissão para atualizar esta issue
```

**Causas:**
- Usuário não tem permissão no projeto
- Tentou fazer PATCH com Basic Auth
- Issue está travada
- Projeto restringe operações

**Solução:**
```python
# 1. Use Bearer Token (não Basic Auth)
headers = {
    "Authorization": f"Bearer {token}",  # ✅ Correto
    "Content-Type": "application/json"
}

# 2. Peça ao admin para adicionar permissão ao projeto
# 3. Verifique se a issue está bloqueada
```

**Para PATCH/DELETE:**
```python
# ❌ ERRADO - Basic Auth para PATCH
response = requests.patch(
    url,
    auth=HTTPBasicAuth("user", "pass")  # Muitos JIRA rejeitam isso
)

# ✅ CORRETO - Bearer Token
headers = {"Authorization": f"Bearer {token}"}
response = requests.patch(url, headers=headers, json=payload)
```

---

### 404 - Not Found

```
❌ Erro 404: Issue DEVOPS-123 não encontrada
```

**Causas:**
- Projeto errado
- Issue foi deletada
- Chave escrita errada
- URL base incorreta

**Solução:**
```python
# Verifique os valores
print(f"Base URL: {base_url}")
print(f"Issue Key: {issue_key}")
print(f"URL completa: {base_url}/issue/{issue_key}")

# Teste search primeiro
response = requests.get(
    f"{base_url}/issue/search?jql=project=DEVOPS",
    headers=headers
)

# Se retornar issues, o base_url está correto
```

---

### 400 - Bad Request

```
❌ Erro 400: Payload inválido
```

**Causas:**
- Campos obrigatórios faltando
- Tipo de dados errado
- Nome do campo errado
- JSON mal formatado

**Solução:**
```python
# ❌ ERRADO
payload = {
    "summary": "Task",      # Falta 'fields'
    "project": "DEVOPS"      # Deve ser object {"key": "DEVOPS"}
}

# ✅ CORRETO
payload = {
    "fields": {
        "summary": "Task",
        "project": {"key": "DEVOPS"},
        "issuetype": {"name": "Task"}
    }
}

# Debug: Imprima o JSON
import json
print(json.dumps(payload, indent=2))
```

---

### 429 - Too Many Requests (Rate Limit)

```
❌ Erro 429: Taxa de requisições excedida
```

**Causa:** Você fez muitos requests muito rápido

**Solução com Retry:**
```python
import requests
import time

def get_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)
        
        if response.status_code == 429:
            wait_time = int(response.headers.get('Retry-After', 60))
            print(f"Rate limited. Aguardando {wait_time}s...")
            time.sleep(wait_time)
            continue
        
        return response
    
    return None

# Uso
response = get_with_retry(url, headers)
```

---

### 500 - Internal Server Error

```
❌ Erro 500: Erro do servidor JIRA
```

**Causas:**
- Servidor JIRA em manutenção
- Erro na operação (ex: field customizado não existe)
- Conflito de dados

**Solução:**
```python
# 1. Aguarde um pouco
import time
time.sleep(60)

# 2. Tente novamente
response = requests.get(url, headers=headers)

# 3. Se persistir, contate admin JIRA
```

---

## ⚠️ Problemas de Conexão

### Timeout

```python
# Aumente o timeout
response = requests.get(
    url,
    headers=headers,
    timeout=30  # 30 segundos em vez de 5
)
```

### SSL Certificate Error

```python
# ⚠️ APENAS em desenvolvimento
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

response = requests.get(url, headers=headers, verify=False)

# ✅ Em produção, corrija o certificado
```

### ConnectionRefused

```
❌ ConnectionRefused: Não conseguiu conectar
```

**Verificar:**
1. Base URL está correta?
2. JIRA está online?
3. Firewall bloqueando?

```bash
# Teste com curl
curl https://seu-jira.totvs.com/api/issue/search

# Teste com ping
ping seu-jira.totvs.com
```

---

## 🧪 Script de Diagnóstico

```python
import requests
import json

def diagnose(base_url, token, issue_key):
    """Diagnóstico completo"""
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("=" * 50)
    print("JIRA Diagnóstico")
    print("=" * 50)
    
    # 1. Teste conexão
    print("\n1️⃣ Testando conexão...")
    try:
        r = requests.get(f"{base_url}/issue/search?jql=project=DEVOPS", 
                        headers=headers, timeout=5)
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            print("   ✅ Conexão OK")
        elif r.status_code == 401:
            print("   ❌ Token inválido")
        else:
            print(f"   ⚠️ Status inesperado")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 2. Teste issue específica
    print(f"\n2️⃣ Testando issue {issue_key}...")
    try:
        r = requests.get(f"{base_url}/issue/{issue_key}", headers=headers)
        if r.status_code == 200:
            print("   ✅ Issue encontrada")
        elif r.status_code == 404:
            print("   ❌ Issue não encontrada")
        else:
            print(f"   ⚠️ Status: {r.status_code}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # 3. Teste PATCH
    print(f"\n3️⃣ Testando PATCH...")
    try:
        payload = {"fields": {"labels": ["test"]}}
        r = requests.patch(f"{base_url}/issue/{issue_key}", 
                          json=payload, headers=headers)
        if r.status_code in [200, 204]:
            print("   ✅ PATCH OK")
        elif r.status_code == 403:
            print("   ❌ Sem permissão para PATCH")
        else:
            print(f"   ⚠️ Status: {r.status_code}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")

# Uso
# diagnose("https://seu-jira.totvs.com/api", token, "DEVOPS-123")
```

---

## 📞 Quando Pedir Ajuda

Se os erros continuarem:
1. Salve o response completo: `print(response.text)`
2. Verifique o tipo de erro
3. Consulte a [API_REFERENCE.md](API_REFERENCE.md)
4. Contate o admin JIRA

---

## 🔗 Referência

- [AUTH_GUIDE.md](AUTH_GUIDE.md) — Problemas de autenticação
- [API_REFERENCE.md](API_REFERENCE.md) — Endpoints
