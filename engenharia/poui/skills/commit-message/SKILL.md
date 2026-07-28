---
type: skill
name: Commit Message
description: Generate commit messages following conventional commits with scope detection
skillSlug: commit-message
phases: [E, C]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Commit Message Skill

## When to Use

Use esta skill ao finalizar uma alteração de código e precisar gerar uma mensagem de commit Conventional Commits.

## Instructions

1. Identifique o tipo de alteração:
   - `feat` — Nova funcionalidade
   - `fix` — Correção de bug
   - `chore` — Manutenção, atualização de dependências
   - `docs` — Documentação
   - `refactor` — Refatoração sem mudança de comportamento
   - `test` — Agregação ou correção de testes
   - `style` — Formatação de código (sem mudança funcional)

2. Identifique o **escopo** (opcional) baseado no componente ou módulo alterado:
   - `(home)`, `(interceptor)`, `(menu)`, `(toolbar)`, `(table)`, `(form)`, `(chart)`, `(deps)`, `(config)`, `(ci)`

3. Escreva a mensagem no imperativo, em minúsculas, máximo 72 caracteres na linha de assunto.

4. Adicione corpo detalhado se necessário (PO UI properties alteradas, breaking changes).

## Examples

```
feat(home): adiciona po-table com paginacao e filtro

fix(interceptor): corrige envio do header X-PO-Screen-Lock em POST

chore(deps): atualiza @po-ui/ng-components para 19.40.0

refactor(menu): migra itens de menu para PoMenuItem interface

feat(chart): adiciona grafico de linha com po-chart e filtro de periodo

docs(context): preenche agents, docs e skills do .context

test(interceptor): adiciona specs para header X-PO-Screen-Lock
```

## Breaking Changes

Se a alteração é breaking, adicionar `BREAKING CHANGE` no footer:
```
feat(menu)!: remove suporte a po-navbar depreciado

BREAKING CHANGE: po-navbar foi removido; usar po-header
```