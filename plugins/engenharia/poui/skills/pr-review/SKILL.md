---
type: skill
name: Pr Review
description: Review pull requests against team standards and best practices
skillSlug: pr-review
phases: [R, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# PR Review Skill — PO UI Angular

## When to Use

Use ao revisar um Pull Request no projeto `poui-skill-config`.

## Instructions

### 1. Contexto da PR
- [ ] Descrição clara do que foi alterado e por quê
- [ ] Issues ou tickets linkados
- [ ] Mensagens de commit seguem Conventional Commits

### 2. Checklist Técnico PO UI
- [ ] Nenhum componente PO UI depreciado adicionado (`po-navbar`, `po-gauge` standalone, Polcon)
- [ ] Propriedades `p-*` validadas na documentação https://po-ui.io/documentation
- [ ] Grid system usado corretamente (`po-row`, `po-md-*`, `po-sm-*`)
- [ ] `PoPageModule` importado para qualquer `po-page-*` utilizado

### 3. Testes
- [ ] Specs em `*.spec.ts` adicionadas/atualizadas
- [ ] `ng test --watch=false` passa sem erros
- [ ] Mocks de `ProAppConfigService` implementados onde necessário

### 4. Build & CI
- [ ] `ng build --configuration production` sem warnings críticos
- [ ] Pipeline `.drone.yml` verde
- [ ] Nenhum `console.log` ou código debug em produção

### 5. Documentação
- [ ] `AGENTS.md` ou `.context/` atualizado se comportamento de AI mudou
- [ ] `README.md` atualizado se documentação externa mudou

## Sign-off

Aprovado quando todos os checkboxes marcados e CI verde.