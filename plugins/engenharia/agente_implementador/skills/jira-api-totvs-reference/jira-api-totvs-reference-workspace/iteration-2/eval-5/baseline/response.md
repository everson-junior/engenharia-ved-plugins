# Resposta - Eval 5: MCP Server para JIRA - Padrão de Arquitetura

## Pergunta
Estou desenvolvendo um MCP server para JIRA. Preciso de um padrão de como estruturar as chamadas à API JIRA dentro do MCP. Qual é a melhor abordagem para cache de dados, tratamento de rate limit e autenticação?

## Resposta

### Arquitetura MCP Server para JIRA

Um MCP (Model Context Protocol) server é um servidor que expõe recursos através de um protocolo padronizado. Para JIRA, precisamos gerenciar autenticação, cache e rate limit de forma robusta.

---

## 1. Estrutura de Diretórios Recomendada

```
mcp-jira-server/
├── src/
│   ├── __init__.py
│   ├── main.py                    # Entry point
│   ├── config.py                  # Configurações
│   ├── jira_client.py             # Client JIRA com retry
│   ├── cache_manager.py           # Cache em-memória/Redis
│   ├── rate_limiter.py            # Rate limiter
│   ├── mcp_handlers.py            # Handlers MCP
│   └── utils.py                   # Utilitários
├── tests/
│   ├── test_jira_client.py
│   ├── test_cache.py
│   └── test_mcp_handlers.py
├── requirements.txt
├── pyproject.toml
├── README.md
└── docker-compose.yml
```

---

## 2. Configuração Base (config.py)

```python
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class JIRAConfig:
    """Configuração do JIRA"""
    url: str
    email: str
    api_token: str
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0
    
    @classmethod
    def from_env(cls) -> "JIRAConfig":
        """Carregar config de variáveis de ambiente"""
        return cls(
            url=os.getenv("JIRA_URL", ""),
            email=os.getenv("JIRA_EMAIL", ""),
            api_token=os.getenv("JIRA_API_TOKEN", ""),
            timeout=int(os.getenv("JIRA_TIMEOUT", "30")),
            max_retries=int(os.getenv("JIRA_MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("JIRA_RETRY_DELAY", "1.0"))
        )

@dataclass
class CacheConfig:
    """Configuração de Cache"""
    enabled: bool = True
    backend: str = "memory"  # "memory" ou "redis"
    ttl_seconds: int = 3600  # 1 hora
    redis_url: Optional[str] = None
    max_size: int = 1000  # Para cache em-memória

@dataclass
class RateLimitConfig:
    """Configuração de Rate Limit"""
    enabled: bool = True
    requests_per_minute: int = 60
    burst_size: int = 10
    strategy: str = "token_bucket"  # "token_bucket" ou "sliding_window"
```

---

## 3. Cliente JIRA Robusto (jira_client.py)

