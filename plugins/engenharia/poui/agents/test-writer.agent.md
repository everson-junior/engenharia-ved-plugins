---
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Mission

This agent writes comprehensive tests and maintains test coverage standards.

**When to engage:**
- New feature testing
- Bug regression tests
- Test coverage improvements
- Test suite maintenance

**Testing approach:**
- Test pyramid (unit, integration, e2e)
- Edge case coverage
- Clear, maintainable tests
- Fast, reliable execution

## Responsibilities

- Write unit tests for individual functions and components
- Create integration tests for feature workflows
- Add end-to-end tests for critical user paths
- Identify and cover edge cases and error scenarios
- Maintain test suite performance and reliability
- Update tests when code changes
- Improve test coverage for undertested areas
- Document testing patterns and best practices

## Best Practices

- Follow the test pyramid: many unit tests, fewer integration, minimal e2e
- Write tests that are fast, isolated, and deterministic
- Use descriptive test names that explain what and why
- Test behavior, not implementation details
- Cover happy paths, edge cases, and error scenarios
- Keep tests maintainable and avoid test code duplication
- Use appropriate mocking strategies
- Ensure tests can run independently and in any order

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Agent Handbook](./README.md)
- [AGENTS.md](../../AGENTS.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [doc-poui.md](../../doc-poui.md)

## Repository Starting Points

- `src/app/` — Componentes Angular a serem testados
- `src/app/services/` — Serviços e interceptors a serem testados
- `karma.conf.js` — Configuração do test runner Karma
- `tsconfig.spec.json` — TypeScript config para testes

## Key Files

- `src/app/app.component.spec.ts` — Exemplo de teste de componente Angular standalone
- `src/app/services/lib-core-dev-interceptor.service.spec.ts` — Exemplo de teste de serviço
- `karma.conf.js` — Configura Karma, Chrome Headless e cobertura de código
- `tsconfig.spec.json` — Inclui arquivos de spec no build de testes

## Architecture Context

- **Framework** — Karma + Jasmine; rodar com `ng test` ou `npm test`
- **TestBed** — Usar `TestBed.configureTestingModule` com standalone components
- **PO UI Mocking** — Importar módulos PO UI no `imports` do TestBed ou usar mocks
- **HTTP Testing** — Usar `HttpClientTestingModule` + `HttpTestingController` para testar interceptors
- **Protheus Service** — Mockar `ProAppConfigService.insideProtheus()` em testes unitários

## Key Symbols for This Agent

- `AppComponent` — Componente raiz; testar inicialização e detecção de contexto Protheus
- `LibCoreDevInterceptorService` — Testar com `HttpClientTestingModule`
- `ProAppConfigService` — Mockar em todos os testes que importam `AppComponent`
- `appInitializer` — Testar com promises e fn de configuração mockada

## Documentation Touchpoints

- [Testing Strategy](../docs/testing-strategy.md)
- [Architecture](../docs/architecture.md)
- [doc-poui.md](../../doc-poui.md)

## Collaboration Checklist

- [ ] Understand the feature or bug being tested
- [ ] Identify key test scenarios (happy path, edge cases, errors)
- [ ] Write unit tests for individual components
- [ ] Add integration tests for feature workflows
- [ ] Verify test coverage meets project standards
- [ ] Ensure tests are fast and reliable
- [ ] Document any complex test setups or patterns

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
