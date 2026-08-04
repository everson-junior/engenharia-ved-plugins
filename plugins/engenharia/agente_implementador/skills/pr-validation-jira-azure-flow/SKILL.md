---
name: pr-validation-jira-azure-flow
description: "Use quando: validar, revisar ou cruzar PRs Azure DevOps com JIRA TOTVS, OpenWiki, spec/plano remoto, branch, commits e evidencias de codigo; postar comentarios de review no PR correto; evitar criar PR novo quando o pedido e comentar/revisar PR existente."
argument-hint: "PR Azure DevOps, repo ou issue JIRA"
---

# Validacao de PR com JIRA e Azure DevOps

Use esta skill para revisar PRs do Azure DevOps conectando contexto do JIRA TOTVS, documentacao OpenWiki, specs/planos do proprio PR remoto e evidencias de codigo. O objetivo e produzir uma validacao objetiva, rastreavel e, quando solicitado, publicar comentario no PR correto.

## Principios

- O PR em revisao e a fonte primaria para codigo e artefatos alterados.
- O JIRA e consultado exclusivamente via ferramentas MCP JIRA.
- O Azure DevOps e consultado exclusivamente via ferramentas MCP Azure DevOps quando houver ferramenta disponivel.
- Specs e planos podem estar apenas na branch do PR; nao assuma que arquivos locais existem.
- Comentario de review em PR existente nao e abertura de PR novo.
- Nao publique comentario, vote, abandone, atualize ou crie PR sem pedido explicito do usuario.

## Quando Usar

- Usuario pede para validar um PR.
- Usuario pede para cruzar PR com JIRA, OpenWiki, spec, plano, requisitos ou criterios de aceite.
- Usuario pergunta quais PRs estao abertos e depois pede revisao/validacao.
- Usuario pede comentario de review com evidencias de codigo.
- Usuario diz para "subir", "postar", "adicionar" ou "colocar" comentario no PR.
- Existe risco de confundir PR alvo com branch atual, issue atual ou outro PR aberto.

## Quando Nao Usar

- Usuario quer criar um PR novo de uma branch local pronta para entrega. Use o fluxo de entrega/PR apropriado.
- Usuario quer apenas uma lista simples de PRs sem revisao.
- Usuario quer implementar correcao de review; use fluxo de desenvolvimento ou recebimento de code review.

## Fluxo Principal

1. **Ancorar o alvo**
   - Identifique explicitamente o PR alvo por ID, branch origem ou titulo.
   - Se houver varios PRs plausiveis, liste as opcoes e pergunte qual e o alvo.
   - Registre projeto, repo, source branch e target branch vindos do Azure DevOps.

2. **Coletar metadados do PR**
   - Use `repo_list_pull_requests_by_repo_or_project` para listar PRs quando o ID nao estiver claro.
   - Use `repo_get_pull_request_by_id` para obter detalhes do PR alvo.
   - Use `repo_get_pull_request_changes` para listar arquivos alterados e diffs.
   - Se o diff for grande, comece por arquivos de arquitetura, services, domain models, adapters/tools e testes.

3. **Buscar artefatos remotos do PR**
   - Para specs, planos e arquivos adicionados no PR, use `repo_get_file_content` na branch origem do PR.
   - Use `versionType=Branch` e `version=<nome-da-branch-sem-refs/heads/>`.
   - Se um arquivo nao existe localmente, nao trate como ausencia; busque no remoto.
   - Se `repo_get_file_content` falhar com `refs/heads/...`, tente o nome curto da branch.

4. **Cruzar com OpenWiki local**
   - Leia `openwiki/quickstart.md` para contexto geral.
   - Leia `openwiki/architecture/overview.md` para regras de arquitetura.
   - Leia `openwiki/domain-and-tools.md` para contratos, tools e padroes de dominio.
   - Leia `openwiki/testing.md` para estrategia de validacao.
   - Trate OpenWiki como guia do projeto, mas prefira o spec/plano remoto do PR para o escopo especifico da feature.

5. **Cruzar com JIRA quando houver chave**
   - Extraia chave JIRA do titulo, branch, commits, labels, descricao ou comentarios do PR.
   - Consulte a issue com `jira_get_issue`.
   - Consulte filhos/links/anexos somente se eles alterarem o escopo da validacao.
   - Nao invente criterios de aceite; declare lacunas.

