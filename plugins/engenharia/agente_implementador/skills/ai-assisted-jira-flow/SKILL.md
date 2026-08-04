---
name: ai-assisted-jira-flow
description: "Use quando: conduzir desenvolvimento assistido por IA a partir de uma issue JIRA TOTVS, planejar implementacao, consultar MCP JIRA, validar codigo, preparar comentarios, worklogs e transicoes de entrega."
argument-hint: "Issue JIRA ou objetivo de desenvolvimento"
---
# Fluxo JIRA com Desenvolvimento Assistido por IA

Use esta skill para conduzir um ciclo de desenvolvimento assistido por IA conectado ao JIRA TOTVS pelo servidor MCP local.

## Regra Obrigatoria de Consulta JIRA

Toda consulta a issues, anexos, comentarios, filhos, links, usuarios, projetos, campos, transicoes, worklogs ou qualquer outro dado JIRA deve ser feita exclusivamente pelas ferramentas MCP JIRA disponiveis. Nao use chamadas diretas a API JIRA, scripts `requests`, navegador, curl, arquivos exportados ou outro caminho paralelo para consultar JIRA quando uma ferramenta MCP existir.

Use a skill `jira-api-totvs-reference` apenas para desenvolver ou depurar o proprio servidor MCP/cliente interno. Ela nao substitui o MCP em consultas operacionais de issues.

## Quando Usar
- O usuario fornece uma chave de issue JIRA e pede ajuda de implementacao.
- O usuario quer transformar contexto do JIRA em plano tecnico.
- O usuario pede um fluxo de desenvolvimento que atualiza comentarios, worklogs, rotulos, links ou transicoes no JIRA.
- O usuario pede criacao de issues, stories, tarefas, subtarefas ou demandas relacionadas a um Epico/issue pai.
- O usuario precisa de uma passagem confiavel entre descoberta da issue, validacao de codigo e notas de entrega.

## Fluxo
1. **Ancore o trabalho**
   - Identifique a chave da issue, objetivo ou criterios de aceite.
   - Se nenhuma chave for fornecida, peca uma ou prossiga pelo objetivo declarado sem mutacao no JIRA.

2. **Leia o contexto do JIRA**
   - Busque a issue exclusivamente com `jira_get_issue`.
   - Busque filhos exclusivamente com `jira_get_issue_children` quando o escopo pai-filho puder importar.
   - Busque links exclusivamente com `jira_list_issue_links` quando dependencias ou issues relacionadas puderem afetar o escopo.
   - Use ferramentas de projeto, usuario, componente, versao, campo customizado, watcher e worklog somente quando responderem a uma pergunta concreta.

3. **Conecte com o codigo**
   - Procure o adapter, service, modelo de dominio, formatter ou teste responsavel.
   - Prefira padroes existentes em `src/iajira_mcp` e `tests`.
   - Declare uma hipotese local e uma validacao barata antes de editar.

4. **Planeje e implemente**
   - Mantenha o plano pequeno: contexto, edicao, validacao e atualizacao JIRA.
   - Implemente a menor mudanca util.
   - Evite refatoracoes sem relacao.

5. **Valide**
   - Rode primeiro o teste relevante mais estreito.
   - Use a suite completa somente quando a mudanca tocar comportamento compartilhado.
   - Registre comando e resultado para o resumo final ou comentario JIRA.

6. **Publique atualizacoes de entrega**
   - Use `jira_add_comment` somente quando solicitado ou aprovado.
   - Quando a propria entrega pedir rastreabilidade de IA, aplique `jira_manage_labels` com `add_labels=["IA_Copilot", "Vibecoding"]` na issue assim que a implementacao comecar ou antes de concluir a entrega.
   - Use `jira_add_worklog` ou `jira_update_worklog` somente quando o desenvolvedor fornecer tempo explicito.
   - Use `jira_transition_issue` somente apos confirmar a transicao alvo e consultar as transicoes disponiveis.

## Criacao de Issues sob Epico

Quando o usuario pedir para criar uma ou mais issues, pergunte sempre qual e a issue pai/Epico antes de chamar `jira_create_issue`, mesmo que exista uma issue recente no contexto da conversa. A issue pai deve ser uma chave JIRA explicita confirmada pelo usuario ou ja declarada no pedido atual.

Para trabalho entregue sob um Epico, crie preferencialmente `Story` e vincule usando `Epic Link` (`customfield_10001`) no payload de criacao. Nao use `jira_create_issue_link` nem links genericos como `Relates`, `Blocks` ou similares para representar relacao pai-filho/Issues in epic, exceto se o usuario pedir explicitamente esse tipo de link.

Antes da criacao, valide a issue pai com `jira_get_issue` quando houver duvida se ela e o Epico correto, e declare no resumo final a chave criada, a issue pai e o campo `customfield_10001` usado.

## Confirmacao para Ferramentas Mutantes
Sempre peca confirmacao antes de usar:
- `jira_create_issue` com issue pai/Epico explicitamente confirmado e vinculo por `Epic Link` (`customfield_10001`) quando for trabalho sob Epico
- `jira_update_issue`
- `jira_delete_issue`
- `jira_transition_issue`
- `jira_manage_labels`
- `jira_create_issue_link`
- `jira_delete_issue_link`
- `jira_add_watcher`
- `jira_remove_watcher`
- `jira_attach_file`
- `jira_add_worklog`, exceto quando o usuario pediu explicitamente para registrar o tempo informado

Excecao: quando o usuario aprovar a execucao da issue atual e o objetivo explicitamente exigir rastreabilidade de IA, `jira_manage_labels` pode aplicar `IA_Copilot` e `Vibecoding` e dispense nova confirmacao na mesma sessao. Essa excecao nao cobre outros labels.

## Modelo de Comentario
Use esta estrutura concisa para comentarios JIRA:

```markdown
Atualizacao de desenvolvimento assistido por IA:

- Contexto analisado: <issue/children/links/code path>
- Alteracoes realizadas: <files or behavior>
- Validacao: <command> -> <result>
- Pendencias/riscos: <none or explicit list>
```

## Lista de Verificacao de Conclusao
Antes de afirmar conclusao:
- O caminho de codigo relevante foi identificado.
- A implementacao segue a arquitetura e o estilo locais.
- Pelo menos uma validacao focada foi executada, ou o motivo de nao executar foi declarado.
- Mutacoes no JIRA foram feitas com aprovacao ou explicitamente ignoradas.
- Riscos restantes foram descritos de forma direta.
