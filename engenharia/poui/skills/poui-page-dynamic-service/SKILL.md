---
name: poui-page-dynamic-service
description: Serviço PoPageDynamicService do PO UI para requisições CRUD de recursos e metadados. Use quando precisar entender como o PO UI faz requisições HTTP GET/POST/PUT/DELETE para APIs REST, busca metadados com cache/versionamento, ou configurar endpoint de serviço para templates dinâmicos.
---

# PoPageDynamicService

Serviço central de comunicação HTTP usado por todos os templates dinâmicos do PO UI. Gerencia as requisições CRUD e o carregamento de metadados com sistema de cache.

## Importação

```typescript
import { PoPageDynamicService } from "@po-ui/ng-templates";
```

Registrado como `providedIn: 'root'` (singleton automático).

## Configuração

```typescript
configServiceApi(config: { endpoint?: string; metadata?: string }): void
```

Define o endpoint base e opcionalmente um endpoint separado para metadados.

## Métodos

### Metadados

#### `getMetadata<T>(type: string = 'list'): Observable<T>`

Busca metadados da página com sistema de cache via `localStorage`.

**Requisição:**

```
GET {metadataUrl}?type={type}&version={cachedVersion}
```

- Se `metadata` não foi configurado, usa `{endpoint}/metadata`
- Se a versão retornada for igual à em cache, retorna o cache
- Em caso de erro HTTP, retorna o cache (se existir) ou notifica erro

**Tipos de metadados:**

- `'list'` — Para `po-page-dynamic-table`
- `'edit'` — Para `po-page-dynamic-edit`
- `'detail'` — Para `po-page-dynamic-detail`

### CRUD

#### `getResources(params?: HttpParams, endpoint?: string): Observable<any>`

Lista recursos (GET).

```
GET {endpoint}?page=1&pageSize=10&search=texto&order=-name
```

#### `getResource(id, endpoint?: string): Observable<any>`

Busca recurso por ID (GET).

```
GET {endpoint}/{id}
```

#### `createResource(resource, endpoint?: string): Observable<any>`

Cria recurso (POST).

```
POST {endpoint}
Body: { ...resource }
```

#### `updateResource(id, resource, endpoint?: string): Observable<any>`

Atualiza recurso (PUT).

```
PUT {endpoint}/{id}
Body: { ...resource }
```

#### `deleteResource(id?, endpoint?: string): Observable<any>`

Exclui recurso (DELETE).

```
DELETE {endpoint}/{id}
```

#### `deleteResources(ids: Array<any>, endpoint?: string): Observable<any>`

Exclusão em lote (DELETE com body).

```
DELETE {endpoint}
Body: [ {key1}, {key2}, ... ]
```

## Headers

Todas as requisições incluem o header:

```
X-PO-SCREEN-LOCK: true
```

Isto aciona o bloqueio de tela automático durante requisições (via interceptor do PO UI).

## i18n

Mensagens de erro suportam: `pt`, `en`, `es`, `ru`.

| Literal                     | pt                                               |
| --------------------------- | ------------------------------------------------ |
| errorRenderPage             | Erro ao carregar a página                        |
| notPossibleLoadMetadataPage | Não foi possível carregar os metadados da página |
