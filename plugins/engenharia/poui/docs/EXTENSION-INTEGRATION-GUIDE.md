# Extension Integration Guide

## Visão Geral

Este guia mostra como integrar o plugin externo com a extensão `extension-eng-ved` para criar projetos Angular PO UI com templates automáticos.

## Arquivos Necessários

```
.vscode/agent-plugins/github.com/everson-junior/
  engenharia-ved-plugins/plugins/engenharia/poui/
  
  ├── src/
  │   └── extension-integration.ts      ← Handler de integração (criado)
  │
  ├── skills/
  │   └── create-project/
  │       └── SKILL.md                  ← Documentação atualizada
  │
  ├── agents/
  │   ├── project-creator.agent.md      ← Orquestrador (19 passos)
  │   └── poui-context.agent.md         ← Agent que usa a integração
  │
  └── docs/
      └── EXTENSION-INTEGRATION-GUIDE.md ← Este arquivo
```

## Passo 1: Verificar Estrutura

Confirme que você tem:

```bash
# Verificar arquivo de integração
ls -la .vscode/agent-plugins/.../src/extension-integration.ts

# Verificar SKILL.md atualizado
ls -la .vscode/agent-plugins/.../skills/create-project/SKILL.md

# Verificar agent
ls -la .vscode/agent-plugins/.../agents/project-creator.agent.md
```

## Passo 2: Usar no Agent

### Exemplo: `project-creator.agent.md`

Adicione ao seu agent:

```markdown
---
type: agent
name: Project Creator
agentType: project-orchestrator
description: Orquestra criação de projetos Angular PO UI com integração de templates
---

## Responsibilities

1. Validar pré-requisitos (Node.js, Git, Angular CLI)
2. Importar handler de integração da extensão
3. Executar createProjectWithExtensionTemplates() 
4. Reportar progresso (13 passos)
5. Validar resultado e abrir novo projeto

## Implementation

```typescript
import * as vscode from 'vscode';
import {
  createProjectWithExtensionTemplates,
  validatePrerequisites,
  openProjectInNewWindow,
  configureProjectAfterCreation,
  CreateProjectConfig
} from '../src/extension-integration';

