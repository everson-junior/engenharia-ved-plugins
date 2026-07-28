---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Testing Strategy

Estratégia de testes para o projeto `poui-skill-config` (Angular 19 + Karma + Jasmine).

**Filosofia**:
- Testes rápidos, isolados e determinísticos
- Pirâmide: muitos unitários, poucos de integração, nenhum E2E por enquanto
- Testar comportamento, não detalhes de implementação
- Todo bug fix deve incluir um teste de regressão

## Test Types

**Unit Tests (Karma + Jasmine)**:
- Framework: Karma + Jasmine (Angular CLI default)
- Localização: `*.spec.ts` co-localizados com os componentes/serviços
- Propósito: Testar componentes e serviços em isolamento
- Mocking: `spyOn()`, `jasmine.createSpy()`, `HttpClientTestingModule`

## Padrões de Teste Angular/PO UI

**Componente Standalone com PO UI**:
```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [
      MyComponent,          // standalone component
      PoPageModule,         // módulos PO UI usados pelo componente
      HttpClientTestingModule,
    ],
    providers: [
      { provide: ProAppConfigService, useValue: { insideProtheus: () => false } }
    ]
  }).compileComponents();
});
```

**Testando Interceptor HTTP**:
```typescript
it('should add X-PO-Screen-Lock header', () => {
  service.getData().subscribe();
  const req = httpMock.expectOne('/api/data');
  expect(req.request.headers.get('X-PO-Screen-Lock')).toBe('true');
});
```

## Running Tests

```bash
# Executar todos os testes (modo watch)
npm test

# Para CI (sem watch, Chrome Headless)
ng test --watch=false --browsers=ChromeHeadless

# Com coverage
ng test --watch=false --code-coverage
```

## Quality Gates

**Requisitos de Coverage**:
- Cobertura mínima: Não definida formalmente; buscar 70%+ em novos códigos
- Caminhos críticos (inicializador, interceptor) devem ter cobertura alta

**Pre-merge Checks**:
- [ ] Todos os testes passam (`ng test --watch=false`)
- [ ] Build de produção funciona (`ng build`)
- [ ] CI Drone pipeline verde

## Troubleshooting

**PO UI component not found in test**:
- Adicionar o módulo PO UI ao `imports` do `TestBed`
- Ex: `PoButtonModule`, `PoPageModule` no array de imports

**ProAppConfigService injection error**:
- Mockar via `providers`: `{ provide: ProAppConfigService, useValue: { insideProtheus: () => false } }`

**HttpClient not found**:
- Adicionar `HttpClientTestingModule` ao `imports`

## Related Resources

- [development-workflow.md](./development-workflow.md)
- [doc-poui.md](../../doc-poui.md)
