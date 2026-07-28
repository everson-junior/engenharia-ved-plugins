---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Tooling & Productivity Guide

Ferramentas, scripts e configurações para o projeto `poui-skill-config` (Angular 19 + PO UI).

## Required Tooling

**Runtime**:
- Node.js 18+ (LTS recomendado)
- npm (incluso com Node.js)
- Angular CLI 19: `npm install -g @angular/cli`

**Instalação**:
```bash
git clone <repository-url>
cd poui-skill-config
npm install
```

## Scripts Disponíveis

```bash
npm start          # ng serve  — Servidor de desenvolvimento em http://localhost:4200
npm run build      # ng build  — Build de produção em dist/
npm test           # ng test   — Karma + Jasmine (modo watch)
npm run watch      # ng build --watch --configuration development
```

**Para CI/CD (sem watch)**:
```bash
ng test --watch=false --browsers=ChromeHeadless
ng build --configuration production
```

## IDE / Editor Setup

**VS Code Extensões Recomendadas**:
- **Angular Language Service** — IntelliSense para templates Angular
- **GitHub Copilot** — Assistente AI; configurado para PO UI via `.context/`
- **ESLint** — Linting inline
- **EditorConfig** — Padronização de formatação (`.editorconfig` presente)

**Configurações VS Code** (`.vscode/`):
- `settings.json` — Configurações do editor para o workspace
- `extensions.json` — Extensões recomendadas

## PO UI Development Tips

**Consultar documentação**:
- Components: https://po-ui.io/documentation
- Ícones: https://po-ui.io/icons
- Charts: https://po-ui.io/guides/guide-charts

**Verificar imports PO UI no componente**:
```typescript
imports: [
  PoPageModule,      // po-page-default, po-page-list, etc.
  PoButtonModule,    // po-button
  PoTableModule,     // po-table
  PoFieldModule,     // todos os campos de form
  FormsModule,       // [(ngModel)]
]
```

**Ícones Animalia** (usar em vez de Polcon):
```html
<po-button p-icon="an an-user" p-aria-label="Usuário"></po-button>
```

## Karma / Jasmine (Testes)

- Configuração: `karma.conf.js`
- Spec files: `*.spec.ts` co-localizados com os componentes
- Coverage: gerado em `coverage/` (configurado no `karma.conf.js`)

## Related Resources

- [development-workflow.md](./development-workflow.md)
- [doc-poui.md](../../doc-poui.md)
- [PO UI Docs](https://po-ui.io/documentation)
