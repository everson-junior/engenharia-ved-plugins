---
name: poui-page-dynamic-table
description: Componente po-page-dynamic-table do PO UI para listagem de registros com tabela dinâmica e CRUD completo. Use quando precisar criar página de listagem, tabela com paginação, CRUD automático com tabela, excluir registros, duplicar registros, ações de novo/editar/detalhe/excluir em tabela, gerenciador de colunas, busca com tabela, ou configurar metadados para renderizar tabela dinamicamente no PO UI. Este é o componente mais usado do PO UI Templates.
---

# PoPageDynamicTable

O template mais completo e utilizado do PO UI. Exibe uma lista de registros em tabela com busca, filtros avançados, paginação e ações CRUD automáticas.

**Seletor:** `po-page-dynamic-table`  
**Módulo:** `PoTemplatesModule` ou `PoPageDynamicTableModule`  
**Estende:** `PoPageDynamicListBaseComponent` → `PoPageDynamicSearchBaseComponent`

## Propriedades (@Input)

### Base (herdadas)

| Propriedade  | Binding         | Tipo                          | Padrão          | Descrição                                    |
| ------------ | --------------- | ----------------------------- | --------------- | -------------------------------------------- |
| `serviceApi` | `p-service-api` | `string`                      | —               | Endpoint da API de recursos                  |
| `title`      | `p-title`       | `string`                      | —               | Título da página                             |
| `breadcrumb` | `p-breadcrumb`  | `PoBreadcrumb`                | `{ items: [] }` | Breadcrumb                                   |
| `fields`     | `p-fields`      | `PoPageDynamicTableFilters[]` | `[]`            | Campos da tabela e filtros                   |
| `autoRouter` | `p-auto-router` | `boolean`                     | `false`         | Cria rotas de edição/detalhe automaticamente |

### Ações

| Propriedade          | Binding                  | Tipo                                    | Padrão | Descrição                              |
| -------------------- | ------------------------ | --------------------------------------- | ------ | -------------------------------------- |
| `actions`            | `p-actions`              | `PoPageDynamicTableActions`             | —      | Ações CRUD da página                   |
| `pageCustomActions`  | `p-page-custom-actions`  | `PoPageDynamicTableCustomAction[]`      | `[]`   | Ações customizadas na página           |
| `tableCustomActions` | `p-table-custom-actions` | `PoPageDynamicTableCustomTableAction[]` | `[]`   | Ações customizadas por linha da tabela |

### Pesquisa (herdadas)

| Propriedade               | Binding                        | Tipo      | Padrão  | Descrição                                |
| ------------------------- | ------------------------------ | --------- | ------- | ---------------------------------------- |
| `keepFilters`             | `p-keep-filters`               | `boolean` | `false` | Manter filtros ao reabrir busca avançada |
| `concatFilters`           | `p-concat-filters`             | `boolean` | `false` | Concatenar pesquisa rápida com filtros   |
| `quickSearchValue`        | `p-quick-search-value`         | `string`  | —       | Valor inicial da busca rápida            |
| `quickSearchWidth`        | `p-quick-search-width`         | `number`  | —       | Largura do campo de busca                |
| `hideRemoveAllDisclaimer` | `p-hide-remove-all-disclaimer` | `boolean` | `false` | Ocultar "remover todos" disclaimers      |
| `visibleFixedFilters`     | `p-visible-fixed-filters`      | `boolean` | `true`  | Controla visibilidade dos filtros fixos  |

### Tabela e Customização

| Propriedade      | Binding             | Tipo                          | Padrão     | Descrição                  |
| ---------------- | ------------------- | ----------------------------- | ---------- | -------------------------- |
| `height`         | `p-height`          | `number`                      | —          | Altura fixa da tabela (px) |
| `load`           | `p-load`            | `string \| Function`          | —          | Customização de opções     |
| `literals`       | `p-literals`        | `PoPageDynamicSearchLiterals` | —          | Customização de textos     |
| `componentsSize` | `p-components-size` | `string`                      | `'medium'` | Tamanho dos componentes    |

## Eventos (@Output)

| Evento                 | Binding                    | Tipo                              | Descrição                     |
| ---------------------- | -------------------------- | --------------------------------- | ----------------------------- |
| `quickSearch`          | `p-quick-search`           | `EventEmitter<string>`            | Pesquisa rápida               |
| `advancedSearch`       | `p-advanced-search`        | `EventEmitter<any>`               | Busca avançada                |
| `changeDisclaimers`    | `p-change-disclaimers`     | `EventEmitter<any>`               | Mudança de disclaimers        |
| `changeVisibleColumns` | `p-change-visible-columns` | `EventEmitter<string[]>`          | Colunas visíveis alteradas    |
| `columnRestoreManager` | `p-restore-column-manager` | `EventEmitter<string[]>`          | Colunas restauradas ao padrão |
| `sortBy`               | `p-sort-by`                | `EventEmitter<PoTableColumnSort>` | Ordenação de coluna           |

## Interface PoPageDynamicTableActions

```typescript
interface PoPageDynamicTableActions {
  new?: string | Function | PoPageDynamicTableBeforeNew;
  edit?: string | Function | PoPageDynamicTableBeforeEdit;
  detail?: string | Function | PoPageDynamicTableBeforeDetail;
  duplicate?: string | Function | PoPageDynamicTableBeforeDuplicate;
  remove?: boolean | Function | PoPageDynamicTableBeforeRemove;
  removeAll?: boolean | Function | PoPageDynamicTableBeforeRemoveAll;
}
```

