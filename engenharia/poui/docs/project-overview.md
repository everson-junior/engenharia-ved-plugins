---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

## Project Overview

Este projeto é um **template/configurador de aplicações Angular com PO UI** 'nome-do-projeto'. Fornece uma estrutura base para desenvolver sistemas empresariais integrados ao ecossistema TOTVS/Protheus usando o design system PO UI.

A base de código é organizada para suportar o desenvolvimento de interfaces TOTVS com foco em acessibilidade, identidade visual corporativa e integração com o ERP Protheus.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- **Root**: `./`
- **Primary Language**: TypeScript (Angular 19)
- **Entry Point**: `src/main.ts`
- **Full Analysis**: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- **Main Entry**: `src/main.ts` — Bootstrap Angular standalone
- **App Config**: `src/app/app.config.ts` — Providers (HttpClient, Router, Interceptors)
- **App Routes**: `src/app/app.routes.ts` — Roteamento lazy loading
- **Initializer**: `src/app/app-initializer.ts` — Carrega `appConfig.json` antes da inicialização

## Key Exports

- `AppComponent` — Shell com `PoToolbar`, `PoMenu` e `RouterOutlet`
- `HomeComponent` — Página inicial de referência com componentes PO UI
- `LibCoreDevModule` — Módulo barrel de imports PO UI compartilhados
- `LibCoreDevInterceptorService` — Interceptor HTTP baseado em `PoHttpInterceptor`

## File Structure & Code Organization

- `src/app/` — Componentes, módulos, serviços e rotas Angular
- `src/app/home/` — Página inicial (padrão de referência)
- `src/app/modules/lib-core-dev/` — Módulo compartilhado barrel dos imports PO UI
- `src/app/services/` — Interceptors e serviços HTTP
- `src/assets/data/` — Configuração estática (appConfig.json)
- `src/environments/` — Configurações por ambiente (dev, local, prod)
- `.context/` — Contexto AI: docs, agents, skills

## Technology Stack Summary

**Runtime**: Node.js 18+

**Language**: TypeScript 5.7

**Build Tools**:

- Angular CLI 19 (`ng build`, `ng serve`, `ng test`)
- Package manager: npm

**Code Quality**:

- Testes: Karma + Jasmine
- Type checking: TypeScript strict mode

## Core Framework Stack

- **Frontend**: Angular 19 (standalone components API)
- **Design System**: PO UI v19 (`@po-ui/ng-components`, `@po-ui/ng-templates`)
- **Tema**: `@totvs/po-theme` — identidade visual TOTVS
- **Integração ERP**: `@totvs/protheus-lib-core` — detecção de contexto dentro do Protheus
- **HTTP**: Angular `HttpClient` + `PoHttpInterceptor` para notificações automáticas

## UI & Interaction Libraries

- **PO UI Components** (`@po-ui/ng-components`): Todos os componentes UI: `po-page-*`, `po-table`, `po-button`, `po-input`, campos de formulário, etc.
- **PO UI Templates** (`@po-ui/ng-templates`): Templates de páginas prontos: login, blocked-user, change-password, etc.
- **Animalia Icons**: Biblioteca de ícones atual; sintaxe `an an-icon-name` (Polcon está depreciado)
- **Grid System**: Classes `po-md-*`, `po-sm-*`, `po-lg-*` para responsividade
- **Acessibilidade**: WCAG 2.1 AA; `p-aria-label` obrigatório em ícones sem label

## Development Tools Overview

See [Tooling](./tooling.md) for detailed development environment setup.

**Essential Commands**:

- `npm install` — Install dependencies
- `npm run build` — Build the project
- `npm run test` — Run tests
- `npm run dev` — Start development mode

## Getting Started Checklist

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment template: `cp .env.example .env` (if applicable)
4. Run tests to verify setup: `npm run test`
5. Start development: `npm run dev`
6. Review [Development Workflow](./development-workflow.md) for day-to-day tasks

## Next Steps

- Review [Architecture](./architecture.md) for system design details
- See [Development Workflow](./development-workflow.md) for contribution guidelines
- Check [Testing Strategy](./testing-strategy.md) for quality requirements

## Related Resources

<!-- Link to related documents for cross-navigation. -->

- [architecture.md](./architecture.md)
- [development-workflow.md](./development-workflow.md)
- [tooling.md](./tooling.md)
- [codebase-map.json](./codebase-map.json)
