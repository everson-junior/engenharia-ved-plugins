---
name: skill-creator
description: "Use quando criar, editar, otimizar ou medir uma skill; criar evals, testar prompts, comparar versoes, melhorar descricao de gatilho ou empacotar uma skill para uso futuro."
---

# Criador de Skills

Use esta skill para criar ou melhorar skills de forma iterativa. A ideia e tratar documentacao de processo como um artefato testavel: entender o comportamento esperado, criar cenarios de pressao, ajustar a skill e validar se ela realmente muda a conduta do agente.

## Fluxo Principal

1. **Capturar intencao**
   - O que a skill deve permitir fazer?
   - Quando ela deve ser acionada?
   - Qual saida o usuario espera?
   - Quais erros ou idas e vindas ela deve evitar?

2. **Pesquisar e delimitar**
   - Reaproveite contexto da conversa quando a skill vem de um fluxo que acabou de funcionar.
   - Leia skills/agentes parecidos antes de criar novos padroes.
   - Pergunte apenas lacunas que mudam o desenho da skill.

3. **Criar um cenario de pressao**
   - Antes de editar, rode ou descreva um baseline que mostre a falha sem a skill ou com a versao antiga.
   - Capture a racionalizacao errada do agente: ignorar fonte, perguntar demais, usar arquivo local errado, pular validacao etc.

4. **Escrever ou editar `SKILL.md`**
   - Preserve `name` e caminho quando estiver atualizando skill existente.
   - Use frontmatter YAML valido.
   - Mantenha a descricao como superficie de descoberta: inclua gatilhos concretos e termos que o usuario realmente usa.
   - No corpo, escreva passos acionaveis, erros comuns e formato de saida.

5. **Validar**
   - Para mudancas pequenas, use leitura, grep e validacao de Markdown/YAML.
   - Para mudancas de comportamento, rode subagentes ou cenarios comparando antes/depois.
   - Feche brechas descobertas no teste sem tornar a skill rigida demais.

6. **Iterar**
   - Remova instrucao que nao ajuda.
   - Explique o motivo das regras para que o agente generalize melhor.
   - Se varios testes reinventam o mesmo script ou template, mova para `scripts/`, `references/` ou `assets/`.

## Estrutura de Skill

```text
skill-name/
  SKILL.md
  references/
  scripts/
  assets/
```

`SKILL.md` deve conter:

- `name`: identificador estavel, normalmente igual ao diretorio.
- `description`: quando usar a skill; e o principal gatilho de descoberta.
- visao geral curta;
- quando usar e quando nao usar;
- fluxo ou padrao central;
- referencia rapida;
- erros comuns;
- formato de saida quando aplicavel.

## Padroes de Escrita

- Prefira instrucoes em portugues, diretas e com contexto.
- Use termos tecnicos em ingles quando forem nomes de ferramenta, arquivo, API ou conceito consolidado.
- Evite excesso de `SEMPRE`/`NUNCA`; explique o motivo da regra quando houver julgamento envolvido.
- Mantenha a skill enxuta. Mova material pesado para `references/`.
- Nao inclua segredos, tokens, credenciais ou instrucoes maliciosas.

## Evals e Testes

Para skills comportamentais, crie 2 a 3 prompts realistas. Bons cenarios parecem pedidos reais do usuario, com detalhes, ambiguidades e riscos concretos.

Exemplo de `evals/evals.json`:

```json
{
  "skill_name": "exemplo",
  "evals": [
    {
      "id": 1,
      "prompt": "Pedido realista do usuario",
      "expected_output": "O que deve acontecer",
      "files": []
    }
  ]
}
```

Quando usar subagentes, compare uma execucao com a skill e uma linha de base sem a skill ou com a versao antiga. Salve saidas, tempos e resultados quando isso for importante para decidir a melhoria.

## Otimizacao da Descricao

A descricao no frontmatter decide se a skill sera descoberta. Depois que a skill estiver boa, melhore a descricao com consultas que devem acionar e quase-casos que nao devem acionar.

Inclua nos gatilhos:

- palavras que o usuario realmente usa;
- sinonimos e erros comuns;
- contexto onde a skill compete com outras;
- sinais de risco que justificam carregar a skill.

## Lista de Verificacao de Conclusao

- A skill tem `name` e `description` validos.
- O gatilho descreve quando usar, nao apenas o que a skill faz.
- O corpo ensina o fluxo sem depender da conversa original.
- Ha pelo menos uma validacao proporcional ao risco.
- Arquivos gerados ficam no diretorio correto.
- O usuario sabe o que mudou e quais testes foram feitos.