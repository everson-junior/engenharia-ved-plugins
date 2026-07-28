---
type: skill
name: Refactoring
description: Safe code refactoring with step-by-step approach
skillSlug: refactoring
phases: [E]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Refactoring Skill — PO UI Angular

## When to Use

Use ao refatorar código Angular/PO UI sem alterar comportamento.

## Instructions

### Etapas Obrigatórias

1. **Verificar cobertura de testes existente** antes de qualquer alteração
2. **Fazer uma alteração por vez** (renomear, extrair, mover)
3. **Executar testes após cada passo**: `ng test --watch=false`
4. **Commitar incrementalmente** com mensagens descritivas

### Refatorações Comuns PO UI

**Migração Polcon → Animalia Icons**:
```html
<!-- ANTES (depreciado) -->
<po-button p-icon="po-icon-user"></po-button>

<!-- DEPOIS (Animalia) -->
<po-button p-icon="an an-user" p-aria-label="Usuário"></po-button>
```

**Migração NgModule → Standalone**:
```typescript
// ANTES
@NgModule({
  declarations: [MyComponent],
  imports: [PoPageModule]
})
export class MyModule {}

// DEPOIS
@Component({
  standalone: true,
  imports: [PoPageModule],
  ...
})
export class MyComponent {}
```

**Migração po-navbar → po-header**:
```html
<!-- ANTES (depreciado) -->
<po-navbar p-title="App"></po-navbar>

<!-- DEPOIS -->
<po-header p-title="App"></po-header>
```

**Extraindo lógica para serviço**:
- Mover lógica HTTP de componentes para serviços `@Injectable`
- Usar `PoHttpInterceptor` ao invés de lógica manual de loading

### Passos de Validação

- [ ] Testes passam antes e depois da refatoração
- [ ] Build de produção sem novos erros
- [ ] Comportamento visual inalterado no browser