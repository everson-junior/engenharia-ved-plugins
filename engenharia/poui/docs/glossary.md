---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Glossary & Domain Concepts

Terminologia específica do projeto PO UI / TOTVS Angular.

## Type Definitions

- **`PoMenuItem`** — Interface para itens de menu do `po-menu` (`label`, `link`, `icon`, `subItems`)
- **`PoChartSerie`** — Interface para séries de gráficos PO Chart (`label`, `data`, `type`, `color`)
- **`PoDatepickerRange`** — Interface com chaves `start` e `end` para seleção de período
- **`PoTableColumn`** — Define colunas da `po-table` (`property`, `label`, `type`, `visible`)
- **`PoPageAction`** — Ações de barras de páginas PO (`label`, `action`, `icon`, `disabled`)

## Enumerations

- **`PoChartType`** — Tipos de gráfico: `Bar`, `Column`, `Line`, `Pie`, `Donut`, `Gauge`
- **`PoToggle`** — Modo de seleção para `po-button-group`: `single`, `multiple`, `none`

## Core Terms

**PO UI**: Design system open-source da TOTVS para Angular. Fornece componentes, templates e guias de estilo para sistemas empresariais.

**Protheus**: ERP da TOTVS. A app pode rodar dentro do Protheus (iframe) ou standalone.

**insideProtheus**: Flag booleana em `sessionStorage` indicando contexto do ERP Protheus.

**PoHttpInterceptor**: Interceptor HTTP do PO UI que exibe notificações toast automáticas e gerencia screen-lock.

**Screen Lock**: Overlay de carregamento ativado com o header `X-PO-Screen-Lock: true`.

**Animalia Icons**: Biblioteca de ícones atual do PO UI. Prefixo: `an an-[nome]`. Substitui Polcon.

**Polcon**: Biblioteca de ícones legada. **Depreciada**, será removida na v20.

**LibCoreDevModule**: Módulo barrel deste projeto; centraliza imports PO UI comuns.

**APP_INITIALIZER**: Token Angular; executa código antes do bootstrap; carrega `appConfig.json`.

## Acronyms & Abbreviations

| Acronym | Expansion | Context |
|---------|-----------|---------|
| PO | Portal TOTVS / PO UI | Design system Angular da TOTVS |
| ERP | Enterprise Resource Planning | Sistema Protheus |
| SPA | Single Page Application | Arquitetura Angular |
| WCAG | Web Content Accessibility Guidelines | Padrões de acessibilidade |
| AA | Accessibility Level AA | Habilita `p-size="small"` no PO UI |
| DI | Dependency Injection | Mecanismo Angular |

## Personas / Actors

- **Desenvolvedor TOTVS**: Cria telas para integrar com o ERP Protheus usando PO UI
- **Usuário Final**: Acessa a app dentro do Protheus (iframe) ou via browser diretamente

## Domain Rules & Invariants

- Todo campo PO UI com `[(ngModel)]` **deve** ter atributo `name`
- Ícones sem label visual **devem** ter `p-aria-label`
- `p-size="small"` só é efetivo com tema AA ativado
- Usar `Animalia Icons` (`an an-*`); **nunca** usar Polcon em novos códigos
- `po-navbar` está depreciado; usar `po-header`
- `po-gauge` (standalone) está depreciado; usar `po-chart` com `type: Gauge`

## Related Resources

- [project-overview.md](./project-overview.md)
- [doc-poui.md](../../doc-poui.md)
- [PO UI Docs](https://po-ui.io/documentation)
