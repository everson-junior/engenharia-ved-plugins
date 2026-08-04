---
name: jira-attached-plan-flow
description: "Use quando: uma issue JIRA TOTVS menciona plano, desenho tecnico, especificacao, evidencia, notas de rollout ou documento em anexo; usuario quer conduzir SDD/TDD incremental a partir do JIRA; ha risco de confundir anexo JIRA com arquivo local; precisa decidir entre criar design, gerar plano de desenvolvimento ou codificar a partir de plano anexado; precisa anexar artefatos gerados de volta na issue."
argument-hint: "Issue JIRA com artefato/anexo"
---

# Fluxo de Artefato Anexado ao JIRA

## Visao Geral
Use quando a fonte da verdade for uma issue JIRA TOTVS ou um anexo dela. Primeiro consulte a issue pelo MCP JIRA, inventarie anexos, preserve a proveniencia e decida o proximo passo incremental: criar design com o usuario, transformar design em plano de desenvolvimento ou executar codificacao com SDD/TDD.

## Regra Obrigatoria de Consulta JIRA

Consulte issues, anexos e metadados JIRA exclusivamente pelas ferramentas MCP JIRA. Nao use API JIRA direta, `requests`, `curl`, navegador, script local ou arquivo exportado como substituto para consultar JIRA. Se a ferramenta MCP necessaria nao existir ou falhar, declare o bloqueio e peca orientacao ao usuario; nao contorne pelo acesso direto a API.

## Regra Obrigatoria de Reanexo

Quando esta skill gerar uma spec, plano de desenvolvimento, handoff, nota de validacao ou outro artefato persistente a partir de uma issue JIRA TOTVS, anexe o arquivo gerado de volta na issue correta usando exclusivamente a ferramenta MCP JIRA de anexos. Se a ferramenta MCP de anexo nao estiver disponivel ou falhar, declare o bloqueio e nao tente anexar por API direta, `curl`, navegador ou script local. Comentarios, worklogs, transicoes e outras mutacoes continuam exigindo pedido explicito do usuario.

## Regra de Path no Runtime

Ao anexar um arquivo local, resolva o `file_path` no mesmo filesystem do processo MCP. Se o servidor MCP estiver em Docker, um caminho absoluto do host pode ser invalido mesmo que o arquivo exista localmente. Neste repositorio, o workspace e montado em `/workspace` dentro do container; portanto, specs e planos gerados em `docs/superpowers/...` devem ser anexados com caminhos como `/workspace/docs/superpowers/...`. Diante de `File not found`, cheque primeiro a visibilidade do arquivo no runtime do MCP antes de tratar como ausencia real do artefato.

## Regra de Criacao de Issues

Se o fluxo a partir de anexo, spec ou plano resultar em criacao de issues, pergunte sempre qual e a issue pai/Epico antes de criar qualquer item, mesmo que a issue fonte esteja no contexto. Para itens de trabalho sob Epico, use `Epic Link` (`customfield_10001`) no `jira_create_issue`; nao use links genericos para representar `Issues in epic`, salvo pedido explicito do usuario.

## Quando Usar
- Plano, desenho tecnico ou especificacao esta anexado ao JIRA.
- A issue JIRA nao tem plano anexo e o usuario quer iniciar o fluxo assistido por IA.
- Existe um plano de design e o proximo passo e criar plano de desenvolvimento.
- Existe um plano de desenvolvimento e o proximo passo e codificar seguindo SDD/TDD.
- O fluxo gera spec, plano, nota ou evidencia que precisa voltar como anexo na issue JIRA.
- Usuario menciona evidencia, CSV, notas de rollout, PDF, handoff, comentario ou texto de worklog vindo do JIRA.
- Existem arquivos locais parecidos, mas sem comprovacao de correspondencia com os metadados atuais do JIRA.
- A chave da issue foi corrigida apos erro de digitacao ou diferenca de caixa.

## Quando Nao Usar
- O pedido nao envolve JIRA TOTVS, anexo JIRA, artefato de planejamento ou continuidade de SDD.
- O usuario ja forneceu um arquivo local como fonte explicita e nao ha indicio de que ele vem do JIRA.
- O pedido e apenas explicar codigo local, sem depender de contexto ou artefato JIRA.