export async function executeCreateProject(
  extensionContext: vscode.ExtensionContext,
  projectName: string,
  parentPath: string
): Promise<void> {
  try {
    // 1️⃣ Validar pré-requisitos
    const missing = await validatePrerequisites();
    if (missing.length > 0) {
      vscode.window.showErrorMessage(
        `❌ Pré-requisitos faltando:\n${missing.join('\n')}\n\n` +
        'Instale antes de criar projeto.'
      );
      return;
    }

    // 2️⃣ Preparar configuração
    const config: CreateProjectConfig = {
      projectName,
      parentPath,
      extensionPath: extensionContext.extensionPath,
      cliVersions: { angular: '21', poUi: '21' }
    };

    // 3️⃣ Executar com progress tracking
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Criando projeto '${projectName}'...`,
        cancellable: false
      },
      async (progress) => {
        return await createProjectWithExtensionTemplates(
          config,
          (step, total, message) => {
            // Atualizar barra de progresso
            progress.report({
              increment: (100 / total),
              message: `[${step}/${total}] ${message}`
            });
          }
        );
      }
    );

    // 4️⃣ Processar resultado
    if (result.status === 'SUCCESS') {
      // Abrir em nova janela
      await openProjectInNewWindow(result.projectPath!);
      
      // Configuração pós-criação
      await configureProjectAfterCreation(result.projectPath!);
      
      vscode.window.showInformationMessage(
        `✅ ${result.message}`
      );
    } else {
      vscode.window.showErrorMessage(
        `❌ ${result.message}\n\n${result.error?.message || ''}`
      );
    }

  } catch (error) {
    vscode.window.showErrorMessage(
      `Erro ao criar projeto: ${error}`
    );
  }
}
```
```

## Passo 3: Integração com Skill

A skill `create-project` já invoca o agent:

```markdown
# skills/create-project/SKILL.md

### Etapa 3: Invocar Agente `project-creator`

Com inputs validados (projectName, parentPath), invocar:

```typescript
import { executeCreateProject } from '../agents/project-creator.agent.md';

await executeCreateProject(
  extensionContext,
  projectName,
  parentPath
);
```

## Passo 4: Testar a Integração

### Teste Manual no VS Code

1. **Abrir plugin em VS Code**:
   ```bash
   code ~/.vscode/agent-plugins/github.com/everson-junior/engenharia-ved-plugins
   ```

2. **Invocar skill no Copilot Chat**:
   ```
   @create-project
   
   Qual é o nome do projeto?
   > meu-projeto-teste
   
   Selecione a pasta para criar o projeto
   > [escolher /tmp ou home/projects]
   
   🚀 Iniciando criação...
   [1/13] Validando extensão...
   [2/13] Carregando serviços...
   ...
   [13/13] Finalizando...
   
   ✅ Projeto criado com sucesso!
   Deseja abrir em nova janela? [Sim] [Não]
   ```

3. **Validar projeto criado**:
   ```bash
   ls -la /path/to/meu-projeto-teste
   
   # Deve conter:
   # - .context/ (agentes, skills, docs)
   # - src/ (código Angular)
   # - angular.json
   # - package.json
   # - .git/
   ```

### Teste Automático

```bash
# Compilar TypeScript
npm run compile

# Rodar testes (se existirem)
npm test

# Verificar bundle
npm run bundle
```

## Passo 5: Troubleshooting

### Erro: "Extensão 'TOTVS.extension-eng-ved' não encontrada"

**Solução**: 
- Verificar se extensão está instalada: `code --list-extensions | grep TOTVS`
- Se não estiver: instalar do VS Code Marketplace
- Ou instalar localmente: `npm install` no workspace da extensão

### Erro: "Configuração incompleta"

**Solução**:
- Verificar se `extensionContext` é passado corretamente
- Confirmar que `projectName` e `parentPath` não são undefined

### Erro: "Template falhou ao carregar"

**Solução**:
- Verificar se arquivo `extension-integration.ts` está correto
- Confirmar que templates estão em `src/templates/` da extensão
- Rodar: `npm run compile` para recompilar TypeScript

### Erro: "CLI não encontrada"

**Solução**:
- Instalar Angular CLI: `npm install -g @angular/cli@21`
- Verificar: `ng version` deve mostrar v21.x.x

## Deployment

### Build da Extensão

```bash
# No workspace da extensão
cd /path/to/vscode-extension-ai-poui

# Compilar
npm run compile

# Build production
npm run vscode:prepublish

# Package .vsix
npm run package
```

### Distribuir com Plugin

Copiar os arquivos na pasta do plugin:

```bash
# Copiar arquivo de integração
cp src/extension-integration.ts \
   ~/.vscode/agent-plugins/.../src/extension-integration.ts

# Atualizar SKILL.md
cp skills/create-project/SKILL.md \
   ~/.vscode/agent-plugins/.../skills/create-project/SKILL.md

# Verificar agents
ls ~/.vscode/agent-plugins/.../agents/project-creator.agent.md
```

## Arquitetura Detalhada

```
flow chart:

User invokes @create-project
       ↓
SKILL.md collects inputs (projectName, parentPath)
       ↓
Invokes Agent: project-creator.agent.md
       ↓
Calls: executeCreateProject(extensionContext, projectName, parentPath)
       ↓
Imports: createProjectWithExtensionTemplates from extension-integration.ts
       ↓
Validates prerequisites (Node.js, Git, Angular CLI)
       ↓
Creates config: CreateProjectConfig { projectName, parentPath, extensionPath, cliVersions }
       ↓
Calls: createProjectWithExtensionTemplates(config, progressCallback)
       ↓
Extension: VsCodeTemplateAdapter loads 25 templates from .vsix
       ↓
Extension: ProjectCreationOrchestrator executes 13 CLI steps with automation flags
       ↓
Result: { status, message, projectPath }
       ↓
Opens project in new window via vscode.openFolder()
       ↓
Shows welcome message and next steps
```

## Versioning

- **v0.0.1**: Skill create-project básico (legado)
- **v0.0.2**: Integração com extension-eng-ved (templates + CLI automation)
- **v0.0.3**: Cleanup de código legado (remover workspace-legacy-commands.ts)

## Próximos Passos

1. ✅ Integração implementada (`extension-integration.ts`)
2. ✅ SKILL.md atualizado com guia
3. ⏳ Testar em projeto real
4. ⏳ Documentar lições aprendidas
5. ⏳ Publicar v0.0.2 com integração

---

**Última atualização**: 2026-08-04
**Autor**: Eng-VeD Plugin Team
**Status**: Ready for Testing
