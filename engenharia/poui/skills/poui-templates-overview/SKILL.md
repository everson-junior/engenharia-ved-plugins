---
name: poui-templates-overview
description: Guia geral da biblioteca PO UI Templates (@po-ui/ng-templates) para Angular. Use esta skill quando o usuário mencionar PO UI, po-ui, POUI, templates PO, páginas dinâmicas PO, ou quiser criar telas CRUD com PO UI, configurar módulos PO Templates, ou entender como os componentes de template funcionam juntos.
---

# PO UI Templates - Visão Geral

A biblioteca `@po-ui/ng-templates` fornece templates de página prontos para uso em aplicações Angular, acelerando o desenvolvimento de telas CRUD, login, agendamento de processos e fluxos de autenticação.

## Instalação

```bash
npm install @po-ui/ng-templates
```

## Configuração do Módulo

Importe o `PoTemplatesModule` no módulo da sua aplicação:

```typescript
import { PoTemplatesModule } from "@po-ui/ng-templates";

@NgModule({
  imports: [PoTemplatesModule],
})
export class AppModule {}
```

O `PoTemplatesModule` importa e exporta automaticamente:

- `PoComponentsModule` — todos os componentes de template
- `PoServicesModule` — todos os serviços de template

## Pré-requisitos

É necessário ter instalado:

- `@po-ui/ng-components` — biblioteca base de componentes PO UI
- `@po-ui/style` — estilos visuais da PO UI

Para exibição correta das imagens (login, blocked-user, change-password), configure o `angular.json`:

```json
"assets": [
  "src/assets",
  "src/favicon.ico",
  {
    "glob": "**/*",
    "input": "node_modules/@po-ui/style/images",
    "output": "assets/images"
  }
]
```

## Templates Disponíveis

### Páginas Dinâmicas (CRUD)

Conjunto de componentes que formam um fluxo CRUD completo baseado em metadados:

| Componente         | Seletor                  | Descrição                                   |
| ------------------ | ------------------------ | ------------------------------------------- |
| **Dynamic Table**  | `po-page-dynamic-table`  | Listagem com tabela, busca, filtros e ações |
| **Dynamic Search** | `po-page-dynamic-search` | Base de pesquisa com filtros avançados      |
| **Dynamic Edit**   | `po-page-dynamic-edit`   | Formulário de criação/edição                |
| **Dynamic Detail** | `po-page-dynamic-detail` | Visualização detalhada de registro          |

### Páginas de Autenticação

| Componente            | Seletor                      | Descrição                                 |
| --------------------- | ---------------------------- | ----------------------------------------- |
| **Login**             | `po-page-login`              | Tela de login com autenticação automática |
| **Change Password**   | `po-page-change-password`    | Criação/alteração de senha                |
| **Blocked User**      | `po-page-blocked-user`       | Tela de usuário bloqueado                 |
| **Password Recovery** | `po-modal-password-recovery` | Modal de recuperação de senha             |
| **Background**        | `po-page-background`         | Componente de fundo para telas de auth    |

### Agendamento

| Componente        | Seletor                 | Descrição                            |
| ----------------- | ----------------------- | ------------------------------------ |
| **Job Scheduler** | `po-page-job-scheduler` | Wizard para agendamento de processos |

## Fluxo CRUD Típico

As páginas dinâmicas trabalham juntas para criar um fluxo CRUD completo:

```
┌──────────────────────┐     ┌────────────────────────┐
│ po-page-dynamic-table│────▶│ po-page-dynamic-detail │
│   (Listagem/Busca)   │     │   (Detalhe do registro)│
└──────────┬───────────┘     └────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ po-page-dynamic-edit │
│  (Criar/Editar)      │
└──────────────────────┘
```

### Exemplo de Rotas CRUD

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
  {
    path: "people/new",
    component: PoPageDynamicEditComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
    },
  },
  {
    path: "people/edit/:id",
    component: PoPageDynamicEditComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
    },
  },
  {
    path: "people/detail/:id",
    component: PoPageDynamicDetailComponent,
    data: {
      serviceApi: "http://localhost:3000/v1/people",
      serviceMetadataApi: "http://localhost:3000/v1/metadata",
    },
  },
];
```

## Sistema de Metadados

Os templates suportam carregamento dinâmico de metadados via API:

1. **serviceMetadataApi** (GET) — Busca metadados com cache/versionamento
2. **serviceLoadApi** (POST) — Customizações dinâmicas dos metadados

Formato de resposta dos metadados:

```json
{
  "version": 1,
  "title": "Person Table",
  "fields": [
    { "property": "id", "key": true, "disabled": true },
    { "property": "name", "label": "Nome" },
    { "property": "email", "type": "email" },
    { "property": "birthdate", "label": "Data de Nascimento", "type": "date" }
  ],
  "keepFilters": true
}
```

## Serviços Disponíveis

- **PoPageDynamicService** — Serviço CRUD (GET/POST/PUT/DELETE) com gerenciamento de metadados
- **PoPageCustomizationService** — Serviço para customização runtime de metadados via função ou URL

## Internacionalização (i18n)

Todos os templates suportam i18n automático com base no idioma do navegador:

- **pt** (Português)
- **en** (English)
- **es** (Español)
- **ru** (Русский)

Literais podem ser customizadas via propriedade `p-literals` em cada componente.