**Comportamentos:**

- **new** — Rota/ação para criar novo registro
- **edit** — Rota/ação para editar (ex: `'/people/edit/:id'`)
- **detail** — Rota/ação para detalhe (ex: `'/people/detail/:id'`)
- **duplicate** — Rota/ação para duplicar registro
- **remove** — `true` = exclusão individual automática via DELETE
- **removeAll** — `true` = exclusão em lote via DELETE com body

## Interface PoPageDynamicTableFilters

```typescript
interface PoPageDynamicTableFilters {
  property: string; // Nome da propriedade
  label?: string; // Label da coluna/filtro
  type?: string; // Tipo do dado
  key?: boolean; // Campo-chave (usado na exclusão)
  visible?: boolean; // Visível na tabela
  filter?: boolean; // Disponível como filtro avançado
  duplicate?: boolean; // Copiado na duplicação
  order?: number; // Ordem da coluna
  gridColumns?: number; // Largura do campo no filtro
  allowColumnsManager?: boolean; // Visível no gerenciador de colunas
  fixed?: boolean; // Filtro fixo
  initValue?: any; // Valor inicial do filtro
  options?: Array<{ label: string; value: any }>;
  format?: string; // Formato de exibição
}
```

## Ações Customizadas

### Na Página (toolbar)

```typescript
interface PoPageDynamicTableCustomAction {
  label: string;
  action: string | Function;
  icon?: string;
  visible?: boolean;
  selectable?: boolean; // true = botão ativo com itens selecionados
}
```

### Na Tabela (por linha)

```typescript
interface PoPageDynamicTableCustomTableAction {
  label: string;
  action: string | Function;
  icon?: string;
  visible?: boolean | Function;
  separator?: boolean;
}
```

## Requisições Automáticas

### Listar Recursos

```
GET {serviceApi}?page=1&pageSize=10&search=texto&order=-name
```

### Excluir Recurso Individual

```
DELETE {serviceApi}/{id}
```

### Excluir em Lote

```
DELETE {serviceApi}
Body: [{"id": 2}, {"id": 4}, {"id": 5}]
```

### Metadados

```
GET {serviceApi}/metadata?type=list&version={version}
```

## Formato de Resposta de Metadados

```json
{
  "version": 1,
  "title": "Person Table",
  "fields": [
    { "property": "id", "key": true, "disabled": true },
    { "property": "name", "filter": true },
    { "property": "status" },
    { "property": "birthdate", "label": "Birth date", "type": "date" }
  ],
  "keepFilters": true
}
```

## Uso Básico

```html
<po-page-dynamic-table
  p-service-api="https://api.example.com/v1/people"
  p-title="Pessoas"
  [p-fields]="fields"
  [p-actions]="actions"
  [p-breadcrumb]="breadcrumb"
  [p-keep-filters]="true"
>
</po-page-dynamic-table>
```

```typescript
fields: PoPageDynamicTableFilters[] = [
  { property: 'id', key: true, visible: false },
  { property: 'name', label: 'Nome', filter: true },
  { property: 'email', label: 'E-mail', filter: true },
  { property: 'city', label: 'Cidade', filter: true },
  { property: 'status', label: 'Status', type: 'label',
    labels: [
      { value: 'active', label: 'Ativo', color: 'color-11' },
      { value: 'inactive', label: 'Inativo', color: 'color-07' }
    ]
  },
  { property: 'hireDate', label: 'Data Contratação', type: 'date' }
];

actions: PoPageDynamicTableActions = {
  new: '/people/new',
  edit: '/people/edit/:id',
  detail: '/people/detail/:id',
  duplicate: '/people/new',
  remove: true,
  removeAll: true
};
```

## Uso via Rotas

```typescript
const routes: Routes = [
  {
    path: "people",
    component: PoPageDynamicTableComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
      serviceLoadApi: "http://localhost:3000/load-metadata",
    },
  },
];
```

## Before Actions (interceptadores)

Permitem interceptar ações antes de executá-las:

```typescript
const actions: PoPageDynamicTableActions = {
  remove: {
    beforeAction: (id, resource) => {
      // Retorna Observable com allowAction e/ou newUrl
      return of({ allowAction: true, newUrl: undefined });
    },
  },
  new: {
    beforeAction: () => {
      return of({ allowAction: true, newUrl: "/people/new" });
    },
  },
};
```

## Customização via p-load

```typescript
getPageOptions(): PoPageDynamicTableOptions {
  return {
    title: 'Funcionários',
    fields: [
      { property: 'name', label: 'Nome Completo' },
      { property: 'department', label: 'Departamento', filter: true }
    ],
    actions: {
      new: '/people/new',
      remove: true
    },
    keepFilters: true
  };
}
```

## Tokens CSS Customizáveis

| Token               | Descrição                     | Padrão                                |
| ------------------- | ----------------------------- | ------------------------------------- |
| `--padding`         | Espaçamento do header         | `var(--spacing-xs) var(--spacing-md)` |
| `--gap`             | Espaçamento breadcrumb/título | `var(--spacing-md)`                   |
| `--gap-actions`     | Espaçamento entre ações       | `var(--spacing-xs)`                   |
| `--font-family`     | Tipografia do título          | `var(--font-family-theme)`            |
| `--padding-content` | Espaçamento do conteúdo       | `var(--spacing-xs) var(--spacing-sm)` |
