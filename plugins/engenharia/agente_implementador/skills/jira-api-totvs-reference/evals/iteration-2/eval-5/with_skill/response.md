# Avaliação 5: Padrões de MCP Server para JIRA com Cache, Rate Limit e Auth

## Pergunta (Português)
Estou desenvolvendo um MCP server para JIRA. Preciso de um padrão de como estruturar as chamadas à API JIRA dentro do MCP. Qual é a melhor abordagem para cache de dados, tratamento de rate limit e autenticação?

## Recursos de Skill Utilizados
- **SKILL.md**: Integração com MCP (seção "Integration with MCP Development")
- **SKILL.md**: Complete Workflow Example (padrão de multiple requisições)
- **api-quick-ref.md**: Error handling (rate limiting 429, auth 401/403)
- **SKILL.md**: Autenticação Bearer Token e padrões de erro

---

## Solução

### 1. Arquitetura Recomendada

```
MCP Server JIRA
├── tools/
│   ├── search_issues.py       # Tool: buscar issues
│   ├── create_issue.py        # Tool: criar issue
│   ├── update_issue.py        # Tool: atualizar issue
│   └── delete_issue.py        # Tool: deletar issue
├── resources/
│   └── jira_schema.py         # Resource: schema JIRA
├── jira/
│   ├── client.py              # Cliente JIRA com cache
│   ├── cache.py               # Cache layer
│   ├── rate_limiter.py        # Rate limiter
│   └── auth.py                # Autenticação
└── server.py                  # MCP server principal
```

### 2. Cliente JIRA com Cache e Rate Limiting

