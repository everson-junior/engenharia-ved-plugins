---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

## Development Workflow

Processo de engenharia para o projeto 'nome-do-projeto' (Angular 19 + PO UI + TOTVS).

## Branching & Releases

**Branching Model**: Feature branches off `main`

- `main` — Código pronto para produção
- `feature/*` — Novas funcionalidades e melhorias
- `fix/*` — Correções de bugs
- `chore/*` — Manutenção, atualizacões de dependências

**Release Process**:

1. Desenvolver em branches
2. PR com revisão e CI passando
3. Merge em `main` dispara build de produção

**Versioning**: Semantic versioning (semver) - MAJOR.MINOR.PATCH

**Commit Messages**: Conventional Commits

```
feat(home): adiciona tabela po-table com paginacao
fix(interceptor): corrige header X-PO-Screen-Lock
chore(deps): atualiza @po-ui/ng-components para 19.40.0
```

## Local Development

```bash
# Clone e instalar
git clone <repository-url>
cd 'nome-do-projeto'
npm install

# Desenvolvimento (hot reload em http://localhost:4200)
npm start

# Build de produção
npm run build

# Testes (modo watch)
npm test
```

**Antes de commitar**:

```bash
npm test -- --watch=false && npm run build
```

## PO UI Development Guidelines

**Novos Componentes PO UI**:

1. Consultar https://po-ui.io/documentation para propriedades
2. Importar módulo correto: `PoButtonModule`, `PoPageModule`, `PoFieldModule`, etc.
3. Campos de formulário **sempre** com `[(ngModel)]` e atributo `name`
4. Ícones: usar `an an-[nome]` (Animalia); não usar Polcon
5. Acessibilidade: `p-aria-label` em ícones sem texto visível

**Estrutura de Componente Standalone**:

```typescript
@Component({
  selector: "app-my-page",
  standalone: true,
  imports: [PoPageModule, PoTableModule, PoButtonModule],
  templateUrl: "./my-page.component.html",
})
export class MyPageComponent {}
```

## Code Review Expectations

**PR Requirements**:

- Descrição clara das mudanças
- Testes para nova funcionalidade
- Ícones usando Animalia (não Polcon)
- CI passando (`ng test --watch=false` + `ng build`)

**Review Checklist - PO UI**:

- [ ] Propriedades PO UI com prefixo `p-` correto
- [ ] Campos de formulário com `name` attribute
- [ ] Ícones Animalia (`an an-*`); sem Polcon
- [ ] Acessibilidade: `p-aria-label` onde necessário
- [ ] Módulos PO UI importados corretamente no componente standalone
- [ ] Testes unitários atualizados

## Onboarding Tasks

1. Ler o [Project Overview](./project-overview.md)
2. Ler o [doc-poui.md](../../doc-poui.md)
3. Configurar ambiente local: `npm install && npm start`
4. Explorar `src/app/home/` como exemplo de página PO UI
5. Consultar https://po-ui.io/documentation

## Related Resources

- [testing-strategy.md](./testing-strategy.md)
- [tooling.md](./tooling.md)
- [doc-poui.md](../../doc-poui.md)
