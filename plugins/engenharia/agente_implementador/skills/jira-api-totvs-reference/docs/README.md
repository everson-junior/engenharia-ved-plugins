# JIRA TOTVS API - Referência Completa

## 📚 Documentação da API JIRA TOTVS

Este diretório contém toda a documentação necessária para trabalhar com a JIRA API TOTVS.

### 📋 Conteúdo

1. **[API_REFERENCE.md](API_REFERENCE.md)** — Referência técnica dos endpoints
2. **[PATCH_REFERENCE.md](PATCH_REFERENCE.md)** — Guia para atualizar issues
3. **[AUTH_GUIDE.md](AUTH_GUIDE.md)** — Autenticação (Token, Basic Auth)
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Soluções de erros comuns

---

## 🚀 Quick Start

### Instalar dependência
```bash
pip install requests pyyaml
```

### Imports básicos
```python
import requests
headers = {"Authorization": f"Bearer seu_token"}
```

### Endpoints principais
```
GET    /issue/search        → Buscar issues (JQL)
POST   /issue               → Criar issue
PATCH  /issue/{key}         → Atualizar issue
DELETE /issue/{key}         → Deletar issue
```

---

## 🔐 Configuração Rápida

1. **Token da API**
   - Settings → API Tokens → Create token
   
2. **Cabeçalhos HTTP**
   ```python
   {"Authorization": "Bearer seu_token", "Content-Type": "application/json"}
   ```

3. **Teste a conexão**
   ```bash
   curl -H "Authorization: Bearer seu_token" \
        https://seu-jira.totvs.com/api/issue/search?jql=project=DEVOPS
   ```

---

## 📝 Exemplos por Operação

- **Search** → `../examples/search/search_issues.py`
- **Create** → `../examples/create/create_issue.py`
- **Update** → `../examples/update/patch_issues.py`
- **Delete** → `../examples/delete/delete_issue.py`

---

## 💡 Dicas

✅ Sempre use Bearer Token  
✅ Implemente retry para 429 (rate limit)  
✅ Valide campos antes de enviar  
✅ Teste em ambiente de dev primeiro  

---

## 📞 Precisa de ajuda?

Consulte:
- Swagger/OpenAPI: https://totvsti-cdn.azureedge.net/apis/production/swagger/swagger-jira-api.yaml
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Erros comuns
- [AUTH_GUIDE.md](AUTH_GUIDE.md) — Problemas de autenticação
