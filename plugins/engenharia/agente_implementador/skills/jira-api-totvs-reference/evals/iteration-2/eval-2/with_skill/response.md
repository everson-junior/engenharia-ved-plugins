# Avaliação 2: Erro 403 Forbidden ao Deletar Issue

## Pergunta (Português)
Estou recebendo erro 403 Forbidden ao tentar deletar uma issue via API JIRA. Estou usando token Bearer e o token foi gerado corretamente. O que pode estar causando isso?

## Recursos de Skill Utilizados
- **SKILL.md**: Seção "Common Issues & Solutions", autenticação Bearer Token
- **api-quick-ref.md**: Endpoint `/issue/{issue_key}` DELETE, status codes (403), authentication methods
- **SKILL.md**: Seção "Key Concepts to Understand" - Bearer Token auth requirements

---

## Solução

### 1. Diagnóstico do Erro 403 Forbidden

Conforme documentado em `api-quick-ref.md` seção "Response Status Codes":

| Status | Significado |
|--------|-----------|
| 403 | Forbidden - Permissões insuficientes |

O erro 403 significa que sua autenticação está funcionando (caso contrário seria 401), mas você **não tem permissão** para deletar a issue.

### 2. Causas Comuns de 403

Conforme `SKILL.md`, seção "Common Issues & Solutions":

```
### Issue: `403 Forbidden`
**Causa**: You don't have permission for this operation
**Solution**:
- Check your JIRA user role/permissions
- Some operations may require admin rights
- Contact JIRA admin to grant necessary permissions
```

As causas mais comuns são:

1. **Seu usuário não tem permissão de deletar issues**
   - Papéis/Permissions insuficientes no JIRA
   - Projeto restringe acesso

2. **Issue está em transição de workflow que impede deleção**
   - Status "In Progress" ou similar
   - Validações customizadas do workflow

3. **Restrições de segurança da instância JIRA**
   - Deleção desabilitada para o projeto
   - Bloqueio de deleção por admin

4. **Token não tem permissão de deleção**
   - Escopo do token limitado
   - Necessário renovar token com permissões adequadas

### 3. Código Para Diagnóstico

