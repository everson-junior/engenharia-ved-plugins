---
type: skill
name: Api Design
description: Design RESTful APIs following best practices
skillSlug: api-design
phases: [P, R]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# API Design Skill — PO UI / TOTVS Context

## When to Use

Use ao projetar ou revisar APIs REST consumidas por aplicações Angular com PO UI.

## Instructions

### 1. Padrões TOTVS/PO UI

O PO UI possui suporte nativo a padrões específicos de resposta:

**Response de Lista (com `PoHttpRequestObservable`)**:
```json
{
  "items": [...],
  "hasNext": true,
  "_messages": [
    { "code": "200", "message": "Sucesso", "type": "success" }
  ]
}
```

**Response de Erro (PoHttpInterceptor)**:
```json
{
  "_messages": [
    { "code": "400", "message": "Invalid parameter", "type": "error" }
  ]
}
```

### 2. Headers PO UI

- `X-PO-Screen-Lock: true` — Ativar overlay de carregamento durante a requisição
- `X-PO-No-Error: true` — Suprimir notificações de erro automáticas do interceptor

### 3. Checklist de Design de API

- [ ] URLs em kebab-case: `/api/clientes`, `/api/pedidos-venda`
- [ ] Verbos HTTP corretos: GET (listar/buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE
- [ ] Paginação com `page` e `pageSize` params
- [ ] Resposta de lista inclui `hasNext` para `po-table` com `p-infinite-scroll`
- [ ] `_messages` no body para integração com `PoHttpInterceptor`
- [ ] Status HTTP corretos (200, 201, 400, 401, 403, 404, 500)
- [ ] CORS configurado para domínio da aplicação Angular

### 4. Serviço Angular para APIs TOTVS

```typescript
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(page = 1, pageSize = 20): Observable<{items: Cliente[], hasNext: boolean}> {
    const params = { page, pageSize };
    const headers = { 'X-PO-Screen-Lock': 'true' };
    return this.http.get<any>(`${this.API}/clientes`, { params, headers });
  }
}
```

## Examples

**po-table com API paginada**:
```typescript
onLoadMore() {
  this.clientesService.list(++this.page).subscribe(res => {
    this.items = [...this.items, ...res.items];
    this.hasNext = res.hasNext;
  });
}
```