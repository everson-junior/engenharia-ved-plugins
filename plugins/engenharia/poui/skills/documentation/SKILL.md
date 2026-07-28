---
type: skill
name: Documentation
description: Generate and update technical documentation
skillSlug: documentation
phases: [P, C]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Documentation Skill — PO UI Angular

## When to Use

Use ao criar ou atualizar documentação técnica de componentes, serviços ou features PO UI.

## Instructions

### 1. Documentar Componente PO UI

Sempre incluir:
- **Propósito**: O que o componente faz
- **Módulos importados**: Qual `Po*Module` é necessário
- **Propriedades (`p-*`)**: Validar nomes exatos em https://po-ui.io/documentation
- **Eventos (`(p-event)`)**: Descrever o que dispara o evento e o tipo retornado
- **Exemplo completo**: TypeScript + HTML funcíonal

### 2. Formato Padrão de Documentação

```markdown
## [NomeDoComponente]

**Módulo**: `PoXxxModule` de `@po-ui/ng-components`

**Quando usar**: [descrição do caso de uso]

### Propriedades Principais

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|:-----------:|-----------|
| `p-label` | `string` | Não | Rótulo do campo |
| `name` | `string` | **Sim** | Atributo requerido para ngModel |

### Exemplo

```typescript
// component.ts
import { PoInputModule } from '@po-ui/ng-components';

@Component({
  imports: [PoInputModule, FormsModule],
  template: `
    <po-input
      name="nome"
      p-label="Nome"
      [(ngModel)]="nome">
    </po-input>
  `
})
export class MeuComponent {
  nome = '';
}
```
```

### 3. Atualizar .context

Após criar documentação:
- [ ] Adicionar link em `.context/docs/README.md` se for um Core Guide novo
- [ ] Atualizar `.context/agents/README.md` se for um agente novo
- [ ] Atualizar `.context/skills/README.md` se for uma skill nova

## Examples

**Documentação de serviço HTTP**:
```markdown
## LibCoreDevInterceptorService

Interceptor HTTP que estende `PoHttpInterceptor`.
Adiciona notificações toast automáticas para erros e sucessos.

**Header para Screen Lock**: `X-PO-Screen-Lock: 'true'`
```