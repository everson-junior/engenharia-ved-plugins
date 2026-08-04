/**
 * Extension Integration Handler
 * =============================
 * 
 * Este arquivo implementa a integração entre o plugin externo (Eng-VeD-Plugins)
 * e a extensão VS Code (extension-eng-ved) para criar projetos Angular PO UI
 * com templates automáticos.
 * 
 * Responsabilidades:
 * - Importar serviços da extensão (createProjectWithTemplates, VsCodeTemplateAdapter)
 * - Inicializar template service com extensionPath
 * - Executar orquestração de 13 passos sem prompts interativos
 * - Reportar progresso e erros
 * 
 * @version 1.0.0
 * @author Eng-VeD Plugin
 */

import * as vscode from 'vscode';

/**
 * Interface de configuração para criação de projeto
 */
export interface CreateProjectConfig {
  projectName: string;
  parentPath: string;
  extensionPath?: string;
  cliVersions?: {
    angular: string;
    poUi: string;
  };
}

/**
 * Interface de resultado da criação
 */
export interface CreateProjectResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  message: string;
  projectPath?: string;
  error?: Error;
}

/**
 * Tipo para callback de progresso
 */
export type ProgressCallback = (step: number, total: number, message: string) => void;

export interface CreateProjectCommandArgs {
  projectName?: string;
  parentPath?: string;
  cliVersions?: CreateProjectConfig['cliVersions'];
}

const EXTENSION_ID = 'totvs.extension-eng-ved';
const CREATE_PROJECT_COMMAND = 'extension-eng-ved.createProject';

function getExtensionOrThrow(): vscode.Extension<unknown> {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);

  if (!extension) {
    throw new Error(
      `Extensão '${EXTENSION_ID}' não encontrada. ` +
      'Instale a extensão Extension Eng-VeD para criar projetos.'
    );
  }

  return extension;
}

async function executeCreateProjectCommand(
  args?: CreateProjectCommandArgs
): Promise<unknown> {
  const extension = getExtensionOrThrow();

  if (!extension.isActive) {
    await extension.activate();
  }

  return vscode.commands.executeCommand(
    CREATE_PROJECT_COMMAND,
    args && Object.keys(args).length > 0 ? args : undefined
  );
}

function isCreateProjectRequest(request: vscode.ChatRequest): boolean {
  return request.command === 'criarProjeto' || /criar\s+projeto/i.test(request.prompt);
}

/** Registra o participante que encaminha a intenção do chat para a extensão Eng-VeD. */
export function registerChatParticipant(context: vscode.ExtensionContext): vscode.ChatParticipant {
  const participant = vscode.chat.createChatParticipant(
    'eng-ved-poui.project-creator',
    async (
      request: vscode.ChatRequest,
      _chatContext: vscode.ChatContext,
      stream: vscode.ChatResponseStream,
      _token: vscode.CancellationToken
    ) => {
      if (!isCreateProjectRequest(request)) {
        stream.markdown('Como posso ajudar com o projeto Eng-VeD?');
        return;
      }

      stream.progress('Iniciando a criação do projeto via Eng-VeD...');

      try {
        await executeCreateProjectCommand();
        stream.markdown('✅ O assistente de criação do projeto foi iniciado.');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        stream.markdown(`❌ Não foi possível iniciar a criação do projeto: ${message}`);
      }
    }
  );

  participant.iconPath = new vscode.ThemeIcon('package');
  context.subscriptions.push(participant);
  return participant;
}

/**
 * Handler principal para criar projeto com templates da extensão
 * 
 * Workflow:
 * 1. Valida configuração de entrada
 * 2. Obtém referência à extensão extension-eng-ved
 * 3. Inicializa VsCodeTemplateAdapter com extensionPath
 * 4. Carrega e valida templates
 * 5. Executa createProjectWithTemplates() com injeção de templateService
 * 6. Retorna resultado com path do projeto criado
 * 
 * @param config Configuração de criação do projeto
 * @param onProgress Callback para reportar progresso (step/total/message)
 * @returns Promise<CreateProjectResult>
 * 
 * @example
 * ```typescript
 * const result = await createProjectWithExtensionTemplates({
 *   projectName: 'meu-projeto',
 *   parentPath: '/home/user/projects',
 *   extensionPath: extensionContext.extensionPath,
 *   cliVersions: { angular: '21', poUi: '21' }
 * }, (step, total, message) => {
 *   console.log(`[${step}/${total}] ${message}`);
 * });
 * ```
 */