```python
import requests
import time
import logging
from typing import Any, Dict, Optional, List
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

class JIRAClient:
    """Client JIRA com retry automático e tratamento de erros"""
    
    def __init__(self, config):
        self.config = config
        self.session = self._create_session()
        self.last_request_time = 0
    
    def _create_session(self) -> requests.Session:
        """Cria session com retry strategy"""
        session = requests.Session()
        
        # Configurar retry
        retry_strategy = Retry(
            total=self.config.max_retries,
            backoff_factor=self.config.retry_delay,
            status_forcelist=[429, 500, 502, 503, 504],  # Retry nesses status
            allowed_methods=["GET", "PUT", "POST", "DELETE"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Autenticação
        session.auth = (self.config.email, self.config.api_token)
        session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
        
        return session
    
    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Processa resposta com tratamento de erro"""
        try:
            if response.status_code == 204:  # No content
                return {"status": "success", "data": None}
            
            data = response.json()
            
            if 200 <= response.status_code < 300:
                return {"status": "success", "data": data}
            
            elif response.status_code == 400:
                logger.warning(f"Bad Request: {data}")
                return {"status": "error", "code": 400, "message": str(data)}
            
            elif response.status_code == 401:
                logger.error("Unauthorized - credenciais inválidas")
                return {"status": "error", "code": 401, "message": "Credenciais inválidas"}
            
            elif response.status_code == 403:
                logger.warning("Forbidden - permissão insuficiente")
                return {"status": "error", "code": 403, "message": "Permissão insuficiente"}
            
            elif response.status_code == 404:
                logger.info("Not Found")
                return {"status": "error", "code": 404, "message": "Não encontrado"}
            
            elif response.status_code == 429:
                logger.warning("Rate limited")
                return {"status": "error", "code": 429, "message": "Rate limit excedido"}
            
            else:
                return {"status": "error", "code": response.status_code, 
                        "message": f"Erro: {response.text}"}
        
        except Exception as e:
            logger.error(f"Erro ao processar resposta: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def get_issue(self, issue_key: str, fields: Optional[List[str]] = None) -> Dict[str, Any]:
        """Obter issue específica"""
        url = f"{self.config.url}/rest/api/3/issues/{issue_key}"
        
        params = {}
        if fields:
            params["fields"] = ",".join(fields)
        
        try:
            response = self.session.get(url, params=params, timeout=self.config.timeout)
            return self._handle_response(response)
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao obter issue {issue_key}: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def search_issues(self, jql: str, max_results: int = 50, start_at: int = 0) -> Dict[str, Any]:
        """Buscar issues com JQL"""
        url = f"{self.config.url}/rest/api/3/search"
        
        params = {
            "jql": jql,
            "maxResults": max_results,
            "startAt": start_at,
            "fields": "key,summary,status,priority,assignee,created"
        }
        
        try:
            response = self.session.get(url, params=params, timeout=self.config.timeout)
            return self._handle_response(response)
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao buscar issues: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def update_issue(self, issue_key: str, fields: Dict[str, Any]) -> Dict[str, Any]:
        """Atualizar issue"""
        url = f"{self.config.url}/rest/api/3/issues/{issue_key}"
        
        try:
            response = self.session.put(url, json={"fields": fields}, 
                                       timeout=self.config.timeout)
            return self._handle_response(response)
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao atualizar issue {issue_key}: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def create_issue(self, project_key: str, issue_type: str, 
                    summary: str, **extra_fields) -> Dict[str, Any]:
        """Criar issue"""
        url = f"{self.config.url}/rest/api/3/issues"
        
        fields = {
            "project": {"key": project_key},
            "issuetype": {"name": issue_type},
            "summary": summary,
            **extra_fields
        }
        
        try:
            response = self.session.post(url, json={"fields": fields}, 
                                        timeout=self.config.timeout)
            return self._handle_response(response)
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao criar issue: {str(e)}")
            return {"status": "error", "message": str(e)}
```

---

## 4. Gerenciador de Cache (cache_manager.py)

```python
import json
import time
import hashlib
from typing import Any, Optional
from abc import ABC, abstractmethod

class CacheBackend(ABC):
    """Interface abstrata para cache"""
    
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    def set(self, key: str, value: Any, ttl: int) -> None:
        pass
    
    @abstractmethod
    def delete(self, key: str) -> None:
        pass
    
    @abstractmethod
    def clear(self) -> None:
        pass

class MemoryCache(CacheBackend):
    """Cache em-memória com TTL"""
    
    def __init__(self, max_size: int = 1000):
        self.cache = {}
        self.max_size = max_size
    
    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        if time.time() > entry["expires_at"]:
            del self.cache[key]
            return None
        
        entry["accessed_at"] = time.time()
        return entry["value"]
    
    def set(self, key: str, value: Any, ttl: int) -> None:
        # Se atingiu limite, remover entrada mais antiga
        if len(self.cache) >= self.max_size:
            oldest_key = min(self.cache.keys(), 
                           key=lambda k: self.cache[k]["accessed_at"])
            del self.cache[oldest_key]
        
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl,
            "accessed_at": time.time()
        }
    
    def delete(self, key: str) -> None:
        self.cache.pop(key, None)
    
    def clear(self) -> None:
        self.cache.clear()

class RedisCache(CacheBackend):
    """Cache com Redis"""
    
    def __init__(self, redis_url: str):
        import redis
        self.redis = redis.from_url(redis_url, decode_responses=True)
    
    def get(self, key: str) -> Optional[Any]:
        value = self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: Any, ttl: int) -> None:
        self.redis.setex(key, ttl, json.dumps(value))
    
    def delete(self, key: str) -> None:
        self.redis.delete(key)
    
    def clear(self) -> None:
        self.redis.flushdb()

class CacheManager:
    """Gerenciador de cache com estratégia padrão"""
    
    def __init__(self, backend: CacheBackend, ttl_seconds: int = 3600):
        self.backend = backend
        self.ttl_seconds = ttl_seconds
    
    def _get_cache_key(self, namespace: str, query: Dict[str, Any]) -> str:
        """Gera chave de cache determinística"""
        query_str = json.dumps(query, sort_keys=True)
        hash_val = hashlib.md5(query_str.encode()).hexdigest()
        return f"{namespace}:{hash_val}"
    
    def get_or_fetch(self, namespace: str, query: Dict[str, Any], 
                     fetch_fn, *args, **kwargs) -> Any:
        """Get do cache, senão busca via fetch_fn"""
        key = self._get_cache_key(namespace, query)
        
        # Tentar cache
        cached = self.backend.get(key)
        if cached is not None:
            return {"source": "cache", "data": cached}
        
        # Buscar
        result = fetch_fn(*args, **kwargs)
        
        # Guardar em cache se sucesso
        if result.get("status") == "success":
            self.backend.set(key, result.get("data"), self.ttl_seconds)
        
        return {"source": "api", "data": result}
    
    def invalidate(self, namespace: str) -> None:
        """Invalida todas as chaves de um namespace"""
        # Implementação simplificada
        # Em produção, usar Redis pattern matching
        pass
```