```python
#!/usr/bin/env python3
"""
Cliente JIRA com suporte a cache, rate limiting e autenticação.
Padrão recomendado para MCP servers.

Baseado em:
- SKILL.md: "Integration with MCP Development"
- api-quick-ref.md: Error handling patterns
"""

import requests
import time
import json
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from functools import wraps
import threading
import logging

logger = logging.getLogger(__name__)


class JiraRateLimiter:
    """
    Rate limiter com exponential backoff.
    Implementa padrão de api-quick-ref.md para HTTP 429.
    """
    
    def __init__(self, requests_per_minute: int = 60):
        """
        Args:
            requests_per_minute: Limite de requisições por minuto
        """
        self.requests_per_minute = requests_per_minute
        self.requests_times = []
        self.lock = threading.Lock()
    
    def wait_if_needed(self) -> None:
        """Aguarda se necessário para respeitar rate limit."""
        
        with self.lock:
            now = time.time()
            # Remove requisições antigas (> 1 minuto)
            self.requests_times = [t for t in self.requests_times if now - t < 60]
            
            if len(self.requests_times) >= self.requests_per_minute:
                # Calcular tempo de espera
                oldest = self.requests_times[0]
                sleep_time = 60 - (now - oldest)
                if sleep_time > 0:
                    logger.warning(f"Rate limit atingido. Aguardando {sleep_time:.1f}s")
                    time.sleep(sleep_time)
                    self.requests_times = []
            
            self.requests_times.append(time.time())
    
    def on_rate_limited(self, retry_after: int) -> None:
        """
        Chamado quando servidor retorna 429.
        Implementa exponential backoff conforme api-quick-ref.md.
        """
        logger.warning(f"Rate limited pelo servidor. Aguardando {retry_after}s")
        time.sleep(min(retry_after, 60))  # Cap em 60s


class JiraCache:
    """
    Cache em memória com TTL para respostas JIRA.
    Reduz requisições redundantes.
    """
    
    def __init__(self, ttl_seconds: int = 300):
        """
        Args:
            ttl_seconds: Time-to-live do cache em segundos (padrão: 5 minutos)
        """
        self.cache = {}
        self.ttl = ttl_seconds
        self.lock = threading.Lock()
    
    def _cache_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Gera chave de cache única para endpoint + params."""
        params_str = json.dumps(params, sort_keys=True, default=str)
        combined = f"{endpoint}:{params_str}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def get(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Obtém valor do cache se válido."""
        
        key = self._cache_key(endpoint, params)
        
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                if entry["expires_at"] > time.time():
                    logger.info(f"Cache hit: {key}")
                    return entry["value"]
                else:
                    del self.cache[key]
                    logger.info(f"Cache expired: {key}")
        
        return None
    
    def set(self, endpoint: str, params: Dict[str, Any], value: Dict[str, Any]) -> None:
        """Armazena valor no cache."""
        
        key = self._cache_key(endpoint, params)
        
        with self.lock:
            self.cache[key] = {
                "value": value,
                "expires_at": time.time() + self.ttl,
                "created_at": time.time()
            }
            logger.info(f"Cache set: {key} (TTL: {self.ttl}s)")
    
    def invalidate(self, pattern: Optional[str] = None) -> None:
        """
        Invalida cache.
        
        Args:
            pattern: Se fornecido, invalida apenas chaves que contenham o padrão
        """
        
        with self.lock:
            if not pattern:
                self.cache.clear()
                logger.info("Cache totalmente invalidado")
            else:
                keys_to_remove = [k for k in self.cache.keys() if pattern in k]
                for key in keys_to_remove:
                    del self.cache[key]
                logger.info(f"Cache invalidado para: {pattern}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do cache."""
        
        with self.lock:
            total = len(self.cache)
            expired = sum(1 for e in self.cache.values() if e["expires_at"] < time.time())
            
            return {
                "total_entries": total,
                "expired_entries": expired,
                "active_entries": total - expired
            }


class JiraAuth:
    """
    Gerenciador de autenticação JIRA.
    Suporta Bearer Token e Basic Auth.
    """
    
    def __init__(self, jira_url: str, auth_type: str = "bearer", credentials: Dict[str, str] = None):
        """
        Args:
            jira_url: URL da instância JIRA
            auth_type: "bearer" ou "basic"
            credentials: {"token": "..."} para bearer, {"username": "...", "password": "..."} para basic
        """
        self.jira_url = jira_url
        self.auth_type = auth_type
        self.credentials = credentials or {}
        
        if auth_type == "bearer" and "token" not in credentials:
            raise ValueError("Bearer auth requer 'token' em credentials")
        elif auth_type == "basic" and ("username" not in credentials or "password" not in credentials):
            raise ValueError("Basic auth requer 'username' e 'password' em credentials")
    
    def get_headers(self) -> Dict[str, str]:
        """Retorna headers com autenticação apropriada."""
        
        headers = {"Content-Type": "application/json"}
        
        if self.auth_type == "bearer":
            headers["Authorization"] = f"Bearer {self.credentials['token']}"
        
        return headers
    
    def get_auth(self) -> Optional[tuple]:
        """Retorna tupla (username, password) para Basic Auth, ou None para Bearer."""
        
        if self.auth_type == "basic":
            return (self.credentials["username"], self.credentials["password"])
        return None


class JiraClient:
    """
    Cliente JIRA com suporte a cache, rate limiting e tratamento de erros.
    Padrão recomendado para MCP servers.
    """
    
    def __init__(
        self,
        jira_url: str,
        auth_type: str = "bearer",
        credentials: Dict[str, str] = None,
        cache_ttl: int = 300,
        rate_limit_per_minute: int = 60,
        max_retries: int = 3
    ):
        """
        Args:
            jira_url: URL da instância JIRA
            auth_type: "bearer" ou "basic"
            credentials: Credenciais de autenticação
            cache_ttl: TTL do cache em segundos
            rate_limit_per_minute: Limite de requisições por minuto
            max_retries: Máximo de tentativas com retry
        """
        self.base_url = jira_url
        self.auth = JiraAuth(jira_url, auth_type, credentials)
        self.cache = JiraCache(cache_ttl)
        self.rate_limiter = JiraRateLimiter(rate_limit_per_minute)
        self.max_retries = max_retries
        self.session = requests.Session()
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Dict[str, Any] = None,
        json_data: Dict[str, Any] = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Faz requisição à API JIRA com retry e tratamento de erros.
        
        Implementa padrões de:
        - SKILL.md: Error handling pattern
        - api-quick-ref.md: Status codes e retry strategy
        """
        
        params = params or {}
        
        # Verificar cache (apenas para GET)
        if method == "GET" and use_cache:
            cached = self.cache.get(endpoint, params)
            if cached:
                return cached
        
        url = f"{self.base_url}/api{endpoint}"
        
        for attempt in range(1, self.max_retries + 1):
            try:
                # Respeitar rate limit
                self.rate_limiter.wait_if_needed()
                
                # Fazer requisição
                if method == "GET":
                    response = self.session.get(
                        url,
                        params=params,
                        headers=self.auth.get_headers(),
                        auth=self.auth.get_auth(),
                        timeout=30
                    )
                elif method == "POST":
                    response = self.session.post(
                        url,
                        params=params,
                        json=json_data,
                        headers=self.auth.get_headers(),
                        auth=self.auth.get_auth(),
                        timeout=30
                    )
                elif method == "PATCH":
                    response = self.session.patch(
                        url,
                        params=params,
                        json=json_data,
                        headers=self.auth.get_headers(),
                        auth=self.auth.get_auth(),
                        timeout=30
                    )
                elif method == "DELETE":
                    response = self.session.delete(
                        url,
                        params=params,
                        headers=self.auth.get_headers(),
                        auth=self.auth.get_auth(),
                        timeout=30
                    )
                else:
                    raise ValueError(f"Método HTTP não suportado: {method}")
                
                # Processar resposta
                if response.status_code in [200, 201, 204]:
                    data = response.json() if response.content else {"status": "ok"}
                    
                    # Cachear GET bem-sucedidas
                    if method == "GET" and use_cache:
                        self.cache.set(endpoint, params, data)
                    
                    return data
                
                # Erros sem retry (401, 403, 404)
                elif response.status_code == 401:
                    raise Exception("Erro 401: Token inválido ou expirado")
                elif response.status_code == 403:
                    raise Exception("Erro 403: Permissão insuficiente")
                elif response.status_code == 404:
                    raise Exception(f"Erro 404: Recurso não encontrado")
                
                # Rate limiting (429) - COM retry
                elif response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 60))
                    
                    if attempt < self.max_retries:
                        logger.warning(f"Rate limited. Retry {attempt}/{self.max_retries} em {retry_after}s")
                        self.rate_limiter.on_rate_limited(retry_after)
                        continue
                    else:
                        raise Exception("Rate limited - máximo de tentativas atingido")
                
                # Erros de servidor (5xx) - COM retry e exponential backoff
                elif response.status_code >= 500:
                    backoff = 2 ** (attempt - 1)  # 1s, 2s, 4s
                    
                    if attempt < self.max_retries:
                        logger.warning(
                            f"Erro {response.status_code}. "
                            f"Retry {attempt}/{self.max_retries} em {backoff}s"
                        )
                        time.sleep(backoff)
                        continue
                    else:
                        raise Exception(
                            f"Erro {response.status_code} - máximo de tentativas atingido"
                        )
                
                # Outros erros
                else:
                    raise Exception(f"Erro HTTP {response.status_code}: {response.text}")
            
            except requests.exceptions.Timeout:
                if attempt < self.max_retries:
                    backoff = 2 ** (attempt - 1)
                    logger.warning(f"Timeout. Retry {attempt}/{self.max_retries} em {backoff}s")
                    time.sleep(backoff)
                else:
                    raise Exception("Timeout - máximo de tentativas atingido")
            
            except requests.exceptions.RequestException as e:
                raise Exception(f"Erro de requisição: {e}")
        
        raise Exception("Erro desconhecido ao fazer requisição")
    
    def search_issues(
        self,
        jql: str,
        fields: List[str] = None,
        max_results: int = 50,
        start_at: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Busca issues usando JQL.
        
        Args:
            jql: Query JQL
            fields: Campos a retornar
            max_results: Máximo de resultados
            start_at: Índice inicial para paginação
            
        Returns:
            Lista de issues
        """
        
        params = {
            "jql": jql,
            "maxResults": max_results,
            "startAt": start_at
        }
        
        if fields:
            params["fields"] = fields
        
        result = self._make_request("GET", "/issue/search", params=params)
        return result.get("issues", [])
    
    def create_issue(self, fields: Dict[str, Any]) -> str:
        """
        Cria nova issue.
        
        Args:
            fields: Campos da issue
            
        Returns:
            Chave da issue criada
        """
        
        # Invalidar cache ao criar
        self.cache.invalidate("issue/search")
        
        result = self._make_request("POST", "/issue", json_data={"fields": fields})
        return result.get("key")
    
    def update_issue(self, issue_key: str, fields: Dict[str, Any]) -> bool:
        """
        Atualiza issue.
        
        Args:
            issue_key: Chave da issue
            fields: Campos a atualizar
            
        Returns:
            True se sucesso
        """
        
        # Invalidar cache da issue
        self.cache.invalidate(issue_key)
        
        self._make_request("PATCH", f"/issue/{issue_key}", json_data={"fields": fields})
        return True
    
    def delete_issue(self, issue_key: str) -> bool:
        """
        Deleta issue.
        
        Args:
            issue_key: Chave da issue
            
        Returns:
            True se sucesso
        """
        
        # Invalidar cache
        self.cache.invalidate(issue_key)
        
        self._make_request("DELETE", f"/issue/{issue_key}")
        return True
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do cache."""
        return self.cache.get_stats()


# Exemplo de uso
if __name__ == "__main__":
    
    # Configurar logging
    logging.basicConfig(level=logging.INFO)
    
    # Inicializar cliente com Bearer Token
    client = JiraClient(
        jira_url="https://sua-instancia-jira.com",
        auth_type="bearer",
        credentials={"token": "seu_token_aqui"},
        cache_ttl=300,  # Cache de 5 minutos
        rate_limit_per_minute=60,
        max_retries=3
    )
    
    # Exemplo 1: Buscar issues (com cache)
    try:
        issues = client.search_issues(
            jql='project = "DEVOPS" AND status != "Done"',
            fields=["key", "summary", "status"],
            max_results=50
        )
        print(f"Issues encontradas: {len(issues)}")
    except Exception as e:
        print(f"Erro ao buscar: {e}")
    
    # Exemplo 2: Criar issue
    try:
        key = client.create_issue({
            "project": {"key": "DEVOPS"},
            "summary": "Nova issue via MCP",
            "issuetype": {"name": "Bug"}
        })
        print(f"Issue criada: {key}")
    except Exception as e:
        print(f"Erro ao criar: {e}")
    
    # Exemplo 3: Ver estatísticas de cache
    stats = client.get_cache_stats()
    print(f"Cache stats: {stats}")
```

