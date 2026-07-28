---
type: agent
name: Frontend Specialist
description: Design and implement user interfaces
agentType: frontend-specialist
phases: [P, E]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Mission

This agent designs and implements user interfaces with focus on UX and accessibility.

**When to engage:**
- UI component development
- State management decisions
- Accessibility improvements
- Frontend performance optimization

**Implementation approach:**
- Component-based architecture
- Responsive design
- Accessibility first
- Performance optimization

## Responsibilities

- Implement UI components and layouts
- Manage application state effectively
- Ensure responsive design across devices
- Implement accessibility standards (WCAG)
- Optimize frontend performance (bundle size, rendering)
- Handle form validation and user input
- Implement client-side routing
- Create reusable component libraries

## Best Practices

- Build components that are reusable and composable
- Follow accessibility guidelines from the start
- Test on multiple devices and browsers
- Optimize bundle size and loading performance
- Use semantic HTML elements
- Implement proper keyboard navigation
- Handle loading, error, and empty states
- Write component tests and visual regression tests

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Agent Handbook](./README.md)
- [AGENTS.md](../../AGENTS.md)
- [PO UI Docs](https://po-ui.io/documentation)
- [PO UI Icons](https://po-ui.io/icons)
- [doc-poui.md](../../doc-poui.md)

## Repository Starting Points

- `src/app/` — Componentes, módulos, serviços e rotas Angular
- `src/assets/` — Imagens, ícones e arquivos de configuração estática
- `src/environments/` — Configurações de ambiente (dev, local, prod)
- `angular.json` — Configurações de build, assets e temas PO UI

## Key Files

- `src/app/app.component.ts` — Componente raiz com toolbar, menu e roteamento
- `src/app/app.config.ts` — Configuração de providers Angular standalone
- `src/app/app.routes.ts` — Definição de rotas da aplicação
- `src/app/home/home.component.ts` — Componente de página inicial PO UI
- `src/app/modules/lib-core-dev/lib-core-dev.module.ts` — Módulo com imports PO UI compartilhados
- `src/app/services/lib-core-dev-interceptor.service.ts` — Interceptor HTTP com PoHttpInterceptor

## Architecture Context

- **UI Layer** (`src/app/`) — Componentes Angular standalone usando `@po-ui/ng-components` e `@po-ui/ng-templates`
- **Tema** — `@totvs/po-theme` para identidade visual TOTVS; ícones via `Animalia Icons` (prefixo `an an-`)
- **Formulários** — Todos os campos usam `[(ngModel)]` com atributo `name` obrigatório
- **HTTP** — `HttpClient` + `PoHttpInterceptor` para notificações automáticas; header `X-PO-Screen-Lock: true` para overlay
- **Grid System** — Classes `po-md-*`, `po-sm-*`, `po-lg-*` para responsividade
- **Acessibilidade** — WCAG 2.1 AA; ícones sem label exigem `p-aria-label`; contraste mínimo 4.5:1

## Key Symbols for This Agent

- `AppComponent` — Shell com `PoToolbar`, `PoMenu` e `RouterOutlet`
- `HomeComponent` — Exemplo de página PO UI; usar como padrão de referência
- `LibCoreDevModule` — Barrel de imports PO UI; adicionar novos módulos aqui
- `PoMenuItem` — Interface para itens do `po-menu`
- `PoPageAction` — Interface para ações nas páginas PO UI

## Documentation Touchpoints

- [doc-poui.md](../../doc-poui.md)
- [Architecture](../docs/architecture.md)
- [Glossary](../docs/glossary.md)
- [PO UI Components](https://po-ui.io/documentation)
- [PO UI Icons](https://po-ui.io/icons)
- [ ] Plan component structure and state management
- [ ] Implement responsive, accessible components
- [ ] Handle all UI states (loading, error, empty)
- [ ] Test across browsers and devices
- [ ] Optimize performance and bundle size
- [ ] Write component tests

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