---

## 5. Rate Limiter (rate_limiter.py)

```python
import time
from typing import Optional
import math

class TokenBucketLimiter:
    """Token bucket rate limiter"""
    
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens por segundo
        self.last_refill = time.time()
    
    def _refill(self) -> None:
        now = time.time()
        elapsed = now - self.last_refill
        tokens_to_add = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + tokens_to_add)
        self.last_refill = now
    
    def acquire(self, tokens: int = 1) -> bool:
        """Tenta adquirir tokens. Retorna True se conseguiu"""
        self._refill()
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
    
    def wait_and_acquire(self, tokens: int = 1) -> None:
        """Aguarda até conseguir tokens"""
        while not self.acquire(tokens):
            time.sleep(0.1)

class RateLimiter:
    """Gerenciador de rate limit"""
    
    def __init__(self, requests_per_minute: int = 60, burst_size: int = 10):
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        
        # refill_rate = requests_per_minute / 60 = requests por segundo
        refill_rate = requests_per_minute / 60
        
        self.limiter = TokenBucketLimiter(
            capacity=burst_size,
            refill_rate=refill_rate
        )
    
    def wait_if_needed(self) -> None:
        """Aguarda se necessário antes de fazer request"""
        self.limiter.wait_and_acquire(1)
    
    def can_request(self) -> bool:
        """Verifica se pode fazer request agora"""
        return self.limiter.acquire(1)
```

---

## 6. MCP Handlers (mcp_handlers.py)

```python
import logging
from typing import Any, Dict
import mcp
from mcp.server.models import Tool

logger = logging.getLogger(__name__)

class JIRAMCPHandlers:
    """Handlers para MCP Server JIRA"""
    
    def __init__(self, jira_client, cache_manager, rate_limiter):
        self.jira = jira_client
        self.cache = cache_manager
        self.limiter = rate_limiter
    
    async def get_issue_handler(self, issue_key: str) -> Dict[str, Any]:
        """Handler MCP para obter issue"""
        self.limiter.wait_if_needed()
        
        result = self.cache.get_or_fetch(
            namespace="issue",
            query={"key": issue_key},
            fetch_fn=self.jira.get_issue,
            issue_key=issue_key,
            fields=["key", "summary", "status", "priority", "assignee"]
        )
        
        return result
    
    async def search_issues_handler(self, jql: str, max_results: int = 50) -> Dict[str, Any]:
        """Handler MCP para buscar issues"""
        self.limiter.wait_if_needed()
        
        result = self.cache.get_or_fetch(
            namespace="search",
            query={"jql": jql, "limit": max_results},
            fetch_fn=self.jira.search_issues,
            jql=jql,
            max_results=max_results
        )
        
        return result
    
    async def update_issue_handler(self, issue_key: str, fields: Dict[str, Any]) -> Dict[str, Any]:
        """Handler MCP para atualizar issue"""
        self.limiter.wait_if_needed()
        
        # Não cachear atualizações
        result = self.jira.update_issue(issue_key, fields)
        
        # Invalidar cache dessa issue
        self.cache.invalidate("issue")
        
        return result

def get_tools() -> list:
    """Define ferramentas disponíveis no MCP"""
    return [
        Tool(
            name="get_jira_issue",
            description="Obter detalhes de uma issue JIRA",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_key": {
                        "type": "string",
                        "description": "Chave da issue (ex: PROJ-123)"
                    }
                },
                "required": ["issue_key"]
            }
        ),
        Tool(
            name="search_jira_issues",
            description="Buscar issues JIRA usando JQL",
            inputSchema={
                "type": "object",
                "properties": {
                    "jql": {
                        "type": "string",
                        "description": "Query JQL"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Máximo de resultados",
                        "default": 50
                    }
                },
                "required": ["jql"]
            }
        ),
        Tool(
            name="update_jira_issue",
            description="Atualizar uma issue JIRA",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_key": {
                        "type": "string",
                        "description": "Chave da issue"
                    },
                    "fields": {
                        "type": "object",
                        "description": "Campos a atualizar"
                    }
                },
                "required": ["issue_key", "fields"]
            }
        )
    ]
```

