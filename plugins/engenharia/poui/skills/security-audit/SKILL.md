---
type: skill
name: Security Audit
description: Security review checklist for code and infrastructure
skillSlug: security-audit
phases: [R, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Security Audit Skill — Angular/PO UI

## When to Use

Use ao realizar auditoria de segurança em aplicações Angular com PO UI.

## Instructions

### Checklist de Auditoria

#### 1. XSS Prevention
- [ ] Não usar `bypassSecurityTrustHtml()`, `bypassSecurityTrustScript()`, etc. sem justificativa documentada
- [ ] Não usar `[innerHTML]` com conteúdo de APIs externas
- [ ] Confirmar que o Angular DomSanitizer escapa conteúdo dinâmico corretamente

#### 2. Secrets & Environment
- [ ] `src/environments/environment.ts` não contém tokens ou senhas
- [ ] `src/assets/data/appConfig.json` não contém credenciais
- [ ] URLs de APIs internas do Protheus não expostas em arquivos públicos

#### 3. SessionStorage / LocalStorage
- [ ] Apenas flags de contexto armazenadas (`insideProtheus`)
- [ ] Não há tokens JWT ou dados sensíveis no storage do browser

#### 4. HTTP Security
- [ ] TLS 1.2+ em todos os ambientes de produção
- [ ] CORS configurado para permitir apenas domínios esperados
- [ ] Headers de segurança no servidor (CSP, X-Frame-Options, HSTS)
- [ ] `LibCoreDevInterceptorService` não vaza informações nos headers

#### 5. Dependency Audit
```bash
npm audit
npm audit --audit-level=high
```
- [ ] Nenhuma vulnerabilidade `high` ou `critical` sem mitigacão
- [ ] `@po-ui/ng-*` e `@totvs/*` na versão mais recente estavelvel (v19.x)
- [ ] Angular CLI e dependências core atualizadas

#### 6. Angular-specific
- [ ] `Content-Security-Policy` configurado adequadamente para Angular
- [ ] Lazy routes não são acessíveis sem autenticação (Guards se necessário)
- [ ] `APP_INITIALIZER` não carrega scripts externos não confiáveis

## Examples

```typescript
// INSEGURO
this.sanitizer.bypassSecurityTrustHtml(this.htmlFromApi);

// SEGURO: Angular escapa automaticamente
<div>{{ textFromApi }}</div>

// SEGURO: apenas attributes string
<po-input [p-label]="labelFromApi"></po-input>
```