6. **Validar aderencia**
   - Compare spec/plano remoto, JIRA e OpenWiki contra o codigo alterado.
   - Procure divergencias funcionais, contratos de entrada/saida, arquitetura, seguranca, mutacoes externas e testes ausentes.
   - Priorize problemas que mudam comportamento, quebram contrato ou dificultam operacao.

7. **Produzir revisao**
   - Comece por achados, ordenados por severidade.
   - Cada achado deve citar evidencia: arquivo, funcao/tool/service, comportamento esperado e comportamento implementado.
   - Explique o impacto e uma acao recomendada.
   - Se nao houver achados, declare isso e mencione riscos/testes nao verificados.

8. **Publicar comentario no PR quando solicitado**
   - Confirme o PR ID alvo a partir do contexto mais recente.
   - Use `repo_create_pull_request_thread` no PR existente.
   - Comentario geral: omita `filePath` e linhas.
   - Comentario em arquivo: use `filePath` e posicoes somente quando tiver linha exata do diff.
   - Depois de publicar, reporte `pullRequestId` e `thread id`.

## Guardrail Critico: Comentario vs Criacao de PR

Quando o usuario pedir "suba no PR", "adicione no PR", "comente no PR", "posta la" ou equivalente, interprete como publicar comentario no PR alvo ja existente, salvo se ele mencionar explicitamente criar/abrir PR novo.

Antes de criar PR novo, deve haver pedido claro como "abra um PR", "crie o PR", "suba a branch como PR" ou equivalente. Se o pedido estiver ambigue, pergunte uma unica vez.

## Evidencias de Codigo

Um comentario de review deve ter este formato:

```markdown
Ponto de atencao: <resumo do problema>.

Evidencias:
- `<arquivo>`: <funcao/classe/tool> faz <comportamento observado>.
- `<arquivo>`: <spec/teste/wiki> espera <comportamento esperado>.

Impacto: <risco pratico>.
Sugestao: <acao objetiva>.
```

Para comentario geral com multiplos achados:

```markdown
Revisei o PR contra o spec/plano remoto, OpenWiki e codigo alterado. Pontos principais:

1. <achado>
   Evidencia: `<arquivo>` ...
   Impacto: ...
   Sugestao: ...

2. <achado>
   Evidencia: `<arquivo>` ...
   Impacto: ...
   Sugestao: ...
```

Evite mencionar senioridade, julgamento pessoal ou tom pedagogico explicito. Escreva para a pessoa autora como colaborador tecnico.

## Checklist de Validacao

Antes de concluir:

- PR alvo identificado por ID.
- Branch origem e destino confirmadas pelo Azure DevOps.
- Arquivos alterados lidos via diff ou `repo_get_file_content` remoto.
- Specs/planos do PR buscados no remoto quando nao existem localmente.
- OpenWiki consultada quando o usuario pediu cruzamento com documentacao.
- JIRA consultado via MCP quando houver chave de issue relevante.
- Achados incluem evidencia e impacto.
- Nenhuma mutacao foi feita sem pedido explicito.
- Se comentou no PR, confirmou `pullRequestId` e `thread id`.

## Erros Comuns

- Usar plano/spec local de outra issue porque tem nome parecido.
- Assumir que a branch remota aceita `refs/heads/...` em `repo_get_file_content`; use nome curto se necessario.
- Confundir "postar comentario no PR" com "criar PR".
- Comentar issue JIRA quando o usuario pediu comentario no PR.
- Revisar so o diff sem ler o spec remoto adicionado no proprio PR.
- Tratar OpenWiki como criterio especifico da feature quando ha spec remoto mais atualizado.
- Dizer que validou testes sem ter evidencia de execucao ou cobertura no PR.

## Saida Final

Para revisao sem publicacao:

```text
Validacao do PR <id>:
- <achado severidade alta/media/baixa>
- <achado>

Fonte cruzada: <OpenWiki/spec/JIRA/diff>.
Pendencias: <nenhuma ou lista curta>.
```

Para comentario publicado:

```text
Comentario adicionado no PR <id>.
Thread: <thread id>.
Resumo: <1 linha do ponto principal>.
```
