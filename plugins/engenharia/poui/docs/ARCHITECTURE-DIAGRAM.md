# Architecture Diagram

## Fluxo Completo: Skill → Agent → Extension

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        VS CODE COPILOT CHAT                              │
│                         User: @create-project                            │
└──────────────────────────────────────────────────┬───────────────────────┘
                                                   │
                                ┌──────────────────▼──────────────────┐
                                │   SKILL: create-project            │
                                │ ────────────────────────────────── │
                                │  1. Validar Node.js 18+            │
                                │  2. Validar Git 2.30+              │
                                │  3. Validar Angular CLI 21         │
                                │  4. Coletar inputs interativos:    │
                                │     - projectName (kebab-case)     │
                                │     - parentPath (absoluto)        │
                                │  5. Invocar Agent                  │
                                └──────────────────┬──────────────────┘
                                                   │
                                ┌──────────────────▼──────────────────┐
                                │   AGENT: project-creator            │
                                │ ────────────────────────────────── │
                                │  1. Verifica a extensão instalada │
                                │  2. Ativa se necessário            │
                                │  3. Executa comando sem argumentos │
                                │  4. Aguarda os diálogos da extensão│
                                └──────────────────┬──────────────────┘
                                                   │
                        ┌──────────────────────────▼───────────────────────┐
                        │ EXTENSÃO HOSPEDEIRA: extension.ts               │
                        │ ─────────────────────────────────────────────── │
                        │  • Registra extension-eng-ved.createProject    │
                        │  • Abre os diálogos oficiais do VS Code         │
                        │  • Executa o terminal e os 13 passos            │
                        └──────────────────┬───────────────────────────────┘
                                           │
                        ┌──────────────────▼───────────────────────────────┐
                        │  EXTENSION: extension-eng-ved                   │
                        │  ─────────────────────────────────────────────  │
                        │                                                  │
                        │  Core Services:                                  │
                        │  ┌──────────────────────────────────────────┐  │
                        │  │ VsCodeTemplateAdapter                    │  │
                        │  │ ─ loadTemplates(extensionPath)           │  │
                        │  │ ─ validateTemplates() [fail-fast]        │  │
                        │  │ ─ applyProjectName(projectName)          │  │
                        │  │ ─ getTemplateMapping()                   │  │
                        │  │ ─ TEMPLATE_MAPPING (25 templates)        │  │
                        │  └──────────────────────────────────────────┘  │
                        │                                                  │
                        │  ┌──────────────────────────────────────────┐  │
                        │  │ ProjectCreationOrchestrator              │  │
                        │  │ ─ buildStepSequence() [13 steps]        │  │
                        │  │ ─ executeProjectCreation()               │  │
                        │  │ ─ applyTemplates()                       │  │
                        │  │ ─ deleteObsoleteFiles()                  │  │
                        │  │ ─ CLI_AUTOMATION_ENV (6 vars)           │  │
                        │  │ ─ createProjectWithTemplates()          │  │
                        │  └──────────────────────────────────────────┘  │
                        │                                                  │
                        │  ┌──────────────────────────────────────────┐  │
                        │  │ src/templates/ (25 arquivos)            │  │
                        │  │ ├─ app.component.ts.template            │  │
                        │  │ ├─ app.config.ts.template               │  │
                        │  │ ├─ app.routes.ts.template               │  │
                        │  │ ├─ home.component.ts.template           │  │
                        │  │ ├─ interceptor.ts.template              │  │
                        │  │ ├─ main.ts.template                     │  │
                        │  │ ├─ ... (outros templates)                │  │
                        │  │ └─ mcp.json.template                    │  │
                        │  └──────────────────────────────────────────┘  │
                        │                                                  │
                        │  CLI Commands Executados (com automação):       │
                        │  ┌──────────────────────────────────────────┐  │
                        │  │ Step 1:  ng new ${projectName}           │  │
                        │  │ Step 3:  ng add @po-ui/ng-components     │  │
                        │  │ Step 4:  ng add @po-ui/ng-templates      │  │
                        │  │ Step 5:  ng generate environments        │  │
                        │  │ Step 6:  ng generate module              │  │
                        │  │ Step 7:  ng generate service             │  │
                        │  │ Step 9:  npm install                     │  │
                        │  │ Step 10-13: Config validation            │  │
                        │  │                                           │  │
                        │  │ Environment Variables (injetadas):        │  │
                        │  │ • NG_CLI_ANALYTICS=ci                    │  │
                        │  │ • CI=true                                │  │
                        │  │ • FORCE_COLOR=0                          │  │
                        │  │ • npm_config_update_notifier=false       │  │
                        │  │ • npm_config_fund=false                  │  │
                        │  │ • npm_config_audit=false                 │  │
                        │  │                                           │  │
                        │  │ Flags CLI (por comando):                  │  │
                        │  │ • --skip-confirmation --defaults         │  │
                        │  │ • --flat=false --skip-tests              │  │
                        │  │ • --legacy-peer-deps --no-fund           │  │
                        │  └──────────────────────────────────────────┘  │
                        │                                                  │
                        └──────────────────┬───────────────────────────────┘
                                           │
                        ┌──────────────────▼───────────────────────────────┐
                        │  RESULT: CreateProjectResult                    │
                        │  ────────────────────────────────              │
                        │  {                                              │
                        │    status: 'SUCCESS' | 'FAILED' | 'CANCELLED'   │
                        │    message: string                              │
                        │    projectPath?: string                         │
                        │    error?: Error                                │
                        │  }                                              │
                        └──────────────────┬───────────────────────────────┘
                                           │
                        ┌──────────────────▼───────────────────────────────┐
                        │  NEW PROJECT CREATED                            │
                        │  ────────────────────────────────────          │
                        │  ${projectPath}/                               │
                        │  ├─ .context/                                  │
                        │  │  ├─ agents/ (padrão Eng-VeD)              │
                        │  │  ├─ skills/ (padrão Eng-VeD)              │
                        │  │  └─ docs/ (padrão Eng-VeD)                │
                        │  │                                             │
                        │  ├─ src/                                       │
                        │  │  ├─ app/                                   │
                        │  │  │  ├─ app.component.ts  (template)       │
                        │  │  │  ├─ app.config.ts     (template)       │
                        │  │  │  ├─ app.routes.ts     (template)       │
                        │  │  │  ├─ app-initializer.ts (template)      │
                        │  │  │  ├─ home/                              │
                        │  │  │  └─ services/                          │
                        │  │  └─ main.ts (template)                    │
                        │  │                                             │
                        │  ├─ angular.json  (configurado)              │
                        │  ├─ package.json  (dependências OK)          │
                        │  ├─ tsconfig.json                            │
                        │  ├─ .git/ (inicializado)                     │
                        │  ├─ .gitignore                               │
                        │  ├─ README.md                                │
                        │  └─ ... (outros arquivos)                    │
                        │                                                │
                        │  Opened in VS Code:                            │
                        │  ✓ New window                                 │
                        │  ✓ README.md pronto                           │
                        │  ✓ Next steps sugeridos                       │
                        └────────────────────────────────────────────────┘
