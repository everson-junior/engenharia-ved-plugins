---
name: poui-page-dynamic-detail
description: Componente po-page-dynamic-detail do PO UI para exibição de detalhes de um registro. Use quando precisar criar página de visualização de registro, detalhe de item, exibir campos read-only de uma entidade, configurar ações de editar/excluir/voltar no detalhe, ou usar metadados para renderizar detalhes automaticamente no PO UI.
---

# PoPageDynamicDetail

Template de página para exibição de registros em detalhes (somente leitura), com suporte a metadados e ações automáticas.

**Seletor:** `po-page-dynamic-detail`  
**Módulo:** `PoTemplatesModule` ou `PoPageDynamicDetailModule`

## Propriedades (@Input)

| Propriedade      | Binding             | Tipo                         | Padrão          | Descrição                               |
| ---------------- | ------------------- | ---------------------------- | --------------- | --------------------------------------- |
| `serviceApi`     | `p-service-api`     | `string`                     | —               | Endpoint da API do recurso              |
| `title`          | `p-title`           | `string`                     | —               | Título da página                        |
| `breadcrumb`     | `p-breadcrumb`      | `PoBreadcrumb`               | `{ items: [] }` | Breadcrumb                              |
| `fields`         | `p-fields`          | `PoPageDynamicDetailField[]` | `[]`            | Campos a exibir                         |
| `actions`        | `p-actions`         | `PoPageDynamicDetailActions` | —               | Ações da página                         |
| `autoRouter`     | `p-auto-router`     | `boolean`                    | `false`         | Cria rotas automaticamente              |
| `load`           | `p-load`            | `string \| Function`         | —               | Customização de opções (serviceLoadApi) |
| `componentsSize` | `p-components-size` | `string`                     | `'medium'`      | Tamanho dos componentes                 |

## Interface PoPageDynamicDetailActions

```typescript
interface PoPageDynamicDetailActions {
  back?: string | Function | PoPageDynamicDetailBeforeBack;
  edit?: string | Function | PoPageDynamicDetailBeforeEdit;
  remove?: string | boolean | Function | PoPageDynamicDetailBeforeRemove;
}
```

**Comportamentos:**

- **back** — Rota ou ação ao clicar "Voltar"
- **edit** — Rota ou ação ao clicar "Editar" (navega para edição do registro)
- **remove** — `true` habilita exclusão automática via API; string/function para customizar

## Interface PoPageDynamicDetailField

```typescript
interface PoPageDynamicDetailField {
  property: string; // Nome da propriedade
  label?: string; // Label exibido
  type?: string; // Tipo do campo
  key?: boolean; // Se é campo-chave
  visible?: boolean; // Se está visível
  gridColumns?: number; // Colunas no grid (1-12)
  divider?: string; // Título do divisor visual
  format?: string; // Formato de exibição
  order?: number; // Ordem de exibição
}
```

## Requisições Automáticas

### Buscar Registro

```
GET {serviceApi}/{id}
```

### Excluir Registro

```
DELETE {serviceApi}/{id}
```

### Metadados

```
GET {serviceApi}/metadata?type=detail&version={version}
```

## Literais i18n

```typescript
{
  pageActionEdit: 'Editar',
  pageActionRemove: 'Excluir',
  pageActionBack: 'Voltar',
  confirmRemoveTitle: 'Confirmar exclusão',
  confirmRemoveMessage: 'Tem certeza de que deseja excluir esse registro?',
  removeNotificationSuccess: 'Item excluído com sucesso.',
  registerNotFound: 'Registro não encontrado.'
}
```

## Uso Básico

```html
<po-page-dynamic-detail
  p-service-api="https://api.example.com/v1/people"
  p-title="Detalhes da Pessoa"
  [p-fields]="detailFields"
  [p-actions]="detailActions"
>
</po-page-dynamic-detail>
```

```typescript
detailFields: PoPageDynamicDetailField[] = [
  { property: 'id', key: true, label: 'ID' },
  { property: 'name', label: 'Nome', gridColumns: 6 },
  { property: 'email', label: 'E-mail', gridColumns: 6 },
  { property: 'birthdate', label: 'Data de Nascimento', type: 'date' }
];

detailActions: PoPageDynamicDetailActions = {
  back: '/people',
  edit: '/people/edit/:id',
  remove: true
};
```

## Uso via Rotas

```typescript
const routes: Routes = [
  {
    path: "people/:id",
    component: PoPageDynamicDetailComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
      serviceLoadApi: "http://localhost:3000/load-metadata",
    },
  },
];
```

## Before Actions (interceptadores)

Interfaces que permitem interceptar ações antes de executá-las:

```typescript
// PoPageDynamicDetailBeforeRemove
interface PoPageDynamicDetailBeforeRemove {
  beforeAction?: (
    id: string,
    resource: any,
  ) => Observable<PoPageDynamicDetailBeforeRemove>;
  newUrl?: string; // Redirecionar ao invés de excluir
  allowAction?: boolean; // false = cancela a ação
}
```

Padrão similar para `BeforeBack` e `BeforeEdit`.