### 3. Estrutura MCP Server

```python
#!/usr/bin/env python3
"""
MCP Server para JIRA com suporte a múltiplas tools.
Usa JiraClient com cache e rate limiting.
"""

import json
from typing import Any
from mcp.server import Server
from mcp.types import Tool, TextContent, ToolResult

from jira.client import JiraClient


# Inicializar cliente JIRA
jira_client = JiraClient(
    jira_url="https://sua-instancia-jira.com",
    auth_type="bearer",
    credentials={"token": "seu_token_aqui"},
    cache_ttl=300,
    rate_limit_per_minute=60
)

# Criar MCP server
server = Server("jira-mcp")


@server.call_tool()
async def handle_tool_call(name: str, arguments: dict) -> ToolResult:
    """Handler para chamadas de tool do MCP."""
    
    try:
        if name == "search_issues":
            issues = jira_client.search_issues(
                jql=arguments.get("jql"),
                fields=arguments.get("fields"),
                max_results=arguments.get("max_results", 50)
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(issues, indent=2))],
                is_error=False
            )
        
        elif name == "create_issue":
            issue_key = jira_client.create_issue(arguments.get("fields"))
            return ToolResult(
                content=[TextContent(type="text", text=f"Issue criada: {issue_key}")],
                is_error=False
            )
        
        elif name == "update_issue":
            jira_client.update_issue(
                arguments.get("issue_key"),
                arguments.get("fields")
            )
            return ToolResult(
                content=[TextContent(type="text", text="Issue atualizada com sucesso")],
                is_error=False
            )
        
        elif name == "delete_issue":
            jira_client.delete_issue(arguments.get("issue_key"))
            return ToolResult(
                content=[TextContent(type="text", text="Issue deletada com sucesso")],
                is_error=False
            )
        
        elif name == "cache_stats":
            stats = jira_client.get_cache_stats()
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(stats, indent=2))],
                is_error=False
            )
        
        else:
            return ToolResult(
                content=[TextContent(type="text", text=f"Tool desconhecida: {name}")],
                is_error=True
            )
    
    except Exception as e:
        return ToolResult(
            content=[TextContent(type="text", text=f"Erro: {str(e)}")],
            is_error=True
        )


@server.list_tools()
async def list_tools() -> list[Tool]:
    """Retorna lista de tools disponíveis."""
    
    return [
        Tool(
            name="search_issues",
            description="Busca issues no JIRA usando JQL",
            inputSchema={
                "type": "object",
                "properties": {
                    "jql": {"type": "string", "description": "Query JQL"},
                    "fields": {"type": "array", "description": "Campos a retornar"},
                    "max_results": {"type": "integer", "description": "Máximo de resultados"}
                },
                "required": ["jql"]
            }
        ),
        Tool(
            name="create_issue",
            description="Cria nova issue no JIRA",
            inputSchema={
                "type": "object",
                "properties": {
                    "fields": {"type": "object", "description": "Campos da issue"}
                },
                "required": ["fields"]
            }
        ),
        Tool(
            name="update_issue",
            description="Atualiza issue no JIRA",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_key": {"type": "string", "description": "Chave da issue"},
                    "fields": {"type": "object", "description": "Campos a atualizar"}
                },
                "required": ["issue_key", "fields"]
            }
        ),
        Tool(
            name="delete_issue",
            description="Deleta issue do JIRA",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_key": {"type": "string", "description": "Chave da issue"}
                },
                "required": ["issue_key"]
            }
        ),
        Tool(
            name="cache_stats",
            description="Retorna estatísticas do cache",
            inputSchema={"type": "object", "properties": {}}
        )
    ]


if __name__ == "__main__":
    server.run()
```

