---
type: skill
name: Create Project
skillSlug: create-project
description: Cria novo projeto Angular 21 + PO UI 21 com estrutura e padrões Eng-VeD
phases: [P, E, V]
generated: 2026-08-03
status: filled
scaffoldVersion: "2.0.0"
---

## When to Use

Use esta skill quando:
- Um dev precisa criar um novo projeto Angular PO UI do zero com padrões Eng-VeD
- Você quer garantir estrutura padronizada (agentes, skills, docs, configurações)
- Há necessidade de integração com TOTVS/Protheus + padrões Eng-VeD
- Projeto deve incluir `.context/` com agentes, skills e documentação herdados

**Triggers:**
- `@create-project` — Chamar skill diretamente via chat Copilot
- Outro agente (ex: `onboarding-specialist`) invoca esta skill programaticamente
- Participante de chat `eng-ved-poui.project-creator` detecta `criarProjeto` ou "criar projeto"
- Comando `extension-eng-ved.createProject` executado pela extensão Eng-VeD

### Entrada pelo Chat do Copilot

Quando a intenção vier do participante de chat, o plugin não recria o fluxo de criação. O handler deve:

1. Verificar `vscode.extensions.getExtension('totvs.extension-eng-ved')`.
2. Ativar a extensão se necessário com `extension.activate()`.
3. Executar `await vscode.commands.executeCommand('extension-eng-ved.createProject')` sem argumentos.
4. Reportar no stream que o assistente foi iniciado ou exibir o erro retornado.

O comando abre a coleta de nome/local no VS Code e executa os 13 passos na extensão Eng-VeD. O usuário fornece as informações solicitadas pela extensão; o plugin não deve coletar nem validar esses dados.

```typescript
await vscode.commands.executeCommand('extension-eng-ved.createProject');
```

Não implemente `ng new`, `npm install`, cópia de templates, coleta de inputs ou `createProjectCore` no plugin. A extensão hospedeira conduz os diálogos e o terminal.

O registrador correspondente está em `src/extension-integration.ts`, na função `registerChatParticipant(context)`. A extensão hospedeira deve chamar essa função durante a ativação.

---

## Instructions

### Etapa 1: Invocar o comando oficial da extensão

O agent deve apenas verificar a instalação da extensão e disparar o comando sem argumentos. A extensão Eng-VeD coleta todas as informações no VS Code e executa o fluxo pelo terminal:

**Instruções ao Copilot (como contexto para o agente):**
```
Agente project-creator, verifique se `totvs.extension-eng-ved` está instalada e execute apenas:
await vscode.commands.executeCommand('extension-eng-ved.createProject');

Não colete informações, não valide Node/Git/CLI e não execute ng, npm, git, cópia de templates ou createProjectCore no plugin.
Reporte que o assistente oficial foi iniciado e deixe o usuário preencher os diálogos da extensão.
```

---

### Etapa 2: Aguardar a extensão e o usuário

Depois de disparar o comando, o agent não valida arquivos, não executa terminal e não realiza ações adicionais. A extensão Eng-VeD mostra os diálogos, executa os comandos no terminal e informa o resultado diretamente ao usuário.

---

## Input Parameters

Não há parâmetros de projeto para o agent. O usuário informa nome, pasta e demais opções nos diálogos exibidos pela extensão Eng-VeD.

---

## CLI Automation da Extensão (100% Non-Interactive)

A extensão Eng-VeD utiliza **flags CLI** e **variáveis de ambiente** para garantir execução automatizada. O plugin apenas dispara `extension-eng-ved.createProject`; ele não executa nenhum comando CLI diretamente. Isso é essencial para:
- Execução via Copilot Agent/Skill
- CI/CD pipelines
- Scripts de automação

### Environment Variables Aplicadas pela Extensão

Todas as variáveis abaixo são injetadas em CADA comando CLI:

```typescript
const CLI_AUTOMATION_ENV = {
  'NG_CLI_ANALYTICS': 'ci',           // Suprimir prompt de analytics Angular
  'CI': 'true',                        // Indicador genérico de ambiente CI
  'FORCE_COLOR': '0',                  // Desabilitar cores para logs limpos
  'npm_config_update_notifier': 'false', // Suprimir notificador npm
  'npm_config_fund': 'false',          // Suprimir mensagens de funding
  'npm_config_audit': 'false',         // Suprimir warnings de audit
};
```

### Flags CLI por Comando da Extensão

| Passo | Comando | Flags de Automação | Propósito |
|-------|---------|-------------------|-----------|
| 1 | `ng new` | `--skip-install --ssr=false --package-manager=npm` | Pular install, desabilitar SSR |
| 3 | `ng add @po-ui/ng-components` | `--skip-confirmation --defaults` | Aceitar defaults automaticamente |
| 4 | `ng add @po-ui/ng-templates` | `--skip-confirmation --defaults` | Aceitar defaults automaticamente |
| 5 | `ng generate environments` | `--defaults` | Usar configuração padrão |
| 6 | `ng generate module` | `--flat=false` | Criar em subpasta |
| 7 | `ng generate service` | `--skip-tests` | Pular criação de spec file |
| 9 | `npm install` | `--legacy-peer-deps --no-fund --no-audit` | Suprimir warnings e prompts |

