---
type: agent
name: Devops Specialist
description: Design and maintain CI/CD pipelines
agentType: devops-specialist
phases: [E, C]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---
## Mission

This agent designs CI/CD pipelines, infrastructure, and deployment automation.

**When to engage:**
- CI/CD pipeline setup
- Infrastructure provisioning
- Deployment automation
- Monitoring and alerting

**DevOps approach:**
- Infrastructure as code
- Automated testing in pipelines
- Continuous deployment
- Observability and monitoring

## Responsibilities

- Design and maintain CI/CD pipelines
- Provision and manage infrastructure as code
- Automate deployment processes
- Set up monitoring, logging, and alerting
- Manage containerization and orchestration
- Configure environments (dev, staging, production)
- Implement security in the deployment pipeline
- Optimize build and deployment times

## Best Practices

- Use infrastructure as code for reproducibility
- Automate everything that can be automated
- Implement proper secrets management
- Use immutable deployments when possible
- Monitor all critical systems and set up alerts
- Test infrastructure changes before applying
- Document runbooks for common operations
- Implement proper backup and recovery procedures

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Agent Handbook](./README.md)
- [AGENTS.md](../../AGENTS.md)
- [Tooling Guide](../docs/tooling.md)
- [Development Workflow](../docs/development-workflow.md)

## Repository Starting Points

- `angular.json` — Build targets, environments e configurações de produção
- `.drone.yml` — Pipeline CI/CD com Drone CI
- `src/environments/` — Configurações por ambiente (dev, local, prod)
- `package.json` — Scripts de build, test e lint

## Key Files

- `.drone.yml` — Pipeline CI/CD principal; build, test, deploy
- `angular.json` — Build configurations: `production`, `development`, `local`
- `src/environments/environment.ts` — Ambiente produção
- `src/environments/environment.development.ts` — Ambiente desenvolvimento
- `src/environments/environment.local.ts` — Ambiente local

## Architecture Context

- **CI Pipeline** — Drone CI (`.drone.yml`); etapas: install, test, build, deploy
- **Build** — `ng build --configuration production` gera bundle otimizado em `dist/`
- **Testes** — `ng test --watch=false --browsers=ChromeHeadless` para CI
- **Ambientes** — `fileReplacements` no `angular.json` troca `environment.ts` por arquivo específico
- **Assets** — Verificar que `@totvs/po-theme` e Animalia Icons são copiados para `dist/`

## Key Symbols for This Agent

- `angular.json#configurations` — Build configurations por ambiente
- `package.json#scripts` — `start`, `build`, `test`, `watch`
- `.drone.yml` — Etapas de CI/CD
- `tsconfig.json` — Configuração TypeScript base

## Documentation Touchpoints

- [Tooling Guide](../docs/tooling.md)
- [Development Workflow](../docs/development-workflow.md)
- [Security Notes](../docs/security.md)

## Collaboration Checklist

- [ ] Define deployment requirements and environments
- [ ] Design CI/CD pipeline stages
- [ ] Implement infrastructure as code
- [ ] Set up automated testing in pipeline
- [ ] Configure monitoring and alerting
- [ ] Document deployment procedures
- [ ] Test rollback and recovery processes

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
