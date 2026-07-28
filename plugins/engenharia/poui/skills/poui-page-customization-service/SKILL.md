---
name: poui-page-customization-service
description: Serviço PoPageCustomizationService do PO UI para customização dinâmica de metadados de páginas em runtime. Use quando precisar customizar opções dos templates dinâmicos via URL POST ou função, fazer merge de propriedades, ou implementar serviceLoadApi para templates PO UI.
---

# PoPageCustomizationService

Serviço que permite customizar propriedades dos templates dinâmicos em runtime, via URL (POST) ou função JavaScript. É acionado automaticamente pela propriedade `p-load` ou via `serviceLoadApi` nas rotas.

## Importação

```typescript
import { PoPageCustomizationService } from "@po-ui/ng-templates";
```

Registrado como `providedIn: 'root'` (singleton).

## Como Funciona

### Via URL (POST)

Quando `p-load` recebe uma string (URL), o serviço faz um `POST` para essa URL e espera um objeto de opções como resposta:

```typescript
// No componente
@Input('p-load') onLoad = 'https://api.example.com/page-options';
```

```
POST https://api.example.com/page-options
Body: {}
Response: { title: 'Novo Título', fields: [...], actions: [...] }
```

### Via Função

Quando `p-load` recebe uma função, ela é executada e seu retorno é usado como opções:

```typescript
// No componente
getPageOptions(): PoPageDynamicSearchOptions {
  return {
    actions: [{ label: 'Buscar no Google' }],
    filters: [{ property: 'idCard', gridColumns: 6 }]
  };
}

// No template
// [p-load]="getPageOptions.bind(this)"
```

## Métodos

### `getCustomOptions<T>(origin, originalOption, optionSchema): Observable<T>`

Busca opções customizadas e faz merge com as opções originais seguindo o schema definido.

**Parâmetros:**

- `origin` — URL (string) ou função
- `originalOption` — Opções originais do componente
- `optionSchema` — Schema que define como mesclar as propriedades

### `changeOriginalOptionsToNewOptions<T, K>(objectToChange, newOptions): void`

Sobrescreve propriedades de um objeto com os novos valores, mantendo a referência original.

## Schema de Merge

O merge segue regras definidas pelo `PoPageDynamicOptionsSchema`:

```typescript
interface PoPageDynamicOptionsSchema<T> {
  schema: PoPageDynamicOptionsProp<T>[];
}

interface PoPageDynamicOptionsProp<T> {
  nameProp: keyof T;
  merge?: boolean; // Se true, faz merge de arrays/objetos
  keyForMerge?: string; // Chave para deduplicar itens em merge de arrays
}
```

### Regras de Merge

1. **`merge: false`** (padrão) — O novo valor substitui o original
2. **`merge: true` com arrays** — Itens são mesclados por `keyForMerge`, sem duplicação
3. **`merge: true` com objetos** — Spread simples (`{...original, ...novo}`)

## Exemplo Prático

Customizar campos de uma `po-page-dynamic-table` via URL:

```typescript
// Nas rotas
{
  path: 'people',
  component: PoPageDynamicTableComponent,
  data: {
    serviceApi: 'http://api/v1/people',
    serviceLoadApi: 'http://api/v1/load-metadata'  // POST
  }
}
```

O endpoint `serviceLoadApi` retorna customizações:

```json
{
  "title": "Funcionários",
  "fields": [
    { "property": "name", "label": "Nome Completo", "gridColumns": 6 }
  ],
  "actions": {
    "new": "/people/new",
    "edit": "/people/edit/:id"
  }
}
```

As customizações são mescladas com os metadados carregados via `serviceMetadataApi`.
