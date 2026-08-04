# Resposta - Eval 3: Estratégia para Atualizar em Lote 500 Issues

## Pergunta
Qual é a melhor estratégia para atualizar em lote 500 issues no JIRA? Devo fazer um request por issue ou existe uma API de bulk update? Qual é o melhor tratamento de erros?

## Resposta

### Opções de Atualização em Lote

O JIRA oferece várias abordagens. Vou descrever de forma comparativa:

## 1. **Atualização Individual (Não Recomendado para 500)**

### ❌ Não Recomendado - Muito Lento
```python
for issue_key in issue_keys:
    requests.put(
        f"{JIRA_URL}/rest/api/3/issues/{issue_key}",
        json={"fields": {"status": {"name": "Em Progresso"}}},
        auth=(EMAIL, TOKEN)
    )
    # Resultado: 500 requisições = muito tempo + rate limit
```

**Problemas:**
- 500 requisições = 500+ segundos (com rate limit)
- Alto risco de timeout
- Difícil implementar retry

---

## 2. **API Bulk Change (Recomendado) - /bulk**

### ✅ MELHOR OPÇÃO

O JIRA REST API **não possui** um endpoint oficial de bulk update como alguns SaaS. Porém, a forma mais eficiente é usar **JQL + Issue Navigator export** ou fazer **requisições em paralelo com controle de concorrência**.

```python
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

JIRA_URL = "https://seu-jira.atlassian.net"
EMAIL = "seu-email@example.com"
API_TOKEN = "seu-api-token"
ISSUE_KEYS = ["PROJ-1", "PROJ-2", "PROJ-3", ...]  # 500 keys

auth = (EMAIL, API_TOKEN)
headers = {"Content-Type": "application/json"}
updated_count = 0
failed_count = 0
lock = Lock()

# Configuração de rate limit
MIN_DELAY_BETWEEN_REQUESTS = 0.1  # 100ms entre requests
last_request_time = 0

def update_issue(issue_key, fields_to_update):
    """Atualiza uma única issue com retry"""
    global last_request_time, updated_count, failed_count
    
    # Respeitar rate limit
    with lock:
        elapsed = time.time() - last_request_time
        if elapsed < MIN_DELAY_BETWEEN_REQUESTS:
            time.sleep(MIN_DELAY_BETWEEN_REQUESTS - elapsed)
        last_request_time = time.time()
    
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            response = requests.put(
                f"{JIRA_URL}/rest/api/3/issues/{issue_key}",
                json={"fields": fields_to_update},
                auth=auth,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 204:  # Success
                with lock:
                    updated_count += 1
                print(f"✓ {issue_key} atualizada")
                return True
            
            elif response.status_code == 429:  # Rate limited
                print(f"⚠ {issue_key} - Rate limited, aguardando...")
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            
            elif response.status_code == 400:  # Bad request
                print(f"✗ {issue_key} - Erro na requisição: {response.json()}")
                with lock:
                    failed_count += 1
                return False
            
            elif response.status_code == 403:  # Forbidden
                print(f"✗ {issue_key} - Permissão negada")
                with lock:
                    failed_count += 1
                return False
            
            else:
                print(f"✗ {issue_key} - Erro {response.status_code}: {response.text}")
                with lock:
                    failed_count += 1
                return False
        
        except requests.exceptions.Timeout:
            print(f"⚠ {issue_key} - Timeout, tentativa {attempt + 1}/{max_retries}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                with lock:
                    failed_count += 1
                return False
        
        except Exception as e:
            print(f"✗ {issue_key} - Erro inesperado: {str(e)}")
            with lock:
                failed_count += 1
            return False
    
    return False

# Estratégia 1: Concorrência Controlada (5-10 threads simultâneas)
print("Iniciando atualização em lote...")
start_time = time.time()

fields_update = {
    "status": {"name": "Em Progresso"},
    "assignee": {"name": "seu-usuario"}
}

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(update_issue, key, fields_update): key 
        for key in ISSUE_KEYS
    }
    
    completed = 0
    for future in as_completed(futures):
        completed += 1
        if completed % 50 == 0:
            print(f"Progresso: {completed}/{len(ISSUE_KEYS)} processadas")

elapsed = time.time() - start_time
print(f"\n✓ Concluído em {elapsed:.2f}s")
print(f"  Atualizadas: {updated_count}")
print(f"  Falhadas: {failed_count}")
```

---

