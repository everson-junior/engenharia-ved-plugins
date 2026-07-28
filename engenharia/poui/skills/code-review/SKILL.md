---
type: skill
name: Code Review
description: Review code quality, patterns, and best practices
skillSlug: code-review
phases: [R, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Code Review Skill — PO UI Angular

## When to Use

Use esta skill ao revisar PRs ou alteracões de código em projetos Angular com PO UI.

## Instructions

### 1. Verificar Conformidade PO UI
- [ ] Componentes PO UI usam propriedades com prefixo `p-` correto (ex: `p-label`, `p-placeholder`)
- [ ] Módulos PO UI importados corretamente no componente standalone
- [ ] Não usa `po-navbar` (depreciado); usar `po-header`
- [ ] Não usa `po-gauge` standalone (depreciado); usar `po-chart` com `type: Gauge`
- [ ] Ícones usando Animalia (`an an-*`); sem Polcon depreciado

### 2. Verificar Formulários
- [ ] Todos os campos de input com `[(ngModel)]` têm atributo `name`
- [ ] Campos obrigatórios com `p-required="true"`
- [ ] Validações de formulário com mensagens de erro via `p-error-message`

### 3. Verificar Acessibilidade
- [ ] Ícones sem texto visível têm `p-aria-label`
- [ ] Contraste de cores adequado (mínimo 4.5:1)
- [ ] `p-size="small"` usado apenas quando tema AA está ativo

### 4. Verificar Angular Standalone
- [ ] Componentes com `standalone: true`
- [ ] Imports corretos no array `imports[]` do componente
- [ ] Lazy loading com `loadComponent` nas rotas

### 5. Verificar HTTP
- [ ] `PoHttpInterceptor` usado para notificações automáticas
- [ ] Header `X-PO-Screen-Lock: 'true'` em requisições que bloqueiam a tela
- [ ] Não usa `po-loading` manual quando o interceptor pode gerenciar

### 6. Qualidade Geral
- [ ] Testes unitários atualizados para novas funcionalidades
- [ ] Sem código comentado ou console.log em produção
- [ ] Tipos TypeScript definidos (sem `any` desnecessário)

## Examples

```typescript
// ERRADO: sem name, ícone Polcon
<po-input [(ngModel)]="name" p-icon="po-icon-user"></po-input>

// CORRETO: com name, ícone Animalia
<po-input name="name" [(ngModel)]="name" p-icon="an an-user"></po-input>

// ERRADO: icone sem aria-label
<po-button p-icon="an an-delete"></po-button>

// CORRETO:
<po-button p-icon="an an-delete" p-aria-label="Excluir"></po-button>
```