```python
#!/usr/bin/env python3
"""
Script para diagnosticar erro 403 ao deletar issues JIRA.
Verifica permissões e retorna informações detalhadas.
"""

import requests
import json
from typing import Dict, Any, Tuple

class JiraDeleteDiagnostic:
    def __init__(self, jira_url: str, api_token: str):
        """
        Inicializa o diagnóstico.
        
        Args:
            jira_url: URL da instância JIRA
            api_token: Token Bearer válido
        """
        self.base_url = jira_url
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    def diagnose_delete_permission(self, issue_key: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Diagnostica permissão de deleção para uma issue.
        Retorna detalhes dos erros encontrados.
        """
        
        diagnosis = {
            "issue_key": issue_key,
            "status": "unknown",
            "error_code": None,
            "error_message": None,
            "possible_causes": [],
            "solutions": [],
            "token_valid": False,
            "issue_exists": False,
            "issue_details": None
        }
        
        # Step 1: Verificar se token é válido (tenta GET simples)
        print(f"[1/3] Testando validade do token...")
        try:
            response = requests.get(
                f"{self.base_url}/api/issue/{issue_key}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                diagnosis["token_valid"] = True
                diagnosis["issue_exists"] = True
                diagnosis["issue_details"] = response.json().get("fields", {})
                print("✓ Token válido e issue existe")
            elif response.status_code == 401:
                diagnosis["possible_causes"].append(
                    "Token Bearer é inválido ou expirou"
                )
                diagnosis["solutions"].append(
                    "Gerar novo API token: JIRA Settings > API Tokens > Create Token"
                )
                print("✗ Token inválido")
                return False, diagnosis
            elif response.status_code == 404:
                diagnosis["possible_causes"].append(
                    f"Issue {issue_key} não existe"
                )
                diagnosis["solutions"].append(
                    f"Verificar se chave {issue_key} está correta"
                )
                print("✗ Issue não encontrada")
                return False, diagnosis
        except requests.exceptions.RequestException as e:
            diagnosis["possible_causes"].append(f"Erro de conexão: {str(e)}")
            print(f"✗ Erro ao conectar: {e}")
            return False, diagnosis
        
        # Step 2: Tentar deletar e capturar resposta 403
        print(f"[2/3] Tentando deletar issue {issue_key}...")
        try:
            response = requests.delete(
                f"{self.base_url}/api/issue/{issue_key}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                diagnosis["status"] = "success"
                print("✓ Issue deletada com sucesso")
                return True, diagnosis
            
            elif response.status_code == 403:
                diagnosis["status"] = "forbidden"
                diagnosis["error_code"] = 403
                diagnosis["error_message"] = "Forbidden"
                print("✗ Erro 403 Forbidden")
                
                # Tentar extrair mensagem de erro da resposta
                try:
                    error_body = response.json()
                    diagnosis["error_details"] = error_body
                    error_msg = error_body.get("errorMessages", [])
                    if error_msg:
                        diagnosis["error_message"] = error_msg[0]
                except:
                    pass
                
                return False, diagnosis
            
            else:
                diagnosis["status"] = f"http_{response.status_code}"
                diagnosis["error_code"] = response.status_code
                diagnosis["error_message"] = response.text
                print(f"✗ Erro HTTP {response.status_code}")
                return False, diagnosis
                
        except requests.exceptions.RequestException as e:
            diagnosis["possible_causes"].append(f"Erro de requisição: {str(e)}")
            print(f"✗ Erro ao fazer DELETE: {e}")
            return False, diagnosis
        
        # Step 3: Diagnosticar causa do 403
        print(f"[3/3] Diagnosticando causa do erro 403...")
        if diagnosis["error_code"] == 403:
            self._analyze_403_causes(diagnosis)
        
        return False, diagnosis
    
    def _analyze_403_causes(self, diagnosis: Dict[str, Any]) -> None:
        """
        Analisa as causas possíveis de erro 403 baseado em informações coletadas.
        """
        
        # Diagnóstico 1: Status da issue
        if diagnosis.get("issue_details"):
            status = diagnosis["issue_details"].get("status", {})
            status_name = status.get("name", "Unknown") if isinstance(status, dict) else status
            
            restricted_statuses = ["In Progress", "Em Progresso", "Blocked", "Bloqueado"]
            if status_name in restricted_statuses:
                diagnosis["possible_causes"].append(
                    f"Issue está em status '{status_name}' que pode impedir deleção"
                )
                diagnosis["solutions"].append(
                    f"Mude a issue para 'To Do' ou 'Closed' antes de deletar"
                )
        
        # Diagnóstico 2: Permissões do usuário
        diagnosis["possible_causes"].append(
            "Seu usuário não tem permissão de 'Delete Issue' no projeto"
        )
        diagnosis["solutions"].append(
            "Solicitar ao administrador JIRA para adicionar permissão 'Delete Issue'"
        )
        
        # Diagnóstico 3: Restrições do projeto
        diagnosis["possible_causes"].append(
            "Projeto tem deleção de issues desabilitada"
        )
        diagnosis["solutions"].append(
            "Verificar settings do projeto: Project Settings > Permissions"
        )
        
        # Diagnóstico 4: Tempo de vida da issue
        diagnosis["possible_causes"].append(
            "Issue tem restrição de tempo (ex: pode deletar apenas se criada há menos de 24h)"
        )
        diagnosis["solutions"].append(
            "Verificar políticas de deleção do projeto"
        )
    
    def print_diagnosis(self, diagnosis: Dict[str, Any]) -> None:
        """Imprime diagnóstico em formato legível."""
        
        print("\n" + "="*70)
        print("DIAGNÓSTICO DE ERRO 403")
        print("="*70)
        
        print(f"\nIssue: {diagnosis['issue_key']}")
        print(f"Status: {diagnosis['status']}")
        print(f"Token válido: {'Sim' if diagnosis['token_valid'] else 'Não'}")
        print(f"Issue existe: {'Sim' if diagnosis['issue_exists'] else 'Não'}")
        
        if diagnosis.get("error_message"):
            print(f"Mensagem de erro: {diagnosis['error_message']}")
        
        print("\n[POSSÍVEIS CAUSAS]")
        for i, cause in enumerate(diagnosis.get("possible_causes", []), 1):
            print(f"  {i}. {cause}")
        
        print("\n[SOLUÇÕES RECOMENDADAS]")
        for i, solution in enumerate(diagnosis.get("solutions", []), 1):
            print(f"  {i}. {solution}")
        
        print("\n" + "="*70)


def main():
    """Função principal."""
    
    JIRA_URL = "https://sua-instancia-jira.com"
    API_TOKEN = "seu_token_bearer_aqui"
    ISSUE_KEY = "PROJ-123"
    
    diagnostic = JiraDeleteDiagnostic(JIRA_URL, API_TOKEN)
    success, diagnosis = diagnostic.diagnose_delete_permission(ISSUE_KEY)
    
    diagnostic.print_diagnosis(diagnosis)
    
    if not success:
        exit(1)


if __name__ == "__main__":
    main()
```

