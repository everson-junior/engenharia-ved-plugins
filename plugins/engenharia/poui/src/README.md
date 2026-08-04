# Extension Integration

## Propósito

Arquivo TypeScript que implementa a integração entre o plugin externo (`engenharia-ved-plugins`) e a extensão VS Code (`extension-eng-ved`).

Responsável por:
- ✅ Validar pré-requisitos (Node.js, Git, Angular CLI)
- ✅ Importar serviços da extensão
- ✅ Inicializar `VsCodeTemplateAdapter`
- ✅ Executar `createProjectWithTemplates()` com 13 passos automáticos
- ✅ Reportar progresso via callbacks
- ✅ Gerenciar abertura do projeto em nova janela

## Exports

### Funções

```typescript
// Função principal para criar projeto
createProjectWithExtensionTemplates(
  config: CreateProjectConfig,
  onProgress?: ProgressCallback
): Promise<CreateProjectResult>

// Abrir projeto em nova janela VS Code
openProjectInNewWindow(projectPath: string): Promise<void>

// Configurar projeto pós-criação (README, welcome)
configureProjectAfterCreation(projectPath: string): Promise<void>

// Validar que Node.js, Git, Angular CLI estão instalados
validatePrerequisites(): Promise<string[]>
```

### Tipos

```typescript
// Configuração para criar projeto
interface CreateProjectConfig {
  projectName: string;
  parentPath: string;
  extensionPath: string;
  cliVersions?: { angular: string; poUi: string };
}

// Resultado da criação
interface CreateProjectResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  message: string;
  projectPath?: string;
  error?: Error;
}

// Callback de progresso
type ProgressCallback = (step: number, total: number, message: string) => void
```

## Como Usar

### No Agent

```typescript
import * as vscode from 'vscode';
import {
  createProjectWithExtensionTemplates,
  validatePrerequisites,
  openProjectInNewWindow
} from '../src/extension-integration';

export async function createProject(
  extensionContext: vscode.ExtensionContext,
  projectName: string,
  parentPath: string
) {
  // Validar pré-requisitos
  const missing = await validatePrerequisites();
  if (missing.length > 0) {
    vscode.window.showErrorMessage(
      `Faltando: ${missing.join(', ')}`
    );
    return;
  }

  // Criar projeto
  const result = await createProjectWithExtensionTemplates({
    projectName,
    parentPath,
    extensionPath: extensionContext.extensionPath,
    cliVersions: { angular: '21', poUi: '21' }
  }, (step, total, message) => {
    console.log(`[${step}/${total}] ${message}`);
  });

  // Processar resultado
  if (result.status === 'SUCCESS') {
    await openProjectInNewWindow(result.projectPath!);
  } else {
    vscode.window.showErrorMessage(result.message);
  }
}
```

## Fluxo de Execução

```
1. Agent chama createProjectWithExtensionTemplates()
2. Handler valida config de entrada
3. Obtém referência à extensão extension-eng-ved
4. Ativa extensão se necessário
5. Importa serviços (VsCodeTemplateAdapter, createProjectWithTemplates)
6. Inicializa template service
7. Executa 13 passos com callbacks de progresso
8. Retorna resultado com status e path
9. Agent abre projeto em nova janela
10. Configura projeto pós-criação
```

## 13 Passos Automáticos

Cada passo chama `onProgress(step, total, message)`:

```
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
```

## Arquitetura

```
Extension Integration (Plugin)
    │
    ├─ Valida pré-requisitos
    │   └─ Node.js 18+, Git 2.30+, Angular CLI 21
    │
    ├─ Inicializa
    │   └─ VsCodeTemplateAdapter com extensionPath
    │
    ├─ Executa 13 passos
    │   └─ Via createProjectWithTemplates(config, callback)
    │
    └─ Retorna resultado
        └─ SUCCESS | FAILED | CANCELLED
```

## Dependências Externas

- `vscode`: VS Code API para UI, commands, file dialogs
- `extension-eng-ved`: Extensão que fornece templates e orquestrador

## Testes

### Teste Manual

```bash
# Abrir plugin em VS Code
code ~/.vscode/agent-plugins/github.com/everson-junior/engenharia-ved-plugins/plugins/engenharia/poui

# Invocar skill
# @create-project

# Preencher:
# Nome: teste-plugin
# Pasta: ~/projects

# Validar resultado
ls -la ~/projects/teste-plugin/.context/
```

### Teste Automático

```bash
# Compilar TypeScript
npm run compile

# Verificar tipos
npx tsc --noEmit

# Rodar testes (se existirem)
npm test
```

## Troubleshooting

**Erro**: "Extensão não encontrada"
- Solução: Instalar `extension-eng-ved` do Marketplace

**Erro**: "Templates não carregam"
- Solução: Verificar `src/templates/` na extensão

**Erro**: "CLI falha"
- Solução: Instalar `@angular/cli@21`

**Erro**: "Pasta já existe"
- Solução: Escolher nome diferente

## Próximas Etapas

1. ✅ Handler criado
2. ⏳ Implementar no agent (PROJECT-CREATOR-IMPLEMENTATION.md)
3. ⏳ Testar end-to-end
4. ⏳ Deploy v0.0.2

## Documentação Relacionada

- [EXTENSION-INTEGRATION-GUIDE.md](../docs/EXTENSION-INTEGRATION-GUIDE.md)
- [PROJECT-CREATOR-IMPLEMENTATION.md](../docs/PROJECT-CREATOR-IMPLEMENTATION.md)
- [PLUGIN-INTEGRATION-SUMMARY.md](../docs/PLUGIN-INTEGRATION-SUMMARY.md)
- [IMPLEMENTATION-CHECKLIST.md](../docs/IMPLEMENTATION-CHECKLIST.md)

---

**Arquivo**: `src/extension-integration.ts`  
**Status**: Production Ready  
**Última atualização**: 2026-08-04
