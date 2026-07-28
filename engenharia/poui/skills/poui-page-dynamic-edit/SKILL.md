---
name: poui-page-dynamic-edit
description: Componente po-page-dynamic-edit do PO UI para criação e edição de registros com formulário dinâmico. Use quando precisar criar formulário de cadastro, tela de edição, criar/editar registro com campos dinâmicos, salvar e novo, formulário com validação, ou usar metadados para gerar formulários automaticamente no PO UI.
---

# PoPageDynamicEdit

Template de página para criação e edição de registros com formulário gerado dinamicamente a partir de definição de campos.

**Seletor:** `po-page-dynamic-edit`  
**Módulo:** `PoTemplatesModule` ou `PoPageDynamicEditModule`

## Propriedades (@Input)

| Propriedade      | Binding             | Tipo                       | Padrão          | Descrição                  |
| ---------------- | ------------------- | -------------------------- | --------------- | -------------------------- |
| `serviceApi`     | `p-service-api`     | `string`                   | —               | Endpoint da API            |
| `title`          | `p-title`           | `string`                   | —               | Título da página           |
| `breadcrumb`     | `p-breadcrumb`      | `PoBreadcrumb`             | `{ items: [] }` | Breadcrumb                 |
| `fields`         | `p-fields`          | `PoPageDynamicEditField[]` | `[]`            | Campos do formulário       |
| `actions`        | `p-actions`         | `PoPageDynamicEditActions` | —               | Ações da página            |
| `autoRouter`     | `p-auto-router`     | `boolean`                  | `false`         | Cria rotas automaticamente |
| `load`           | `p-load`            | `string \| Function`       | —               | Customização de opções     |
| `componentsSize` | `p-components-size` | `string`                   | `'medium'`      | Tamanho dos componentes    |

## Interface PoPageDynamicEditActions

```typescript
interface PoPageDynamicEditActions {
  cancel?: string | boolean | Function | PoPageDynamicEditBeforeCancel;
  save?: string | Function;
  saveNew?: string | Function;
}
```

**Comportamentos:**

- **cancel** — `true` = botão cancelar com confirmação; string = rota de redirecionamento
- **save** — URL ou função para salvar e redirecionar para lista/detalhe
- **saveNew** — URL ou função para salvar e limpar formulário (novo registro)

## Interface PoPageDynamicEditField

Estende `PoDynamicFormField` do `@po-ui/ng-components`:

```typescript
interface PoPageDynamicEditField extends PoDynamicFormField {
  property: string; // Nome da propriedade
  label?: string; // Label do campo
  type?: string; // Tipo: 'string' | 'number' | 'boolean' | 'date' | 'dateTime' | 'currency'
  key?: boolean; // Campo-chave (disabled na edição)
  required?: boolean; // Obrigatório
  disabled?: boolean; // Desabilitado
  visible?: boolean; // Visível (default: true)
  gridColumns?: number; // Colunas no grid (1-12)
  divider?: string; // Divisor visual
  order?: number; // Ordem de exibição
  options?: Array<{ label: string; value: any }>; // Opções para select
  optionsService?: string; // URL para carregar opções
  validate?: string; // URL de validação do campo
  mask?: string; // Máscara de entrada
  minLength?: number; // Tamanho mínimo
  maxLength?: number; // Tamanho máximo
}
```

## Requisições Automáticas

### Criar Registro

```
POST {serviceApi}
Body: { ...formValues }
```

### Atualizar Registro

```
PUT {serviceApi}/{id}
Body: { ...formValues }
```

### Carregar Registro (edição)

```
GET {serviceApi}/{id}
```

### Metadados

```
GET {serviceApi}/metadata?type=edit&version={version}
```

## Literais i18n

```typescript
{
  pageActionCancel: 'Cancelar',
  pageActionSave: 'Salvar',
  pageActionSaveNew: 'Salvar e novo',
  cancelConfirmMessage: 'Tem certeza que deseja cancelar esta operação?',
  registerNotFound: 'Registro não encontrado.',
  saveNotificationSuccessSave: 'Recurso salvo com sucesso.',
  saveNotificationSuccessUpdate: 'Recurso atualizado com sucesso.',
  saveNotificationWarning: 'Formulário precisa ser preenchido corretamente.',
  saveNotificationError: 'Campo(s) obrigatório(s) sem preenchimento.'
}
```

## Uso Básico

```html
<po-page-dynamic-edit
  p-service-api="https://api.example.com/v1/people"
  p-title="Cadastro de Pessoas"
  [p-fields]="editFields"
  [p-actions]="editActions"
>
</po-page-dynamic-edit>
```

```typescript
editFields: PoPageDynamicEditField[] = [
  { property: 'id', key: true, disabled: true },
  { property: 'name', label: 'Nome', required: true, gridColumns: 6 },
  { property: 'email', label: 'E-mail', type: 'string', gridColumns: 6 },
  { property: 'birthdate', label: 'Data de Nascimento', type: 'date', gridColumns: 4 },
  { property: 'salary', label: 'Salário', type: 'currency', gridColumns: 4 },
  { property: 'active', label: 'Ativo', type: 'boolean', gridColumns: 4 }
];

editActions: PoPageDynamicEditActions = {
  cancel: '/people',
  save: '/people',
  saveNew: '/people/new'
};
```

## Uso via Rotas

```typescript
const routes: Routes = [
  // Criação
  {
    path: "people/new",
    component: PoPageDynamicEditComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
      serviceLoadApi: "http://localhost:3000/load-metadata",
    },
  },
  // Edição (com :id na rota)
  {
    path: "people/edit/:id",
    component: PoPageDynamicEditComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
    },
  },
];
```

## Before Actions

```typescript
// Interceptar cancelamento
interface PoPageDynamicEditBeforeCancel {
  beforeAction?: () => Observable<PoPageDynamicEditBeforeCancel>;
  newUrl?: string;
  allowAction?: boolean;
}
```

## Notificações CRUD

O componente exibe notificações automáticas usando `PoNotificationService`:

- **Sucesso ao salvar:** "Recurso salvo com sucesso."
- **Sucesso ao atualizar:** "Recurso atualizado com sucesso."
- **Erro de validação:** "Campo(s) obrigatório(s) sem preenchimento."
- **Registro não encontrado:** "Registro não encontrado."