```

## Data Flow

```
User Input
    ↓
@create-project
    ↓
  Agent: project-creator
    ├─ verifica totvs.extension-eng-ved
    ├─ ativa a extensão se necessário
    └─ executa extension-eng-ved.createProject sem argumentos
      ↓
  Extensão hospedeira
    ├─ mostra os diálogos do VS Code
    ├─ executa os comandos no terminal
    └─ conduz os 13 passos e reporta o resultado ao usuário
```

## Dependency Injection Pattern

```
Extension                   Plugin
     │                        │
     ├─ VsCodeTemplateAdapter │
     │   └─ loadTemplates()   │
     │       └─ reads         │
     │           src/templates├─ injects via
     │           (25 files)   │ templateService
     │                        │ parameter
     ├─ createProjectWithTemplates({
     │     config,
     │     templateService ◄──┘
     │   })
     │   └─ executes 13 steps
     │       └─ returns result
```

## Automation Strategy

```
CLI AUTOMATION (100% Non-Interactive)

Environment Variables (6):
  NG_CLI_ANALYTICS=ci          ← Suprimir analytics prompt
  CI=true                      ← CI environment flag
  FORCE_COLOR=0                ← Clean logs
  npm_config_update_notifier=false ← Suprimir updater
  npm_config_fund=false        ← Suprimir funding messages
  npm_config_audit=false       ← Suprimir audit warnings

CLI Flags (por comando):
  ng new:          --skip-confirmation --package-manager=npm
  ng add:          --skip-confirmation --defaults
  ng generate:     --defaults --flat=false --skip-tests
  npm install:     --legacy-peer-deps --no-fund --no-audit

Result:
  ✓ Zero interactive prompts
  ✓ Reproducible in CI/CD
  ✓ Progress reported via callback
  ✓ All errors captured
```

## Success Flow

```
createProjectWithTemplates()
    ├─ [1/13] Validate extension
    ├─ [2/13] Activate extension
    ├─ [3/13] Load template service
    ├─ [4/13] Initialize adapter
    ├─ [5/13] Validate templates (25)
    ├─ [6/13] ng new
    ├─ [7/13] ng add @po-ui/ng-components
    ├─ [8/13] ng add @po-ui/ng-templates
    ├─ [9/13] ng generate environments
    ├─ [10/13] Apply templates
    ├─ [11/13] Configure angular.json
    ├─ [12/13] npm install
    ├─ [13/13] Validate result
    │
    └─ return {
         status: 'SUCCESS',
         message: '✅ Project created at ...',
         projectPath: '/path/to/project'
       }
```

## Error Flow

```
createProjectWithTemplates()
    ├─ Extension not found
    │   └─ return FAILED: 'Extension TOTVS.extension-eng-ved not found'
    │
    ├─ Template validation fails
    │   └─ return FAILED: 'Missing templates: app.component.ts, ...'
    │
    ├─ CLI execution fails
    │   └─ return FAILED: 'ng new failed: ...'
    │
    ├─ npm install fails
    │   └─ return FAILED: 'npm install failed: ...'
    │
    └─ return {
         status: 'FAILED',
         message: 'Error at step X: ...',
         error: Error object
       }
```

---

**Last Updated**: 2026-08-04  
**Formato**: ASCII Diagrams  
**Purpose**: Visualizar arquitetura da integração
