---
type: skill
name: Feature Breakdown
description: Break down features into implementable tasks
skillSlug: feature-breakdown
phases: [P]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Feature Breakdown Skill — PO UI Angular

## When to Use

Use ao planejar a implementação de uma nova feature em Angular com PO UI.

## Instructions

### 1. Entender o Requisito

- Qual página PO UI será usada? (`po-page-default`, `po-page-list`, `po-page-detail`, `po-page-edit`)
- Quais componentes PO UI são necessários?
- Precisa de integração com API REST?
- A funcionalidade deve rodar fora e dentro do Protheus?

### 2. Template de Breakdown

```markdown
## Feature: [Nome da Feature]

### Tasks

1. **Criar rota lazy** em `app.routes.ts`
   - Definir path e `loadComponent`
   - Adicionar item ao menu em `AppComponent`

2. **Criar componente standalone**
   - `ng generate component feature/minha-feature`
   - Configurar `standalone: true` e imports PO UI

3. **Implementar template PO UI**
   - Selecionar template de página: `po-page-default` / `po-page-list`
   - Adicionar ações (`p-actions`) e título (`p-title`)
   - Usar grid system (`po-row`, `po-md-*`) para layout

4. **Formulário (se aplicável)**
   - Todos os campos com `name` e `[(ngModel)]`
   - Validar com `p-required`, `p-error-message`

5. **Integração HTTP (se aplicável)**
   - Criar serviço com `HttpClient`
   - Configurar URL em `environment.ts`
   - `X-PO-Screen-Lock: 'true'` para requisições longas

6. **Testes**
   - Criar `*.spec.ts` com TestBed
   - Mockar `ProAppConfigService` e dependencias HTTP

7. **Acessibilidade**
   - Ícones sem texto com `p-aria-label`
   - Ícones usando Animalia (`an an-*`)
```

### 3. Componentes PO UI por Tipo de Tela

| Tipo de Tela | Componente Principal | Imports |
|---|---|---|
| Listagem | `po-page-list` + `po-table` | `PoPageModule`, `PoTableModule` |
| Detalhe | `po-page-detail` | `PoPageModule` |
| Formulário | `po-page-edit` + campos | `PoPageModule`, `PoFieldModule` |
| Dashboard | `po-page-default` + `po-chart` | `PoPageModule`, `PoChartModule` |
| Login | `po-page-login` | `PoTemplatesModule` |