## Fluxo
1. Normalize a chave corrigida da issue para maiusculas e leia a issue correta. A correcao invalida suposicoes feitas a partir da chave errada.
2. Busque apenas o contexto JIRA necessario: campos primeiro; filhos e links somente se o escopo depender deles.
3. Inventarie anexos antes de arquivos locais: nome, tipo, tamanho/data se disponivel, id/URL no JIRA e finalidade provavel.
4. Classifique os anexos em tres niveis quando possivel: evidencia/contexto, plano de design/especificacao, plano de desenvolvimento/implementacao.
5. Selecione por intencao. Se nome, tipo ou pedido forem claros, prossiga; se varios candidatos ainda forem plausiveis, faca uma unica pergunta objetiva listando as opcoes.
6. Baixe somente o artefato selecionado, exceto quando o pedido exigir varios.
7. Salve artefatos fonte em `docs/superpowers/artifacts/<ISSUE>/`; salve specs geradas em `docs/superpowers/specs/`; salve planos de implementacao gerados em `docs/superpowers/plans/`.
8. Anexe cada artefato gerado de volta na issue correta via MCP JIRA, usando o path visivel ao runtime do MCP, e registre o id/URL retornado quando disponivel.
9. Registre a proveniencia: chave da issue, nome/id ou URL do anexo fonte, caminho local, finalidade, nivel do fluxo, id/URL do anexo gerado e candidatos ignorados quando isso afetar a confianca.
10. Encaminhe pelo estado incremental abaixo. Nao pule etapas: design aprovado vira plano; plano aprovado vira execucao; execucao usa SDD/TDD.

## Estados Incrementais SDD TOTVS

### Estado 0: Sem Plano Anexo
Use quando a issue nao traz plano, desenho tecnico ou especificacao suficiente para implementacao.

1. Consulte a issue pelo MCP JIRA e extraia objetivo, contexto, criterios de aceite e restricoes existentes.
2. Declare lacunas sem inventar criterio de aceite.
3. Use `brainstorming` para criar o plano de design interagindo com o usuario.
4. Salve o design aprovado em `docs/superpowers/specs/YYYY-MM-DD-<tema>-design.md`.
5. Anexe a spec de design gerada de volta na issue via MCP JIRA.
6. Pare antes do plano de desenvolvimento ate o usuario aprovar o design salvo e anexado.

### Estado 1: Design/Especificacao Disponivel
Use quando houver anexo de design, especificacao, desenho tecnico ou spec local com proveniencia JIRA.

1. Baixe ou localize a spec com proveniencia registrada.
2. Leia apenas o contexto local necessario para transformar a spec em tarefas implementaveis.
3. Use `writing-plans` para gerar plano de desenvolvimento em `docs/superpowers/plans/YYYY-MM-DD-<tema>.md`.
4. O plano deve orientar SDD/TDD, conter passos pequenos, testes, comandos de validacao e referencia explicita ao uso de `subagent-driven-development` ou `executing-plans`.
5. Anexe o plano de desenvolvimento gerado de volta na issue via MCP JIRA.
6. Pare antes da codificacao ate o usuario aprovar a execucao do plano salvo e anexado.

### Estado 2: Plano de Desenvolvimento Disponivel
Use quando houver plano de implementacao anexado ao JIRA ou salvo com proveniencia JIRA.

1. Baixe ou localize o plano de desenvolvimento e confirme que ele corresponde a issue correta.
2. Revise rapidamente se o plano tem tarefas executaveis, testes e comandos. Se houver lacuna bloqueante, volte para `writing-plans` para corrigir o plano antes de codificar.
3. Para execucao na sessao atual, use `subagent-driven-development` quando as tarefas forem independentes; use `executing-plans` quando o trabalho exigir execucao linear no proprio contexto.
4. Durante a codificacao, use `test-driven-development` para cada feature, bugfix ou mudanca de comportamento, salvo excecao explicita do usuario.
5. Valide com o comando mais estreito aplicavel e registre resultado para comentario, worklog ou handoff quando solicitado.
6. Se a execucao gerar handoff, nota de validacao, evidencia ou plano ajustado, salve o artefato e anexe de volta na issue via MCP JIRA.

## Referencia Rapida