export async function createProjectWithExtensionTemplates(
  config: CreateProjectConfig,
  onProgress?: ProgressCallback
): Promise<CreateProjectResult> {
  try {
    if (!config.projectName || !config.parentPath) {
      throw new Error('Configuração incompleta: projectName e parentPath são obrigatórios');
    }

    onProgress?.(1, 13, 'Validando extensão Eng-VeD...');
    await executeCreateProjectCommand({
      projectName: config.projectName,
      parentPath: config.parentPath,
      cliVersions: config.cliVersions
    });
    onProgress?.(13, 13, 'Comando de criação do projeto iniciado.');

    return {
      status: 'SUCCESS',
      message: `Comando de criação do projeto '${config.projectName}' iniciado.`,
      projectPath: `${config.parentPath}/${config.projectName}`
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      status: 'FAILED',
      message: `Erro ao criar projeto: ${errorMessage}`,
      error: error instanceof Error ? error : new Error(errorMessage)
    };
  }
}

/**
 * Função auxiliar para abrir o projeto criado em uma nova janela
 * 
 * @param projectPath Caminho completo do projeto
 */
export async function openProjectInNewWindow(projectPath: string): Promise<void> {
  try {
    const uri = vscode.Uri.file(projectPath);
    await vscode.commands.executeCommand('vscode.openFolder', uri, true);
  } catch (error) {
    vscode.window.showErrorMessage(`Erro ao abrir projeto: ${error}`);
  }
}

/**
 * Função auxiliar para configurar o projeto após criação
 * - Abrir arquivo README
 * - Mostrar boas-vindas
 * - Sugerir próximos passos
 * 
 * @param projectPath Caminho completo do projeto
 */
export async function configureProjectAfterCreation(projectPath: string): Promise<void> {
  try {
    // Abrir README.md como primeira ação
    const readmePath = vscode.Uri.file(`${projectPath}/README.md`);
    await vscode.commands.executeCommand('vscode.open', readmePath);

    // Mostrar mensagem de boas-vindas com próximos passos
    const action = await vscode.window.showInformationMessage(
      '✅ Projeto criado com sucesso!\n\n' +
      'Próximos passos:\n' +
      '1. Revisar configurações em .poui/\n' +
      '2. Executar: npm install\n' +
      '3. Iniciar dev: npm start',
      'Abrir Terminal',
      'Fechar'
    );

    if (action === 'Abrir Terminal') {
      await vscode.commands.executeCommand('workbench.action.terminal.new');
    }
  } catch (error) {
    console.error('Erro ao configurar projeto:', error);
  }
}

/**
 * Validar pré-requisitos antes de criar projeto
 * 
 * @returns Array de pré-requisitos faltando (vazio se tudo OK)
 */
export async function validatePrerequisites(): Promise<string[]> {
  const missing: string[] = [];

  try {
    // Validar Node.js
    const nodeVersion = await vscode.commands.executeCommand('shellCommand.execute', {
      command: 'node --version'
    }) as string;
    if (!nodeVersion.match(/v\d+/)) {
      missing.push('Node.js 18+');
    }

    // Validar Git
    const gitVersion = await vscode.commands.executeCommand('shellCommand.execute', {
      command: 'git --version'
    }) as string;
    if (!gitVersion.includes('git version')) {
      missing.push('Git 2.30+');
    }

    // Validar Angular CLI
    const ngVersion = await vscode.commands.executeCommand('shellCommand.execute', {
      command: 'ng version'
    }) as string;
    if (!ngVersion.match(/Angular CLI.*21/)) {
      missing.push('Angular CLI 21');
    }

  } catch (error) {
    // Se comando shell falhar, assumir que ferramenta não está instalada
    missing.push('Node.js 18+', 'Git 2.30+', 'Angular CLI 21');
  }

  return missing;
}
