---
type: skill
name: Test Generation
description: Generate comprehensive test cases for code
skillSlug: test-generation
phases: [E, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Test Generation Skill — Angular/PO UI

## When to Use

Use ao criar ou atualizar testes unitários Karma/Jasmine para componentes e serviços Angular com PO UI.

## Instructions

### 1. Setup do TestBed para Componente Standalone com PO UI

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProAppConfigService } from '@totvs/protheus-lib-core';
// importe os módulos PO UI utilizados pelo componente
import { PoPageModule, PoButtonModule } from '@po-ui/ng-components';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyComponent,            // standalone
        PoPageModule,
        PoButtonModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ProAppConfigService, useValue: { insideProtheus: () => false } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 2. Testando Interceptor HTTP

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LibCoreDevInterceptorService } from './lib-core-dev-interceptor.service';

describe('LibCoreDevInterceptorService', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LibCoreDevInterceptorService,
        { provide: HTTP_INTERCEPTORS, useClass: LibCoreDevInterceptorService, multi: true },
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());
});
```

### 3. Cenários a Cobrir

- [ ] Criação do componente (`should create`)
- [ ] Renderização de elementos PO UI no template
- [ ] Eventos de usuário (clique em `po-button`, submit de `po-input`)
- [ ] Estado inicial e mudanças de estado
- [ ] Chamadas HTTP e respostas mockadas
- [ ] Contexto Protheus (dentro/fora)

## Examples

```typescript
it('should detect insideProtheus as false when not in ERP', () => {
  expect(sessionStorage.getItem('insideProtheus')).toBe('0');
});

it('should render po-page title', () => {
  const compiled = fixture.nativeElement;
  expect(compiled.querySelector('po-page-default')).toBeTruthy();
});
```