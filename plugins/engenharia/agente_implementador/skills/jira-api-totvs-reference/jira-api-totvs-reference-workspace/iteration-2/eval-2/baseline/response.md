# Resposta - Eval 2: Erro 403 Forbidden ao Deletar Issue

## Pergunta
Estou recebendo erro 403 Forbidden ao tentar deletar uma issue via API JIRA. Estou usando token Bearer e o token foi gerado corretamente. O que pode estar causando isso?

## Resposta

### Possíveis Causas do Erro 403

O erro 403 Forbidden indica que a autenticação foi bem-sucedida, mas a autorização falhou. As causas mais comuns são:

### 1. **Permissões Insuficientes no JIRA**

A causa mais provável. O token Bearer gerado não tem permissão para deletar issues.

**Solução:**
- Verifique se o usuário/token tem a permission "Delete Issues"
- Em JIRA Cloud: vá a **Project Settings > Permissions** e verifique se o grupo/usuário tem permissão
- Em JIRA Server/Data Center: **Project Administration > Permissions > Delete Issues**

### 2. **Tipo de Token de Autenticação Incorreto**

Você mencionou usar "token Bearer", mas há confusão comum entre tipos de token.

**Tipos de autenticação no JIRA:**

```python
# ❌ INCORRETO - Bearer token (OAuth, menos comum)
headers = {
    "Authorization": "Bearer seu-oauth-token"
}

# ✅ CORRETO - API Token (Base64 encoded basic auth)
import base64
credentials = base64.b64encode(b'email@example.com:api_token'.encode()).decode()
headers = {
    "Authorization": f"Basic {credentials}",
    "Content-Type": "application/json"
}

# ✅ ALTERNATIVA - Basic Auth direto (requests faz encoding)
response = requests.delete(
    url,
    auth=('email@example.com', 'api_token'),
    headers={"Content-Type": "application/json"}
)
```

### 3. **Issue em Estado que Não Permite Deleção**

Algumas issues não podem ser deletadas se estão em certos status.

**Verificar:**
- A issue está em um status que permite deleção?
- A issue foi resolvida/fechada? Algumas configurações não permitem deletar issues finalizadas
- Existe workflow restritivo? Verifique no workflow do projeto

### 4. **Falta de Campos Obrigatórios (menos comum para DELETE)**

Embora raro para DELETE, algumas versões do JIRA podem exigir headers adicionais.

### Script de Troubleshooting Completo

```python
import requests
import base64
import json

JIRA_URL = "https://seu-jira.atlassian.net"
ISSUE_KEY = "PROJ-123"
EMAIL = "seu-email@example.com"
API_TOKEN = "seu-api-token"

# Passo 1: Testar autenticação
print("=== TESTE 1: Verificando autenticação ===")
response = requests.get(
    f"{JIRA_URL}/rest/api/3/myself",
    auth=(EMAIL, API_TOKEN)
)
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    user_data = response.json()
    print(f"✓ Autenticado como: {user_data.get('displayName')}")
    print(f"✓ Email: {user_data.get('emailAddress')}")
else:
    print(f"✗ Erro na autenticação: {response.text}")
    exit(1)

# Passo 2: Verificar issue e permissões
print("\n=== TESTE 2: Verificando issue ===")
response = requests.get(
    f"{JIRA_URL}/rest/api/3/issue/{ISSUE_KEY}",
    auth=(EMAIL, API_TOKEN)
)
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    issue_data = response.json()
    print(f"✓ Issue encontrada: {issue_data['key']}")
    print(f"  Status: {issue_data['fields']['status']['name']}")
    print(f"  Tipo: {issue_data['fields']['issuetype']['name']}")
else:
    print(f"✗ Issue não encontrada: {response.text}")
    exit(1)

# Passo 3: Verificar permissões específicas
print("\n=== TESTE 3: Verificando permissões ===")
response = requests.get(
    f"{JIRA_URL}/rest/api/3/issue/{ISSUE_KEY}?expand=changelog",
    auth=(EMAIL, API_TOKEN),
    headers={"Accept": "application/json"}
)

# Passo 4: Tentar deletar a issue
print("\n=== TESTE 4: Tentando deletar issue ===")
response = requests.delete(
    f"{JIRA_URL}/rest/api/3/issues/{ISSUE_KEY}",
    auth=(EMAIL, API_TOKEN),
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 204:
    print("✓ Issue deletada com sucesso!")
elif response.status_code == 403:
    print("✗ Erro 403 Forbidden")
    print("  Possíveis causas:")
    print("  1. Usuário não tem permissão 'Delete Issues'")
    print("  2. Issue está em um status que não permite deleção")
    print("  3. Existe uma restrição de segurança/política")
    print(f"  Detalhes: {response.json()}")
elif response.status_code == 401:
    print("✗ Erro 401 Unauthorized - Credenciais inválidas")
else:
    print(f"✗ Erro inesperado: {response.status_code}")
    print(response.json())
```

### Checklist de Resolução

- [ ] Verifique permissão "Delete Issues" no projeto
- [ ] Confirme que está usando Basic Auth com email:token (não Bearer)
- [ ] Teste com `requests.get(..., auth=(EMAIL, TOKEN))` primeiro
- [ ] Verifique se a issue não está em um status bloqueado
- [ ] Teste deletar uma issue diferente para confirmar que não é específica da issue
- [ ] Verifique logs do JIRA para mais detalhes
- [ ] Se usar tokens compartilhados, regenere o token pessoal
- [ ] Confirme que o endpoint é `/rest/api/3/issues/{issueKey}` (não `/issue/`)

### Solução Típica

```python
# ✅ Forma correta
response = requests.delete(
    "https://seu-jira.atlassian.net/rest/api/3/issues/PROJ-123",
    auth=("seu-email@example.com", "seu-api-token"),  # Basic Auth
    headers={"Content-Type": "application/json"}
)

if response.status_code == 204:
    print("Deletado com sucesso")
else:
    print(f"Erro: {response.status_code} - {response.text}")
```

### Recursos Adicionais

- Verifique se a conta tem permissão no projeto (não é admin global)
- Alguns projetos têm políticas que proíbem deleção
- Pode ser necessário deletar links da issue antes de deletá-la
