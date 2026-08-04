/**
 * Extension Integration Handler
 * =============================
 * 
 * Este arquivo implementa a integração entre o plugin externo (Eng-VeD-Plugins)
 * e a extensão VS Code (extension-eng-ved) para criar projetos Angular PO UI
 * com templates automáticos.
 * 
 * Responsabilidades:
 * - Delegar para o comando público extension-eng-ved.createProject
 * - Encaminhar opções para runCreateProjectCommand na extensão hospedeira
 * - Reportar a aceitação do comando e seus erros
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

/** Delega a criação para runCreateProjectCommand na extensão Eng-VeD. */
export async function executeCreateProjectCommand(): Promise<unknown> {
  const extension = getExtensionOrThrow();

  if (!extension.isActive) {
    await extension.activate();
  }

  return vscode.commands.executeCommand(CREATE_PROJECT_COMMAND);
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
 * 2. Obtém e ativa a extensão Eng-VeD
 * 3. Executa extension-eng-ved.createProject
 * 4. A extensão hospedeira executa runCreateProjectCommand e os 13 passos
 * 5. Retorna a aceitação ou o erro do comando
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
    await executeCreateProjectCommand();
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

