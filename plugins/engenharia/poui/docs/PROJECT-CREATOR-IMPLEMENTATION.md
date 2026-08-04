# Project Creator Agent - Implementation Guide

## Visão Geral

Este documento mostra como atualizar o agent `project-creator.agent.md` para usar a integração com a extensão `extension-eng-ved` e executar criação de projeto com templates automáticos.

## Arquivo: `agents/project-creator.agent.md`

Adicione ao seu agent a seção de implementação:

```markdown
---
type: agent
name: Project Creator
agentType: project-orchestrator
description: Orquestra criação de projetos Angular 21 + PO UI 21 com templates Eng-VeD
phases: [P, E, V]
generated: 2026-08-04
status: production-ready
---

## Mission

Executar criação completa de projeto Angular PO UI com:
1. ✅ Validação de pré-requisitos (Node.js, Git, Angular CLI)
2. ✅ Execução de 13 passos CLI com automação 100%
3. ✅ Injeção obrigatória de templates da extensão .vsix
4. ✅ Feedback de progresso em tempo real
5. ✅ Abertura automática em nova janela VS Code

## Responsibilities

1. **Validar Pré-Requisitos** — Node.js 18+, Git 2.30+, Angular CLI 21
2. **Importar Handler** — extension-integration.ts com createProjectWithExtensionTemplates()
3. **Construir Config** — CreateProjectConfig com extensionPath, cliVersions
4. **Executar com Progress** — Chamar handler com ProgressCallback
5. **Processar Resultado** — SUCCESS → abrir | FAILED → erro
6. **Configurar Pós-Criação** — README, welcome message, next steps

## How It Works

### Phase 1: Validate (P)

```typescript
import * as vscode from 'vscode';
import {
  validatePrerequisites,
  CreateProjectConfig
} from '../src/extension-integration';

