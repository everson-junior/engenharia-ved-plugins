---
name: poui-page-job-scheduler
description: Componente po-page-job-scheduler do PO UI para agendamento de processos (job scheduler). Use quando precisar criar wizard de agendamento, agendar execução de processos, configurar periodicidade (diário, semanal, mensal), criar formulário de agendamento com stepper, ou integrar com API de processos/jobs no PO UI.
---

# PoPageJobScheduler

Template de página com wizard (stepper) para criação e edição de agendamentos de execução de processos.

**Seletor:** `po-page-job-scheduler`  
**Módulo:** `PoTemplatesModule` ou `PoPageJobSchedulerModule`

## Propriedades (@Input)

| Propriedade      | Binding             | Tipo                   | Padrão          | Descrição                                 |
| ---------------- | ------------------- | ---------------------- | --------------- | ----------------------------------------- |
| `breadcrumb`     | `p-breadcrumb`      | `PoBreadcrumb`         | `{ items: [] }` | Breadcrumb da página                      |
| `serviceApi`     | `p-service-api`     | `string`               | —               | Endpoint da API de processos/agendamentos |
| `title`          | `p-title`           | `string`               | —               | Título da página                          |
| `parameters`     | `p-parameters`      | `PoDynamicFormField[]` | `[]`            | Parâmetros customizados (sobrescreve API) |
| `componentsSize` | `p-components-size` | `string`               | `'medium'`      | Tamanho dos componentes                   |

## Sub-componentes (Wizard Steps)

O wizard é composto por 3 etapas:

1. **Agendamento (Execution)** — Configuração de periodicidade
2. **Parâmetros (Parameters)** — Parâmetros do processo
3. **Resumo (Summary)** — Confirmação antes de salvar

## Endpoints da API

### Buscar Processos

```
GET {serviceApi}/processes
GET {serviceApi}/processes?search=texto  (filtro)
```

**Resposta:**

```json
{
  "items": [
    { "processID": "ac4f", "description": "Gerar folha de pagamento" },
    { "processID": "df6l", "description": "Relatório de impostos" }
  ]
}
```

### Buscar Parâmetros do Processo

```
GET {serviceApi}/processes/{processID}/parameters
```

**Resposta (usa interface PoDynamicFormField):**

```json
{
  "items": [
    { "property": "vencimento", "type": "date" },
    {
      "property": "imposto-retido",
      "label": "Imposto Retido",
      "type": "boolean"
    }
  ]
}
```

### Salvar Agendamento (Criar)

```
POST {serviceApi}
```

### Atualizar Agendamento

```
PUT {serviceApi}/{id}
```

### Carregar Agendamento Existente

```
GET {serviceApi}/{id}
```

## Payload de Agendamento (PoJobScheduler)

```json
{
  "firstExecution": "2024-12-07T00:00:01-03:00",
  "recurrent": true,
  "processID": "ac0405",
  "daily": { "hour": 10, "minute": 30 },
  "weekly": { "daysOfWeek": [1, 3, 5], "hour": 8, "minute": 0 },
  "monthly": { "day": 1, "hour": 10, "minute": 0 },
  "rangeExecutions": {
    "frequency": { "type": "hour", "value": 2 },
    "rangeLimit": { "hour": 18, "minute": 0, "day": 20 }
  },
  "executionParameter": { ... }
}
```

## Uso Básico

```html
<po-page-job-scheduler
  p-title="Agendamento de Processos"
  p-service-api="https://api.example.com/v1/jobs"
  [p-breadcrumb]="breadcrumb"
>
</po-page-job-scheduler>
```

## Uso com Parâmetros Customizados

Quando `p-parameters` é definido, o componente não busca processos/parâmetros na API:

```html
<po-page-job-scheduler
  p-service-api="https://api.example.com/v1/jobs"
  [p-parameters]="customParameters"
>
</po-page-job-scheduler>
```

```typescript
customParameters: PoDynamicFormField[] = [
  { property: 'filial', label: 'Filial', type: 'string', required: true },
  { property: 'dataInicio', label: 'Data Início', type: 'date' },
  { property: 'gerarPDF', label: 'Gerar PDF', type: 'boolean' }
];
```

## Uso via Rotas

```typescript
const routes: Routes = [
  {
    path: "job-scheduler",
    component: PoPageJobSchedulerComponent,
    data: {
      serviceApi: "https://api.example.com/v1/jobs",
    },
  },
  {
    path: "job-scheduler/edit/:id",
    component: PoPageJobSchedulerComponent,
    data: {
      serviceApi: "https://api.example.com/v1/jobs",
    },
  },
];
```
