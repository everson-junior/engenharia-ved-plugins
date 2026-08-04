---
name: mcp-builder
description: "Use quando criar servidores MCP de alta qualidade para integrar APIs ou servicos externos, em Python/FastMCP ou Node/TypeScript. Use para projetar ferramentas, schemas, transporte, tratamento de erros, testes e avaliacoes MCP."
license: Complete terms in LICENSE.txt
---

# Guia de Desenvolvimento de Servidores MCP

Use esta skill para criar servidores MCP que ajudam LLMs a executar tarefas reais com ferramentas bem descritas, seguras e testaveis.

## Principio Central

A qualidade de um servidor MCP nao e medida apenas pela cobertura da API. Ela e medida por quanto as ferramentas ajudam um agente a entender a tarefa, escolher a operacao certa, fornecer parametros validos, lidar com erros e retornar dados uteis.

## Fluxo de Trabalho

### 1. Pesquisar e Planejar

- Entenda a API externa: autenticacao, endpoints, limites, paginacao, erros e modelos de dados.
- Priorize cobertura ampla quando houver duvida, mas crie ferramentas de fluxo de trabalho quando isso reduzir complexidade real.
- Defina nomes claros e consistentes, de preferencia com prefixo do servico e verbo de acao, como `jira_search_issues` ou `github_create_issue`.
- Planeje respostas focadas: filtros, limites e formatos `markdown`/`json` quando fizer sentido.

### 2. Consultar Documentacao MCP

Comece pelo sitemap:

```text
https://modelcontextprotocol.io/sitemap.xml
```

Depois carregue paginas especificas em formato Markdown usando o sufixo `.md`.

Referencias locais uteis:

- `reference/mcp_best_practices.md`: convencoes gerais MCP.
- `reference/python_mcp_server.md`: guia Python/FastMCP.
- `reference/node_mcp_server.md`: guia Node/TypeScript.
- `reference/evaluation.md`: criacao de avaliacoes.

### 3. Implementar Infraestrutura

- Cliente da API com autenticacao centralizada.
- Modelos de entrada com Pydantic ou Zod.
- Tratamento de erros com mensagens acionaveis.
- Formatadores de resposta para leitura humana e uso programatico.
- Suporte a paginacao e limites.

### 4. Implementar Ferramentas

Para cada ferramenta:

- Use schema de entrada com tipos, limites e descricoes claras.
- Descreva quando usar e quando nao usar.
- Marque operacoes destrutivas de forma explicita quando o framework permitir.
- Retorne dados estruturados quando possivel.
- Evite payloads enormes; pagine ou resuma.
- Inclua erros com sugestao de proxima acao.

### 5. Revisar e Testar

Para Python:

```bash
python -m py_compile caminho/do_servidor.py
pytest
```

Para TypeScript:

```bash
npm run build
npm test
```

Tambem teste com MCP Inspector quando aplicavel.

### 6. Criar Avaliacoes

Crie perguntas realistas que exijam uso do servidor MCP sem mutacoes destrutivas. Cada avaliacao deve ser:

- independente;
- somente leitura, quando possivel;
- complexa o bastante para exigir multiplas chamadas;
- verificavel por uma resposta clara;
- estavel ao longo do tempo.

Use `reference/evaluation.md` para o formato XML e criterios completos.

## Lista de Verificacao de Qualidade

- Ferramentas tem nomes descobriveis e consistentes.
- Schemas validam entradas antes da chamada externa.
- Erros explicam causa provavel e correcao.
- Operacoes destrutivas sao distinguiveis de leituras.
- Respostas sao concisas e preservam dados essenciais.
- Testes cobrem services, formatadores e ferramentas MCP.
- Segredos nao aparecem em logs, exemplos reais ou respostas.

## Quando Carregar Referencias

| Necessidade | Arquivo |
|-------------|---------|
| Padroes gerais MCP | `reference/mcp_best_practices.md` |
| Implementacao Python/FastMCP | `reference/python_mcp_server.md` |
| Implementacao Node/TypeScript | `reference/node_mcp_server.md` |
| Avaliacoes MCP | `reference/evaluation.md` |

Carregue apenas a referencia necessaria para a decisao atual, para manter o contexto enxuto.