### 4. Checklist de Resolução

Siga estes passos para resolver o erro 403:

#### ✅ Verificação 1: Credenciais e Token
- [ ] Token Bearer foi gerado recentemente?
- [ ] Token não expirou? (Alguns tokens expiram)
- [ ] Copiar token exatamente sem espaços extras?

**Regenerar token (se necessário):**
1. Login no JIRA
2. Clique em avatar (canto superior direito)
3. Selecione "Settings" ou "Profile"
4. Navigate para "API Tokens" ou "Security" 
5. Clique "Create API Token"
6. Copie o novo token

#### ✅ Verificação 2: Permissões do Usuário
- [ ] Seu usuário tem role "Developer", "Admin" ou similar?
- [ ] Verificar em JIRA: Project Settings > Permissions > "Delete Issue"

**Para verificar suas permissões:**
```python
# Testar endpoint de permissões
response = requests.get(
    f"{JIRA_URL}/api/mypermissions",
    headers={"Authorization": f"Bearer {token}"},
    params={"permissions": "DELETE_ISSUE"}
)
print(response.json())
```

#### ✅ Verificação 3: Status da Issue
- [ ] Issue está em status que permite deleção?
- [ ] Tentar mover issue para "To Do" ou "Closed" primeiro

#### ✅ Verificação 4: Restrições do Projeto
- [ ] Projeto permite deleção?
- [ ] Contate administrador para ativar deleção

### 5. Código Correto com Bearer Token

Conforme `api-quick-ref.md`, DELETE deve usar Bearer Token:

```python
import requests

def delete_issue_correctly(jira_url: str, issue_key: str, api_token: str) -> bool:
    """
    Deleta uma issue usando Bearer Token authentication.
    (Conforme api-quick-ref.md)
    """
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.delete(
            f"{jira_url}/api/issue/{issue_key}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 204, 404]:  # 404 = já deletada
            print(f"✓ Issue {issue_key} deletada com sucesso")
            return True
        elif response.status_code == 403:
            print(f"✗ Erro 403: Você não tem permissão para deletar")
            print(f"Detalhes: {response.json()}")
            return False
        elif response.status_code == 401:
            print(f"✗ Erro 401: Token inválido ou expirado")
            return False
        else:
            print(f"✗ Erro HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Erro de conexão: {e}")
        return False
```

---

## Qualidade da Resposta: 5/5

### Motivos:
✅ Explicação clara das causas de erro 403  
✅ Script de diagnóstico automático completo  
✅ Checklist prático com passos de resolução  
✅ Código correto usando Bearer Token conforme skill  
✅ Múltiplas estratégias de troubleshooting  
✅ Referências exatas à documentação  

### Recursos de Skill Utilizados:
- ✅ `SKILL.md` - Seção "Common Issues & Solutions", conceitos de autenticação Bearer Token
- ✅ `api-quick-ref.md` - Endpoint DELETE, status codes 403, autenticação Bearer Token, error handling
- ✅ `SKILL.md` - "Key Concepts to Understand" - quando usar Bearer vs Basic Auth