// Validar que temos tudo instalado
const missing = await validatePrerequisites();
if (missing.length > 0) {
  vscode.window.showErrorMessage(
    \`❌ Pré-requisitos faltando: \${missing.join(', ')}\`
  );
  return; // Abortar
}
```

**Checklist:**
- ✓ Node.js 18+ → `node --version`
- ✓ Git 2.30+ → `git --version`
- ✓ Angular CLI 21 → `ng version`

### Phase 2: Execute (E)

```typescript
import {
  createProjectWithExtensionTemplates,
  ProgressCallback
} from '../src/extension-integration';

// Receber inputs da skill (validados previamente)
const projectName = 'meu-projeto';      // kebab-case
const parentPath = '/home/user/projects'; // absolute path

// Preparar config
const config: CreateProjectConfig = {
  projectName,
  parentPath,
  extensionPath: extensionContext.extensionPath, // do VS Code
  cliVersions: { angular: '21', poUi: '21' }
};

// Progress callback: será chamado 13 vezes
const progressCallback: ProgressCallback = (step, total, message) => {
  console.log(\`[\${step}/\${total}] \${message}\`);
  
  // Mostrar no VS Code UI
  vscode.window.showInformationMessage(\`[Step \${step}/\${total}] \${message}\`);
};

// Executar com progress tracking
const result = await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: \`Criando projeto '\${projectName}'...\`,
    cancellable: false
  },
  async (progress) => {
    return await createProjectWithExtensionTemplates(
      config,
      (step, total, message) => {
        // Atualizar barra de progresso
        progress.report({
          increment: (100 / total),
          message: \`[Step \${step}/\${total}] \${message}\`
        });
        
        // Log no console
        console.log(\`[Progress] \${step}/\${total}: \${message}\`);
      }
    );
  }
);
```

**13 Passos Executados:**
1. Validando extensão extension-eng-ved
2. Ativando extensão
3. Carregando serviços de template
4. Inicializando VsCodeTemplateAdapter
5. Validando templates (25 arquivos)
6. Executando ng new ${projectName}
7. Instalando @po-ui/ng-components
8. Instalando @po-ui/ng-templates
9. Gerando environments
10. Aplicando templates do .vsix
11. Configurando angular.json
12. Finalizando npm install
13. Validando resultado

### Phase 3: Verify (V)

```typescript
import { openProjectInNewWindow } from '../src/extension-integration';

if (result.status === 'SUCCESS') {
  // ✅ Sucesso!
  
  // Abrir em nova janela
  await openProjectInNewWindow(result.projectPath!);
  
  // Mostrar mensagem
  vscode.window.showInformationMessage(
    \`✅ \${result.message}\`,
    'OK'
  );
  
  // Log final
  console.log(\`✓ Projeto criado em: \${result.projectPath}\`);

} else if (result.status === 'FAILED') {
  // ❌ Erro
  
  vscode.window.showErrorMessage(
    \`❌ Falha na criação:\n\${result.message}\n\nDetalhes: \${result.error?.message}\`,
    'OK', 'Abrir Log'
  );
  
  console.error(\`✗ Erro: \${result.error}\`);

} else if (result.status === 'CANCELLED') {
  // ⚠️ Cancelado pelo usuário
  
  vscode.window.showWarningMessage(
    'Criação de projeto cancelada pelo usuário.'
  );
}
```

**Validações Finais:**
- ✓ Pasta `${projectPath}` existe
- ✓ `.context/` criado (agentes, skills, docs)
- ✓ `angular.json` presente
- ✓ `package.json` com dependências
- ✓ `.git/` inicializado

## Complete Code Example

```typescript
/**
 * handler/create-project-handler.ts
 * Entry point para criar projeto via agent
 */

import * as vscode from 'vscode';
import {
  createProjectWithExtensionTemplates,
  validatePrerequisites,
  openProjectInNewWindow,
  configureProjectAfterCreation,
  CreateProjectConfig,
  CreateProjectResult,
  ProgressCallback
} from '../src/extension-integration';

/**
 * Main handler - invocado pelo agent project-creator
 */
export async function createProjectHandler(
  extensionContext: vscode.ExtensionContext,
  projectName: string,
  parentPath: string
): Promise<CreateProjectResult> {
  
  try {
    // 1️⃣ Log início
    console.log(\`\n🚀 Iniciando criação de projeto...\`);
    console.log(\`   Projeto: \${projectName}\`);
    console.log(\`   Local: \${parentPath}\`);
    
    // 2️⃣ Validar pré-requisitos
    console.log(\`\n📋 Validando pré-requisitos...\`);
    const missing = await validatePrerequisites();
    
    if (missing.length > 0) {
      const message = 
        \`Pré-requisitos faltando: \${missing.join(', ')}\n\n\` +
        \`Por favor, instale:\n\` +
        missing.map(item => \`- \${item}\`).join('\\n');
      
      vscode.window.showErrorMessage(message);
      
      return {
        status: 'FAILED',
        message: \`Pré-requisitos não atendidos: \${missing.join(', ')}\`
      };
    }
    console.log(\`✓ Pré-requisitos validados\`);
    
    // 3️⃣ Preparar configuração
    console.log(\`\n⚙️ Preparando configuração...\`);
    const config: CreateProjectConfig = {
      projectName,
      parentPath,
      extensionPath: extensionContext.extensionPath,
      cliVersions: { angular: '21', poUi: '21' }
    };
    console.log(\`✓ Config pronta: \${JSON.stringify(config, null, 2)}\`);
    
    // 4️⃣ Criar progress callback
    const progressCallback: ProgressCallback = (step, total, message) => {
      console.log(\`[Progress \${step}/\${total}] \${message}\`);
    };
    
    // 5️⃣ Executar com progress bar
    console.log(\`\n🔄 Executando criação (13 passos)...\`);
    
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: \`🚀 Criando projeto '\${projectName}'...\`,
        cancellable: false
      },
      async (progress) => {
        return await createProjectWithExtensionTemplates(
          config,
          (step, total, message) => {
            progress.report({
              increment: (100 / total),
              message: \`[\${step}/\${total}] \${message}\`
            });
          }
        );
      }
    );
    
    // 6️⃣ Processar resultado
    console.log(\`\n📊 Resultado: \${result.status}\`);
    
    if (result.status === 'SUCCESS') {
      console.log(\`✅ \${result.message}\`);
      
      // Abrir em nova janela
      console.log(\`📂 Abrindo projeto em nova janela...\`);
      await openProjectInNewWindow(result.projectPath!);
      
      // Configuração pós-criação
      console.log(\`⚙️ Configurando projeto pós-criação...\`);
      await configureProjectAfterCreation(result.projectPath!);
      
      // Mostrar sucesso
      await vscode.window.showInformationMessage(
        \`✅ Projeto '\${projectName}' criado com sucesso!\\n\\nLocalização: \${result.projectPath}\`,
        'Abrir em Terminal',
        'Fechar'
      );
      
      return result;
      
    } else {
      console.error(\`❌ \${result.message}\`);
      if (result.error) {
        console.error(\`   Erro: \${result.error.message}\`);
        console.error(\`   Stack: \${result.error.stack}\`);
      }
      
      // Mostrar erro com opção de mais detalhes
      await vscode.window.showErrorMessage(
        \`❌ Erro ao criar projeto:\\n\${result.message}\`,
        'Ver Detalhes',
        'Fechar'
      );
      
      return result;
    }
    
  } catch (error) {
    // Erro não tratado
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(\`\n💥 Erro crítico: \${errorMsg}\`);
    
    await vscode.window.showErrorMessage(
      \`Erro crítico ao criar projeto:\\n\${errorMsg}\`,
      'OK'
    );
    
    return {
      status: 'FAILED',
      message: \`Erro crítico: \${errorMsg}\`,
      error: error instanceof Error ? error : new Error(errorMsg)
    };
  }
}
```

## Integration Points

### No Agent (project-creator.agent.md)

```markdown
## Implementation

O agente importa e chama:

\`\`\`typescript
import { createProjectHandler } from '../handlers/create-project-handler';

const result = await createProjectHandler(
  extensionContext,
  projectName,     // from skill input
  parentPath       // from skill input
);
\`\`\`
```

### Na Skill (skills/create-project/SKILL.md)

```markdown
## Etapa 3: Invocar Agent

A skill valida inputs e passa para o agent:

\`\`\`
Skill Input: projectName, parentPath
        ↓
Agent: project-creator
        ↓
Handler: createProjectHandler()
        ↓
Service: createProjectWithExtensionTemplates()
        ↓
Extension: VsCodeTemplateAdapter + ProjectCreationOrchestrator
        ↓
Result: {status, message, projectPath}
\`\`\`
```

## Debugging

### Ativar Logs Detalhados

```typescript
// No início do handler
const DEBUG = true;

if (DEBUG) {
  console.log('🔍 Debug mode ON');
  console.log('Extension Path:', extensionContext.extensionPath);
  console.log('Config:', config);
}
```

### Verificar Arquivos Criados

```bash
# Após criação bem-sucedida
ls -la ${projectPath}/.context/
ls -la ${projectPath}/src/
ls -la ${projectPath}/angular.json
```

### Monitorar Progresso

```typescript
// Adicionar logging em cada step
progressCallback: (step, total, message) => {
  const percentage = Math.round((step / total) * 100);
  console.log(\`\n[${'█'.repeat(step)}${'░'.repeat(total - step)}] \${percentage}%\`);
  console.log(\`   \${message}\`);
}
```

## Próximas Etapas

1. ✅ Criar `extension-integration.ts`
2. ✅ Atualizar `SKILL.md` com guia
3. ✅ Criar `EXTENSION-INTEGRATION-GUIDE.md`
4. ⏳ **Implementar no agent (VOCÊ ESTÁ AQUI)**
5. ⏳ Testar end-to-end
6. ⏳ Deploy v0.0.2

---

**Arquivo**: agents/project-creator.agent.md
**Status**: Ready for Implementation
**Última atualização**: 2026-08-04
