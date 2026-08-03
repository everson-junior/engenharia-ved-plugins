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
- Fallback command `extension-eng-ved.createProject` (deprecated, será removido em v0.0.3)

---

## Instructions

### Etapa 1: Validar Pré-Requisitos

Antes de proceder com a criação, verifique se o usuário tem instalado e com versões corretas:

**Checklist de Validação:**
- ✓ Node.js 18+ (`node --version` → v18.x.x ou superior)
- ✓ Git 2.30+ (`git --version` → git version 2.30+)
- ✓ Angular CLI 21 (`ng version` → v21.x.x)
- ✓ ~2GB espaço em disco livre (para node_modules + projeto)
- ✓ Acesso escrita ao diretório onde criará projeto
- ✓ Conexão internet disponível (para npm install de dependências)

**Se faltar algo:**
1. Identificar qual pré-requisito está faltando
2. Instruir usuário a instalar:
   - **Node.js**: Ir para https://nodejs.org/ (baixar LTS)
   - **Git**: Ir para https://git-scm.com/ (instalar versão mais recente)
   - **Angular CLI**: Executar no terminal: `npm install -g @angular/cli@21`
3. **Abortar execução** se algum pré-requisito não for atendido

**Mensagem se validação falhar:**
```
❌ Pré-requisitos não atendidos para criar projeto.

Faltando: ${missingPrerequisites.join(', ')}

Por favor, instale:
- Node.js 18+: https://nodejs.org/
- Git 2.30+: https://git-scm.com/
- Angular CLI 21: npm install -g @angular/cli@21

Tente novamente após instalar.
```

---

### Etapa 2: Coletar Inputs Interativos do Usuário

Solicitar informações via diálogos VS Code (`vscode.window.showInputBox()` e `showOpenDialog()`):

**2a) Nome do Projeto:**
- Usar: `vscode.window.showInputBox()`
- Prompt: `"Qual é o nome do projeto?"`
- Placeholder: `"ex: meu-projeto-poui"`
- Validação no input:
  - Não pode ser vazio
  - Sem caracteres especiais (apenas `[a-z0-9-]`)
  - Sugestão: kebab-case (ex: `meu-projeto`, `app-core`, `dashboard-v2`)
- Se usuário cancelar (retorna undefined): **Abortar skill**

**2b) Caminho Pai (Diretório Pai):**
- Usar: `vscode.window.showOpenDialog()`
- Configuração:
  ```javascript
  {
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
    openLabel: 'Selecione a pasta para criar o projeto'
  }
  ```
- Validação:
  - Diretório deve existir (não pode ser inválido)
  - Deve ter permissão de escrita
  - A pasta `${parentPath}/${projectName}` **não pode já existir**
- Se usuário cancelar: **Abortar skill**
- Se pasta-alvo já existe: 
  ```
  ❌ Erro: Pasta '${projectName}' já existe em '${parentPath}'.
  
  Por favor, escolha outro nome ou local.
  ```

---

### Etapa 3: Invocar Agente `project-creator`

Com inputs validados, invocar o agente para orquestrar os 13 passos:

**Instruções ao Copilot (como contexto para o agente):**
```
Agente project-creator, inicie a criação de projeto com os seguintes parâmetros:

📋 Configuração:
- projectName: "${projectName}"
- parentPath: "${parentPath}"
- cliVersions: { angular: "21", poUi: "21" }

🚀 Tarefa:
Execute os 13 passos de criação do projeto Angular PO UI:
1. Criar estrutura com Angular CLI
2. Inicializar repositório Git
3. Instalar componentes PO UI
4. Instalar templates PO UI
5. Gerar environments
6. Criar módulo de desenvolvimento
7. Criar service interceptor
8. Copiar assets Eng-VeD
9. Patchar dependências
10. Instalar npm packages
11. Configurar angular.json
12. Configurar Copilot skills
13. Renomear arquivos de agentes

⏳ Reporte progresso a cada etapa com vscode.window.withProgress().
📊 Se alguma etapa falhar, capture o erro específico e reporte.
✅ Ao final, valide que o projeto foi criado corretamente.
```

**Parâmetros Passados:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `projectName` | string | Nome do projeto (kebab-case) — ex: "meu-projeto" |
| `parentPath` | string | Caminho absoluto da pasta pai — ex: "/Users/dev/projects" |
| `cliVersions` | object | Versões Angular e PO UI — ex: `{ angular: "21", poUi: "21" }` |

---

### Etapa 4: Validar Resultado da Criação

Após agente reportar conclusão, validar que o projeto foi criado corretamente:

