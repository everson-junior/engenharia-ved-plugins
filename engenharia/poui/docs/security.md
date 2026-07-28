---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Security & Compliance Notes

Práticas de segurança para aplicações Angular com PO UI integradas ao Protheus.

**Princípios de Segurança**:
- Defesa em profundidade — Múltiplas camadas de segurança
- Princípio do menor privilégio — Acesso mínimo necessário
- Seguro por padrão — Configurações seguras desde o início

## Authentication & Authorization

**Autenticação**:
- Gerenciada pelo ERP Protheus quando rodando como app integrada
- Token/sessão: Controlado pelo Protheus via `ProAppConfigService`
- Standalone: Implementar via interceptor usando JWT ou OAuth conforme o contexto

**Autorização**:
- Permíssões vem do ERP Protheus; a UI deve refletir o perfil de acesso
- Controle via condições no template (`*ngIf`) ou propriedades PO UI (`p-disabled`)

## Secrets & Sensitive Data

**Gerenciamento de Segredos**:
- URLs de APIs configuradas em `src/environments/environment.*.ts`
- **Nunca** commitar URLs internas do ERP ou tokens em arquivos de ambiente
- `appConfig.json` é público; não incluir credenciais ou tokens

**SessionStorage**:
- Usar apenas para flags de contexto (ex: `insideProtheus`)
- **Não** armazenar tokens de autenticação ou dados sensíveis no `sessionStorage`

**Dados em Trânsito**:
- TLS 1.2+ obrigatório em produção
- Headers sensíveis devem ser enviados apenas pelo `LibCoreDevInterceptorService`

## XSS & Injection Prevention

- Angular escapa HTML automaticamente; **nunca** usar `bypassSecurityTrustHtml()` sem revisão
- Não usar `innerHTML` com conteúdo vindo de APIs
- Validar e sanitizar entradas do usuário no backend; a UI é a última linha de defesa

## Dependency Security

- Executar `npm audit` regularmente para detectar vulnerabilidades
- Manter `@po-ui/ng-*`, `@totvs/*` e dependências Angular atualizadas
- Revisar as flags `--force` ou `--legacy-peer-deps` no CI

## Compliance & Policies

- Acessibilidade WCAG 2.1 AA é obrigatória (contraste 4.5:1, alvos táteis 44px)
- Código revisado por pares antes do merge
- Scan de dependências como gate no pipeline CI

## Related Resources

- [architecture.md](./architecture.md)
- [doc-poui.md](../../doc-poui.md)