---

## 7. Entry Point Principal (main.py)

```python
import logging
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server

from config import JIRAConfig, CacheConfig, RateLimitConfig
from jira_client import JIRAClient
from cache_manager import MemoryCache, CacheManager
from rate_limiter import RateLimiter
from mcp_handlers import JIRAMCPHandlers, get_tools

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar componentes
jira_config = JIRAConfig.from_env()
cache_config = CacheConfig()
rate_limit_config = RateLimitConfig()

# Criar instâncias
jira_client = JIRAClient(jira_config)
cache_backend = MemoryCache(max_size=cache_config.max_size)
cache_manager = CacheManager(cache_backend, ttl_seconds=cache_config.ttl_seconds)
rate_limiter = RateLimiter(
    requests_per_minute=rate_limit_config.requests_per_minute,
    burst_size=rate_limit_config.burst_size
)

# Criar handlers
handlers = JIRAMCPHandlers(jira_client, cache_manager, rate_limiter)

# Configurar MCP Server
server = Server("jira-mcp-server")

@server.list_tools()
async def list_tools():
    return get_tools()

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    logger.info(f"Executando tool: {name} com args: {arguments}")
    
    if name == "get_jira_issue":
        return await handlers.get_issue_handler(arguments["issue_key"])
    
    elif name == "search_jira_issues":
        return await handlers.search_issues_handler(
            arguments["jql"],
            arguments.get("max_results", 50)
        )
    
    elif name == "update_jira_issue":
        return await handlers.update_issue_handler(
            arguments["issue_key"],
            arguments["fields"]
        )
    
    else:
        raise ValueError(f"Tool não conhecida: {name}")

async def main():
    async with stdio_server(server) as streams:
        logger.info("MCP JIRA Server iniciado")
        await server.wait_for_shutdown()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 8. Docker Compose para Desenvolvimento

```yaml
version: '3.8'

services:
  mcp-jira-server:
    build: .
    container_name: mcp-jira-server
    environment:
      JIRA_URL: ${JIRA_URL}
      JIRA_EMAIL: ${JIRA_EMAIL}
      JIRA_API_TOKEN: ${JIRA_API_TOKEN}
      CACHE_BACKEND: ${CACHE_BACKEND:-memory}
      LOG_LEVEL: INFO
    ports:
      - "8000:8000"
    networks:
      - jira-network

networks:
  jira-network:
    driver: bridge
```

---

## 9. Requisitos e Instalação

```txt
# requirements.txt
requests==2.31.0
mcp==0.1.0
python-dotenv==1.0.0
redis==5.0.1  # Opcional, apenas para Redis cache
pydantic==2.0.0
aiofiles==23.0.0
```

```bash
# Instalação
pip install -r requirements.txt

# Executar
export JIRA_URL=https://seu-jira.atlassian.net
export JIRA_EMAIL=seu-email@example.com
export JIRA_API_TOKEN=seu-token

python src/main.py
```

---

## 10. Boas Práticas Resumidas

| Aspecto | Recomendação |
|---------|--------------|
| **Cache** | TTL 1 hora para search, 30 min para issues individuais |
| **Rate Limit** | 60 req/min com burst de 10 (padrão JIRA Cloud) |
| **Retry** | Exponential backoff: 1s, 2s, 4s, 8s máx |
| **Timeout** | 30s para requests individuais |
| **Logging** | Estruturado com níveis INFO/WARNING/ERROR |
| **Autenticação** | Sempre variáveis de ambiente, nunca hardcode |
| **Cache Invalidation** | Invalidar após UPDATE/DELETE |
| **Error Handling** | Mapear status HTTP → mensagens claras |
| **Monitoramento** | Log requests/responses para debug |
| **Documentação** | Docstrings em todas as funções públicas |
