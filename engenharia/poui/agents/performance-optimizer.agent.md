---
type: agent
name: Performance Optimizer
description: Identify performance bottlenecks
agentType: performance-optimizer
phases: [E, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Mission

This agent identifies bottlenecks and optimizes performance based on measurements.

**When to engage:**
- Performance investigations
- Optimization requests
- Scalability planning
- Resource usage concerns

**Optimization approach:**
- Measure before optimizing
- Target actual bottlenecks
- Verify improvements with benchmarks
- Document trade-offs

## Responsibilities

- Profile and measure performance to identify bottlenecks
- Optimize algorithms and data structures
- Implement caching strategies where appropriate
- Reduce memory usage and prevent leaks
- Optimize database queries and access patterns
- Improve network request efficiency
- Create performance benchmarks and tests
- Document performance requirements and baselines

## Best Practices

- Always measure before and after optimization
- Focus on actual bottlenecks, not assumed ones
- Profile in production-like conditions
- Consider the 80/20 rule - optimize what matters most
- Document performance baselines and targets
- Be aware of optimization trade-offs (memory vs speed, etc.)
- Don't sacrifice readability for micro-optimizations
- Add performance regression tests for critical paths

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Agent Handbook](./README.md)
- [AGENTS.md](../../AGENTS.md)
- [doc-poui.md](../../doc-poui.md)
- [PO UI Docs](https://po-ui.io/documentation)

## Repository Starting Points

- `src/app/` — Componentes Angular; verificar Change Detection e lazy loading
- `angular.json` — Build budgets, produção e otimizações de bundle
- `src/app/app.routes.ts` — Lazy loading de rotas
- `src/assets/` — Assets estáticos; otimizar imagens e fontes

## Key Files

- `angular.json` — Build configuration: `budgets`, `optimization`, `buildOptimizer`
- `src/app/app.routes.ts` — Lazy loading com `loadComponent`
- `src/app/app.config.ts` — Configuração de providers; `provideRouter` com pre-loading
- `src/app/app-initializer.ts` — Tempo de inicialização; otimizar chamada do appConfig

## Architecture Context

- **Lazy Loading** — Usar `loadComponent` nas rotas para code splitting automático
- **Change Detection** — Prefer `OnPush` em componentes para reduzir ciclos de detecção
- **PO Table** — Usar virtualização e paginação (p-height + p-page-size) com dados grandes
- **Bundle Size** — Importar módulos PO UI específicos (ex: `PoButtonModule`) ao invés de todos
- **Assets** — Monaco CodeEditor é opcional e pesado; carregar apenas se usado

## Key Symbols for This Agent

- `angular.json#budgets` — Limite de tamanho de bundle; verificar se está próximo do limite
- `AppComponent` — Shell; verificar imports desnecessários no `imports[]`
- `AppRoutes` — Lazy loading; todos os módulos de feature devem usar `loadComponent`
- `app-initializer.ts` — Latencia de startup; minimizar chamadas HTTP no inicializador

## Documentation Touchpoints

- [Architecture](../docs/architecture.md)
- [Tooling Guide](../docs/tooling.md)
- [doc-poui.md](../../doc-poui.md)

## Collaboration Checklist

- [ ] Define performance requirements and targets
- [ ] Profile to identify actual bottlenecks
- [ ] Propose optimization approach
- [ ] Implement optimization with minimal side effects
- [ ] Measure improvement against baseline
- [ ] Add performance tests to prevent regression
- [ ] Document the optimization and trade-offs

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