## 3. **Alternativa com JQL (Para Tipos de Atualização Simples)**

Se todos os issues têm os mesmos critérios de seleção e mesma atualização:

```python
# ✅ Buscar issues com JQL
jql_query = 'project = "PROJ" AND status = "Open" AND created >= -7d'

response = requests.get(
    f"{JIRA_URL}/rest/api/3/search",
    params={"jql": jql_query, "maxResults": 500},
    auth=auth
)

issues = response.json()["issues"]

# Atualizar em paralelo
for issue in issues:
    update_issue(issue["key"], {"status": {"name": "Em Revisão"}})
```

---

## 4. **Tratamento Robusto de Erros e Logging**

```python
import logging
import json
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"bulk_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class BulkUpdateManager:
    def __init__(self, jira_url, email, token):
        self.jira_url = jira_url
        self.auth = (email, token)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.results = {
            "successful": [],
            "failed": [],
            "skipped": []
        }
    
    def validate_issue_exists(self, issue_key):
        """Valida se a issue existe antes de atualizar"""
        try:
            response = self.session.get(
                f"{self.jira_url}/rest/api/3/issues/{issue_key}",
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Erro ao validar {issue_key}: {str(e)}")
            return False
    
    def update_issue_safe(self, issue_key, fields):
        """Atualiza issue com logging completo"""
        try:
            if not self.validate_issue_exists(issue_key):
                self.results["skipped"].append({
                    "key": issue_key,
                    "reason": "Issue não existe"
                })
                logger.info(f"SKIPPED: {issue_key} - não existe")
                return
            
            response = self.session.put(
                f"{self.jira_url}/rest/api/3/issues/{issue_key}",
                json={"fields": fields},
                timeout=10
            )
            
            if response.status_code == 204:
                self.results["successful"].append(issue_key)
                logger.info(f"SUCCESS: {issue_key}")
            else:
                self.results["failed"].append({
                    "key": issue_key,
                    "status": response.status_code,
                    "error": response.json()
                })
                logger.error(f"FAILED: {issue_key} - {response.status_code}: {response.text}")
        
        except Exception as e:
            self.results["failed"].append({
                "key": issue_key,
                "error": str(e)
            })
            logger.error(f"ERROR: {issue_key} - {str(e)}")
    
    def execute_bulk_update(self, issue_keys, fields, max_workers=5):
        """Executa atualização em lote"""
        logger.info(f"Iniciando atualização de {len(issue_keys)} issues")
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [
                executor.submit(self.update_issue_safe, key, fields)
                for key in issue_keys
            ]
            
            for i, future in enumerate(as_completed(futures), 1):
                future.result()
                if i % 50 == 0:
                    logger.info(f"Progresso: {i}/{len(issue_keys)}")
        
        logger.info(f"Concluído: {len(self.results['successful'])} sucesso, "
                   f"{len(self.results['failed'])} falha, "
                   f"{len(self.results['skipped'])} puladas")
        
        return self.results

# Uso
manager = BulkUpdateManager(JIRA_URL, EMAIL, API_TOKEN)

issue_keys = ["PROJ-1", "PROJ-2", "PROJ-3", ...] # 500 keys

results = manager.execute_bulk_update(
    issue_keys,
    {"status": {"name": "Em Progresso"}},
    max_workers=5
)

# Salvar relatório
with open("update_report.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
```

---

## 5. **Recomendações de Performance**

| Abordagem | Velocidade | Complexidade | Recomendação |
|-----------|-----------|--------------|--------------|
| **Sequencial** | 🐌 Muito lento | Baixa | ❌ Não usar |
| **Paralelo 5 threads** | 🏃 Rápido | Média | ✅ Melhor |
| **Paralelo 20+ threads** | 🚀 Muito rápido | Alta | ⚠️ Risco rate limit |
| **JQL + Batch** | Depende | Média | ✅ Se uniforme |

### Melhores Práticas:
1. Use **5-10 threads paralelas** como base segura
2. Implemente **retry com exponential backoff** para rate limits
3. **Log cada operação** para auditoria
4. **Valide issues** antes de atualizar
5. Use **timeouts** (10-30s por request)
6. Implemente **circuit breaker** se 50%+ falhar
7. Teste com **amostra pequena** primeiro

### Tempo Estimado para 500 Issues:
- **Sequencial**: ~500-1000s (inviável)
- **5 threads**: ~30-60s ✅
- **Relatório de sucesso**: Sempre gere um report JSON final
