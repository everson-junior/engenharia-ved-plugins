---
name: poui-page-dynamic-search
description: Componente po-page-dynamic-search do PO UI para página com busca rápida e filtros avançados. Use quando precisar criar página de pesquisa, busca avançada com filtros, disclaimers de filtro, pesquisa rápida, quick search, filtros dinâmicos, ou implementar componente base de listagem com búsqueda no PO UI.
---

# PoPageDynamicSearch

Componente base para páginas com capabilidades de pesquisa — busca rápida e filtros avançados com disclaimers. É a classe base que `po-page-dynamic-table` estende.

**Seletor:** `po-page-dynamic-search`  
**Módulo:** `PoTemplatesModule` ou `PoPageDynamicSearchModule`

## Propriedades (@Input)

| Propriedade               | Binding                        | Tipo                           | Padrão          | Descrição                                            |
| ------------------------- | ------------------------------ | ------------------------------ | --------------- | ---------------------------------------------------- |
| `title`                   | `p-title`                      | `string`                       | —               | Título da página                                     |
| `breadcrumb`              | `p-breadcrumb`                 | `PoBreadcrumb`                 | `{ items: [] }` | Breadcrumb                                           |
| `actions`                 | `p-actions`                    | `PoPageAction[]`               | `[]`            | Ações da página                                      |
| `filters`                 | `p-filters`                    | `PoPageDynamicSearchFilters[]` | `[]`            | Filtros disponíveis na busca avançada                |
| `keepFilters`             | `p-keep-filters`               | `boolean`                      | `false`         | Mantém valores dos filtros ao reabrir busca avançada |
| `concatFilters`           | `p-concat-filters`             | `boolean`                      | `false`         | Concatena pesquisa rápida com filtros avançados      |
| `hideRemoveAllDisclaimer` | `p-hide-remove-all-disclaimer` | `boolean`                      | `false`         | Oculta botão "remover todos" disclaimers             |
| `quickSearchValue`        | `p-quick-search-value`         | `string`                       | —               | Valor inicial da busca rápida                        |
| `quickSearchWidth`        | `p-quick-search-width`         | `number`                       | —               | Largura do campo de busca rápida (colunas)           |
| `onLoad`                  | `p-load`                       | `string \| Function`           | —               | Customização de opções (URL POST ou função)          |
| `visibleFixedFilters`     | `p-visible-fixed-filters`      | `boolean`                      | `true`          | Controla visibilidade dos filtros fixos              |
| `literals`                | `p-literals`                   | `PoPageDynamicSearchLiterals`  | —               | Customização de textos                               |
| `componentsSize`          | `p-components-size`            | `string`                       | `'medium'`      | Tamanho dos componentes                              |

## Eventos (@Output)

| Evento              | Binding                | Tipo                   | Descrição                            |
| ------------------- | ---------------------- | ---------------------- | ------------------------------------ |
| `quickSearch`       | `p-quick-search`       | `EventEmitter<string>` | Emitido ao pesquisar na busca rápida |
| `advancedSearch`    | `p-advanced-search`    | `EventEmitter<any>`    | Emitido ao confirmar busca avançada  |
| `changeDisclaimers` | `p-change-disclaimers` | `EventEmitter<any>`    | Emitido ao remover disclaimers       |

## Interface PoPageDynamicSearchFilters

Estende `PoDynamicFormField`:

```typescript
interface PoPageDynamicSearchFilters extends PoDynamicFormField {
  property: string; // Nome da propriedade
  label?: string; // Label do filtro
  type?: string; // Tipo do campo
  gridColumns?: number; // Colunas no grid
  options?: Array<{ label: string; value: any }>;
  optionsService?: string; // URL para carregar opções
  initValue?: any; // Valor inicial do filtro
  fixed?: boolean; // Filtro fixo (sempre aplicado)
  visible?: boolean; // Visível na UI
}
```

## Interface PoPageDynamicSearchLiterals

```typescript
interface PoPageDynamicSearchLiterals {
  disclaimerGroupTitle?: string; // "Apresentando resultados filtrados por:"
  filterTitle?: string; // Título da busca avançada
  filterCancelLabel?: string; // "Cancelar"
  filterConfirmLabel?: string; // "Aplicar filtros"
  quickSearchLabel?: string; // "Pesquisa rápida:"
  searchPlaceholder?: string; // "Pesquisar"
}
```

## Sub-componente: PoAdvancedFilter

Modal de filtros avançados integrada automaticamente. Renderiza campos de formulário dinâmicos baseado nos `filters` definidos.

## Disclaimers

Filtros ativos são exibidos como "disclaimers" (chips removíveis) abaixo da barra de pesquisa. O usuário pode:

- Remover disclaimers individuais
- Remover todos de uma vez (se `hideRemoveAllDisclaimer = false`)
- O evento `changeDisclaimers` é emitido em cada alteração

## Uso Básico

```html
<po-page-dynamic-search
  p-title="Consulta de Funcionários"
  [p-actions]="pageActions"
  [p-filters]="searchFilters"
  [p-keep-filters]="true"
  (p-quick-search)="onQuickSearch($event)"
  (p-advanced-search)="onAdvancedSearch($event)"
  (p-change-disclaimers)="onChangeDisclaimers($event)"
>
  <!-- Conteúdo da página (tabela, lista, etc.) -->
  <po-table [p-items]="items" [p-columns]="columns"></po-table>
</po-page-dynamic-search>
```

```typescript
searchFilters: PoPageDynamicSearchFilters[] = [
  { property: 'name', label: 'Nome', gridColumns: 6 },
  { property: 'city', label: 'Cidade', gridColumns: 6 },
  { property: 'status', label: 'Status', options: [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' }
  ]},
  { property: 'hireDate', label: 'Data Contratação', type: 'date' }
];

onQuickSearch(searchTerm: string) {
  this.loadItems({ search: searchTerm });
}

onAdvancedSearch(filters: any) {
  this.loadItems(filters);
}
```

## Filtros Fixos

Filtros marcados como `fixed: true` são sempre aplicados nas requisições, mas podem ser ocultados na UI com `visibleFixedFilters = false`:

```typescript
filters = [
  { property: "company", initValue: "ACME", fixed: true }, // sempre aplicado
  { property: "name", label: "Nome" },
];
```

## Customização via p-load

```typescript
getPageOptions(): PoPageDynamicSearchOptions {
  return {
    title: 'Pessoas',
    actions: [{ label: 'Novo', url: '/people/new' }],
    filters: [{ property: 'name', gridColumns: 6 }],
    keepFilters: true
  };
}

// No template: [p-load]="getPageOptions.bind(this)"
```