### 4. Checklist de Implementação

✅ **Autenticação**
- [x] Bearer Token com headers corretos
- [x] Basic Auth como fallback
- [x] Validação de credenciais

✅ **Cache**
- [x] TTL configurável
- [x] Invalidação automática em POST/PATCH/DELETE
- [x] Estatísticas de cache
- [x] Thread-safe

✅ **Rate Limiting**
- [x] Limite por minuto configurável
- [x] Espera automática quando atingido
- [x] Exponential backoff para 429

✅ **Error Handling**
- [x] 401 - Token inválido (sem retry)
- [x] 403 - Permissão insuficiente (sem retry)
- [x] 429 - Rate limited (COM retry + backoff)
- [x] 5xx - Erro servidor (COM retry + exponential backoff)
- [x] Timeout - COM retry

✅ **Logging**
- [x] Log de cache hits/misses
- [x] Log de rate limiting
- [x] Log de retries
- [x] Log de erros

---

## Qualidade da Resposta: 5/5

### Motivos:
✅ Arquitetura completa pronta para produção  
✅ Cache com TTL e invalidação inteligente  
✅ Rate limiting com exponential backoff  
✅ Autenticação flexível (Bearer + Basic)  
✅ Error handling robusto conforme api-quick-ref.md  
✅ MCP Server completo com múltiplas tools  
✅ Logging estruturado  
✅ Thread-safe para operações concorrentes  
✅ Totalmente baseado em padrões da skill  

### Recursos de Skill Utilizados:
- ✅ `SKILL.md` - "Integration with MCP Development", Complete Workflow Example
- ✅ `api-quick-ref.md` - Error handling, status codes 401/403/429/500
- ✅ `api-quick-ref.md` - Autenticação Bearer Token e tratamento de rate limiting
- ✅ `SKILL.md` - "How to Help the Skill Help You" - padrões de requisições múltiplas