| Situacao | Acao |
|-----------|--------|
| Issue sem plano anexo | Consulte pelo MCP JIRA, use `brainstorming`, gere spec de design e pare antes do plano de desenvolvimento |
| Artefato gerado localmente | Anexe de volta na issue via MCP JIRA e registre id/URL retornado |
| Ha design/especificacao anexa | Baixe a fonte, use `writing-plans`, gere plano de desenvolvimento, anexe de volta e pare antes da codificacao |
| Ha plano de desenvolvimento anexo | Baixe a fonte, use `subagent-driven-development` ou `executing-plans`; aplique `test-driven-development` nas mudancas |
| Usuario pede para criar issues | Pergunte a issue pai/Epico; crie sob `Epic Link` (`customfield_10001`) quando for trabalho sob Epico |
| Erro como `DVARNEGIA-185` | Informe brevemente que nao encontrou, aceite a correcao e normalize para `DVARENGIA-185` |
| Usuario diz "plano em anexo" | Inventarie anexos, selecione o artefato de plano/desenho/especificacao e baixe antes de procurar arquivos locais |
| Existem varios anexos | Relacione primeiro pela intencao; faca uma pergunta objetiva somente se os candidatos continuarem ambiguos |
| Existe arquivo local parecido | Trate como evidencia secundaria ate casar com metadados/proveniencia do JIRA |
| Nao ha ferramenta MCP para baixar | Declare o bloqueio e peca orientacao ou o anexo ao usuario; nao contorne com API direta |
| Usuario pede "plano primeiro" | Crie apenas o plano; sem implementacao |

## Roteamento por Intencao

| Intencao do usuario | Artefato provavel | Proximo passo |
|-------------|-----------------|-----------|
| Iniciar do zero a partir da issue | Sem plano anexo, descricao JIRA, criterios de aceite | Use `brainstorming`; salve a spec gerada em `docs/superpowers/specs/`; anexe de volta; pare antes do plano |
| Plano de desenvolvimento a partir de design | `.md`, `.txt`, documento de desenho/especificacao | Use `writing-plans`; salve o plano gerado em `docs/superpowers/plans/`; anexe de volta; pare antes da codificacao |
| Codificacao a partir de plano | Plano de implementacao com tarefas, testes e comandos | Use `subagent-driven-development` ou `executing-plans`; use `test-driven-development` durante a execucao |
| Comentario JIRA, handoff, nota de release | notas de rollout, resumo, nota de validacao | Use `jira-delivery-scribe`; publique somente se o usuario pediu mutacao no JIRA |
| Descricao de worklog | nota de tarefa, resumo de entrega | Use `jira-delivery-scribe`; registre tempo somente quando houver tempo explicito |
| Evidencia ou resumo de validacao | `.csv`, relatorio exportado, screenshot, log | Resuma a evidencia relevante; evite afirmar validacao que os dados nao mostram |
| Continuidade a partir de outro anexo | Qualquer anexo da mesma issue | Reuse inventario/proveniencia se disponivel; caso contrario, reinspecione metadados |

## Erros Comuns
- Usar arquivo local parecido antes dos metadados do JIRA. Verifique a proveniencia primeiro.
- Criar design, plano ou codigo sem consultar a issue pelo MCP JIRA. O MCP e a fonte obrigatoria para contexto JIRA.
- Gerar spec/plano e deixar apenas local. Artefatos persistentes do fluxo devem voltar como anexo na issue correta via MCP JIRA.
- Baixar todos os anexos. Inventarie e baixe apenas o que a intencao exige.
- Pular do Estado 0 direto para codificacao. Primeiro crie e aprove design; depois gere plano; so entao execute.
- Tratar design como plano de desenvolvimento. Design define o que e por que; plano de desenvolvimento define tarefas, arquivos, testes e comandos.
- Ler codigo amplo antes do artefato fonte. Obtenha a fonte primeiro e depois inspecione de forma estreita.
- Iniciar implementacao apos criar o plano sem aprovacao. Pare e ofereca modo de execucao.
- Pedir o anexo antes de checar acesso ao JIRA. Tente primeiro o caminho JIRA nao mutante.
- Tratar texto de worklog como permissao para registrar horas. Exija tempo explicito.
- Criar issues a partir de um plano usando links genericos ou uma issue pai presumida. Pergunte o Epico/issue pai e use `Epic Link` (`customfield_10001`) para `Issues in epic`.

## Saida de Conclusao
Ao concluir, inclua:
- chave corrigida da issue;
- estado incremental executado: sem plano, design para plano, ou plano para codificacao;
- nome/id ou URL do anexo e caminho baixado, quando houver;
- caminho do artefato gerado quando uma spec ou plano foi criado;
- id/URL do anexo criado de volta no JIRA ou bloqueio encontrado para anexar;
- candidatos ignorados quando isso afetar a confianca;
- resultado da validacao executada ou motivo de nao ter havido validacao executavel;
- nota explicita quando o desenvolvimento nao comecou;
- opcoes de execucao ou publicacao para o proximo passo.