**Success Validation Checklist:**
- ✓ Pasta `${parentPath}/${projectName}` existe
- ✓ Arquivo `${projectPath}/angular.json` existe
- ✓ Pasta `${projectPath}/.context/` existe (com agentes, skills, docs)
- ✓ Arquivo `${projectPath}/package.json` tem dependencies corretas (@angular/*, @totvs/*, @po-ui/*)
- ✓ Arquivo `${projectPath}/src/assets/data/appConfig.json` existe
- ✓ Repositório Git inicializado (`${projectPath}/.git` existe)

**Se Validação OK:**
```
✓ Projeto '${projectName}' criado com sucesso em '${projectPath}'!

Deseja abrir o novo projeto?
[Sim]  [Não]
```

- **Sim**: Executar `vscode.commands.executeCommand('vscode.openFolder', projectUri, { forceNewWindow: true })`
- **Não**: Encerrar skill

**Se Validação Falhar:**
```
⚠️ Projeto criado, mas algumas validações falharam:

Verificar:
- Arquivo missing: ${missingFiles.join(', ')}
- Estrutura incompleta em: ${incompleteDirectories.join(', ')}

O projeto está em: ${projectPath}

Você pode:
1. Tentar corrigir manualmente
2. Deletar a pasta e tentar novamente
3. Abrir em VS Code para investigar
```

**Failure Scenarios (capturados do agente):**
1. **CLI não encontrada**: "Angular CLI v21 não instalada. Instale: `npm install -g @angular/cli@21`"
2. **Pasta pai não existe**: "Caminho pai inválido. Selecione pasta válida."
3. **Diretório-alvo já existe**: "Pasta '${projectName}' já existe. Escolha outro nome."
4. **Sem espaço em disco**: "Espaço em disco insuficiente (~2GB requerido). Libere espaço e tente novamente."
5. **Git não disponível**: "Git não encontrado. Instale: https://git-scm.com/"
6. **Sem permissão de escrita**: "Sem permissão de escrita em '${parentPath}'. Verifique permissões."
7. **NPM install falhou**: "Falha ao instalar dependências npm. Verifique conexão internet."
8. **Angular CLI falhou**: "Erro ao criar estrutura Angular. Mensagem: ${errorDetails}"

---

## Input Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `projectName` | string | Sim | Nome do projeto (kebab-case, sem espaços) | `meu-projeto` |
| `parentPath` | string | Sim | Caminho absoluto da pasta pai | `/Users/dev/workspace` ou `C:\Users\dev\projects` |
| `cliVersions` | object | Sim | Versões Angular e PO UI | `{ angular: "21", poUi: "21" }` |

---

## Output Validation

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

### 📋 Pré-Requisitos (antes de começar)

```markdown
## Antes de Criar o Projeto

Verifique se você tem instalado:

- [ ] **Node.js 18+**
  ```bash
  node --version
  # Deve mostrar: v18.x.x ou superior
  ```
  Instalar: https://nodejs.org/ (LTS recomendado)

- [ ] **Git 2.30+**
  ```bash
  git --version
  # Deve mostrar: git version 2.30+
  ```
  Instalar: https://git-scm.com/

- [ ] **Angular CLI 21**
  ```bash
  ng version
  # Deve mostrar: v21.x.x
  ```
  Instalar globalmente:
  ```bash
  npm install -g @angular/cli@21
  ```

- [ ] **Espaço em Disco**: ~2GB livre
- [ ] **Conexão Internet**: Para download de dependências npm
- [ ] **Permissões de Escrita**: No diretório onde criará o projeto
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
📋 Validando pré-requisitos...
✓ Node.js v18.20.0 encontrado
✓ Git v2.45.0 encontrado
✓ Angular CLI v21.2.0 encontrado
✓ ~50GB espaço livre em disco
✓ Conexão internet disponível

Qual é o nome do projeto?
[Input Box] > meu-projeto-poui

Selecione a pasta para criar o projeto
[File Dialog] > /Users/dev/workspace

🚀 Iniciando criação do projeto...
🔄 Invocando agente project-creator...

[Progress: 1/13] Criando estrutura com Angular CLI...
[Progress: 2/13] Inicializando repositório Git...
[Progress: 3/13] Instalando componentes PO UI...
[Progress: 4/13] Instalando templates PO UI...
[Progress: 5/13] Gerando environments...
[Progress: 6/13] Criando módulo de desenvolvimento...
[Progress: 7/13] Criando service interceptor...
[Progress: 8/13] Copiando assets Eng-VeD...
[Progress: 9/13] Patchando dependências...
[Progress: 10/13] Instalando npm packages...
[Progress: 11/13] Configurando angular.json...
[Progress: 12/13] Configurando Copilot skills...
[Progress: 13/13] Renomeando arquivos de agentes...

✓ Projeto 'meu-projeto-poui' criado com sucesso em /Users/dev/workspace/meu-projeto-poui!

Deseja abrir o novo projeto?
[Sim]  [Não]

# Se Sim:
Project opened in new VS Code window
.context/agents/README.md ready to review
.context/skills/ ready to use
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
   - projectName: 'novo-projeto-angular'
   - Aguarde conclusão
   - Valide que .context/ foi criado
   - Informe ao usuário sucesso
   ```

...
```

### Exemplo 3: Fallback Command (Deprecated)

```javascript
// src/extension.ts

vscode.commands.registerCommand('extension-eng-ved.createProject', async () => {
  vscode.window.showWarningMessage(
    '⚠️ Comando descontinuado (v0.0.2).\n\n' +
    'Use skill @create-project no chat do Copilot.\n\n' +
    'Este comando será removido em v0.0.3.'
  );
  
  // Opcionalmente, delegar para skill internamente (TBD)
  // await invokeSkill('create-project');
});
```

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