### Templates sob responsabilidade da extensão

A skill não instancia `ITemplateService` nem acessa templates. A extensão Eng-VeD carrega e valida os templates do `.vsix` dentro de `runCreateProjectCommand`:

```typescript
await vscode.commands.executeCommand('extension-eng-ved.createProject');
```

**Benefícios da Arquitetura**:
- Templates sempre carregados pela extensão `.vsix`
- Validação e orquestração centralizadas em `runCreateProjectCommand`
- Plugin externo não acessa `context` nem reimplementa `createProjectCore`

---

## Output Validation

A Skill não valida o resultado nem inspeciona arquivos. Depois do disparo, a extensão Eng-VeD conduz a criação e informa o resultado ao usuário.

**Estrutura de Sucesso - Arquivo/Pastas Esperadas:**

```
novo-projeto/
├── .git/                          # Git inicializado
├── .context/
│   ├── agents/                    # Agentes padrão Eng-VeD
│   │   ├── architect-specialist.agent.md
│   │   ├── bug-fixer.agent.md
│   │   ├── feature-developer.agent.md
│   │   └── ... (outros agentes)
│   ├── skills/                    # Skills padrão Eng-VeD
│   │   ├── api-design/
│   │   ├── bug-investigation/
│   │   ├── code-review/
│   │   └── ... (outras skills)
│   └── docs/                      # Documentação padrão
│       ├── architecture.md
│       ├── development-workflow.md
│       └── ...
├── src/
│   ├── app/                       # Angular app structure
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   ├── app-initializer.ts
│   │   ├── home/
│   │   ├── modules/
│   │   │   └── lib-core-dev.module.ts
│   │   └── services/
│   │       └── lib-core-dev-interceptor.service.ts
│   ├── assets/
│   │   ├── data/
│   │   │   └── appConfig.json       # Config file com projectName
│   │   └── images/
│   │       └── favicon.ico
│   ├── environments/
│   │   ├── environment.local.ts
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   └── main.ts
├── angular.json                   # Customizado para build paths
├── package.json                   # Com versions corretas de dependencies
├── tsconfig.json                  # TypeScript config
├── karma.conf.js                  # Testing config
├── .vscode/
│   └── settings.json              # TOTVS extensões configuradas
└── AGENTS.md                      # Agents readme

```

**Versions Garantidas após Criação:**
- Angular: 21.x.x
- PO UI: 21.x.x
- @totvs/protheus-lib-core: 21.x.x
- TypeScript: 5.9.3
- Node.js target: 18+
- Git: repositório inicializado com commit inicial

---

## Templates / Checklist

### 📋 Responsabilidade da Extensão (antes de começar)

```markdown
O agent não valida esses itens. A extensão Eng-VeD executa as verificações necessárias depois que o usuário preencher os diálogos.
```

### 📊 O que o projeto terá após criação

```markdown
## Versões Garantidas

✓ Angular: 21.x.x (latest v21)
✓ PO UI: 21.x.x (latest v21)
✓ @totvs/protheus-lib-core: 21.x.x
✓ TypeScript: 5.9.3
✓ Node.js: 18+ (target)

## Estrutura Padrão Eng-VeD

✓ `.context/agents/` — Agentes padrão para orquestração
✓ `.context/skills/` — Skills padrão para IA
✓ `.context/docs/` — Documentação (arquitetura, workflow, etc)
✓ `.vscode/settings.json` — Configurações TOTVS
✓ `src/environments/` — Local, Development, Production
✓ `src/app/modules/lib-core-dev/` — Módulo de dev
✓ `src/app/services/lib-core-dev-interceptor/` — HTTP interceptor
✓ `.git/` — Repositório Git inicializado
```

---

## Examples of Use

### Exemplo 1: Skill Chamada Diretamente no Chat

```
User: @create-project

Copilot:
🔎 Verificando a extensão Eng-VeD...
🚀 Iniciando o assistente oficial...

O VS Code solicitará nome, pasta e demais informações. A extensão executará o fluxo pelo terminal.
```

### Exemplo 2: Skill Invocada por Outro Agente

```markdown
# onboarding-specialist.agent.md

## Responsibilities

...

4. **Criar Projeto Base** 
   — Usar skill `create-project` para novo projeto Angular PO UI
   
   Instruções ao Copilot:
   ```
   Invoke skill 'create-project':
  - Execute `extension-eng-ved.createProject` sem argumentos
  - Aguarde o usuário preencher os diálogos da extensão
  - Informe apenas se a extensão não estiver instalada ou se o comando falhar
   ```

...
```

