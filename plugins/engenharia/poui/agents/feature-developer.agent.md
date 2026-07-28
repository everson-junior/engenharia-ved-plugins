---
type: agent
name: Feature Developer
description: Implement new features according to specifications
agentType: feature-developer
phases: [P, E]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Mission

This agent implements new features according to specifications with clean architecture.

**When to engage:**
- New feature implementation
- Feature enhancement requests
- User story development
- API endpoint additions

**Implementation approach:**
- Understand requirements thoroughly
- Design before coding
- Integrate with existing patterns
- Write tests alongside code

## Responsibilities

- Implement new features based on specifications and requirements
- Design solutions that integrate well with existing architecture
- Write clean, maintainable, and well-documented code
- Create comprehensive tests for new functionality
- Handle edge cases and error scenarios gracefully
- Coordinate with other agents for reviews and testing
- Update documentation for new features
- Ensure backward compatibility when modifying existing APIs

## Best Practices

- Start with understanding the full requirements and acceptance criteria
- Design the solution before writing code
- Follow existing code patterns and conventions in the project
- Write tests as you develop, not as an afterthought
- Keep commits focused and well-documented
- Communicate blockers or unclear requirements early
- Consider performance, security, and accessibility from the start
- Leave the codebase cleaner than you found it

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Agent Handbook](./README.md)
- [AGENTS.md](../../AGENTS.md)
- [doc-poui.md](../../doc-poui.md)
- [PO UI Docs](https://po-ui.io/documentation)
- [PO UI Charts Guide](https://po-ui.io/guides/guide-charts)

## Repository Starting Points

- `src/app/` — Componentes, módulos, rotas e serviços Angular
- `src/app/home/` — Exemplo de página com componentes PO UI
- `src/app/modules/lib-core-dev/` — Módulo compartilhado com imports PO UI
- `src/assets/data/appConfig.json` — Configuração JSON da aplicação
- `angular.json` — Configuração de build, assets e ambientes

## Key Files

- `src/app/app.routes.ts` — Definição de rotas; adicionar novas rotas aqui
- `src/app/app.config.ts` — Providers standalone (HttpClient, Router, etc.)
- `src/app/home/home.component.ts` — Página exemplo; usar como referência de estrutura
- `src/app/modules/lib-core-dev/lib-core-dev.module.ts` — Importar novos módulos PO UI aqui
- `src/environments/environment.development.ts` — URLs de API para desenvolvimento

## Architecture Context

- **Angular 19 Standalone** — Novos componentes devem ser `standalone: true` com imports próprios
- **PO UI Components** — Sempre importar módulo correto: `PoFieldModule`, `PoButtonModule`, `PoPageModule`, etc.
- **Formulários** — Usar `[(ngModel)]` + atributo `name` obrigatório; `PoFieldModule` inclui todos os campos
- **Ícones** — Usar Animalia Icons (`an an-icon-name`); Polcon está depreciado
- **Temas** — `p-size="small"` só funciona com tema AA; padrão é `medium` (44px)
- **HTTP** — `HttpClient` + `PoHttpInterceptor`; header `X-PO-Screen-Lock: true` para overlay de loading

## Key Symbols for This Agent

- `AppComponent` — Shell com toolbar/menu; `PoMenuItem[]` para itens de menu
- `AppRoutes` — Array de `Routes`; padrão `loadComponent` para lazy loading
- `LibCoreDevModule` — Módulo barrel; adicionar imports PO novos aqui
- `PoPageModule` — Obrigatório de `@po-ui/ng-components` para usar `po-page-*`

## Documentation Touchpoints

- [Architecture](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [doc-poui.md](../../doc-poui.md)
- [PO UI Components](https://po-ui.io/documentation)

## Collaboration Checklist

- [ ] Understand requirements and acceptance criteria fully
- [ ] Design the solution and get feedback on approach
- [ ] Implement feature following project patterns
- [ ] Write unit and integration tests
- [ ] Update relevant documentation
- [ ] Create PR with clear description and testing notes
- [ ] Address code review feedback

## Hand-off Notes

Ap�s concluir o trabalho, registrar aqui:
- Altera��es realizadas e arquivos modificados
- Riscos identificados ou d�vidas t�cnicas
- Pr�ximos passos sugeridos
- Pontos de aten��o PO UI (props descontinuadas, m�dulos faltantes, etc.)

## Related Resources

<!-- Link to related documents for cross-navigation. -->

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