### Exemplo 3: Participante de Chat e Comando da Extensão

```typescript
// A extensão hospedeira registra o participante do plugin no activate.
import * as vscode from 'vscode';
import { registerChatParticipant } from '../src/extension-integration';

export function activate(context: vscode.ExtensionContext): void {
  registerChatParticipant(context);
}
```

---

## Extension Integration (v0.0.2+)

A partir da **v0.0.2**, a skill delega a criação ao comando `extension-eng-ved.createProject` da extensão `totvs.extension-eng-ved`. A extensão hospedeira garante o uso dos templates do `.vsix` e a automação CLI.

### Arquitetura de Integração

```
PLUGIN EXTERNO                          EXTENSÃO .VSIX
(.vscode/agent-plugins/poui/)           (vscode-extension-ai-poui/)
         │
         ├─ SKILL.md                     ├─ runCreateProjectCommand()
         ├─ project-creator.agent.md     │   
         └─ src/extension-integration.ts ├─ createProjectCore()
           │                       │   (orquestração interna)
           └──executeCommand─────→ │   extension-eng-ved.createProject
                                        │
                                        └─ Templates (25 arquivos)
                                            ├─ app.component.ts.template
                                            ├─ app.config.ts.template
                                            └─ ... (outros templates)
```

### Como o Plugin Usa a Integração

1. **Disparar o comando sem parâmetros**
   ```typescript
   const extension = vscode.extensions.getExtension('totvs.extension-eng-ved');
   if (!extension) {
     throw new Error('A extensão totvs.extension-eng-ved não está instalada.');
   }
   if (!extension.isActive) {
     await extension.activate();
   }
   await vscode.commands.executeCommand('extension-eng-ved.createProject');
   ```

2. **Deixar o usuário preencher os diálogos**
   ```typescript
   if (result.status === 'SUCCESS') {
     // Abrir projeto em nova janela
     await openProjectInNewWindow(result.projectPath!);
     
     vscode.window.showInformationMessage(
       `✅ Projeto criado em ${result.projectPath}`
     );
   } else {
     vscode.window.showErrorMessage(
       `❌ Erro: ${result.message}`
     );
   }
   ```

### Garantias da Integração

✅ **Templates Obrigatórios**
- 25 templates carregados do `.vsix` (não via filesystem)
- Validação fail-fast se algum template faltar
- Injeção obrigatória via `templateService` parameter

✅ **100% Non-Interactive CLI**
- 6 variáveis de ambiente aplicadas globalmente
- Flags específicas para cada comando (--defaults, --skip-confirmation, etc)
- Sem stdin piping, sem prompts user

✅ **Type-Safe Interface**
- `CreateProjectConfig`, `CreateProjectResult` interfaces
- `ProgressCallback` type para callbacks de progresso
- TypeScript compilation verificada

### Arquivo de Integração

📍 **Localização**: `.vscode/agent-plugins/github.com/everson-junior/engenharia-ved-plugins/plugins/engenharia/poui/src/extension-integration.ts`

**Exports**:
- `executeCreateProjectCommand()` - Verifica a extensão e dispara o comando sem argumentos
- `openProjectInNewWindow()` - Abrir projeto em nova janela
- `configureProjectAfterCreation()` - Setup pós-criação
- Tipos: `CreateProjectConfig`, `CreateProjectResult`, `ProgressCallback`

---

## Related Resources

- [Agent: project-creator](../agents/project-creator.agent.md) — Agente orquestrador dos 13 passos
- [Service: ProjectCreationOrchestrator](../../infrastructure/services/project-creation-orchestrator.ts) — Implementação de lógica refatorada
- [Angular Schematics Docs](https://angular.io/guide/schematics) — Framework para generators
- [PO UI Installation Guide](https://po-ui.io/guides/development-setup) — Documentação oficial PO UI
- [VS Code Dialogs API](https://code.visualstudio.com/api/references/vscode-api#window) — APIs para input dialogs
- [TOTVS Protheus Lib Core](https://github.com/totvs/protheus-lib-core) — Biblioteca TOTVS
- [Workspace Legacy Commands](../../presentation/commands/workspace-legacy-commands.ts) — Código legado (será refatorado)

---

## Troubleshooting

**Problema**: "Angular CLI v21 não encontrada"
- Solução: `npm install -g @angular/cli@21`

**Problema**: "Git não encontrado"
- Solução: Instalar Git: https://git-scm.com/

**Problema**: "Pasta '${projectName}' já existe"
- Solução: Escolher nome diferente ou pasta diferente

**Problema**: "Espaço em disco insuficiente"
- Solução: Liberar espaço (~2GB) ou escolher disco diferente

**Problema**: "npm install falhou"
- Solução: Verificar conexão internet, limpar cache: `npm cache clean --force`

**Problema**: "Permissão negada ao criar pasta"
- Solução: Verificar permissões no diretório pai ou usar outro local
