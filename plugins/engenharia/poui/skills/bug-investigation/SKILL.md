---
type: skill
name: Bug Investigation
description: Systematic bug investigation and root cause analysis
skillSlug: bug-investigation
phases: [E, V]
generated: 2026-03-18
status: filled
scaffoldVersion: "2.0.0"
---

# Bug Investigation Skill — PO UI Angular

## When to Use

Use ao investigar erros em componentes Angular/PO UI.

## Instructions

### 1. Reproduzir o Bug

- Identificar o ambiente: dentro do Protheus ou standalone?
- Verificar `sessionStorage.getItem('insideProtheus')`
- Reproduzir localmente com `npm start`

### 2. Coletar Informações

- **Console do Browser**: Verificar erros de Angular (template binding, DI)
- **Network**: Verificar requisições HTTP com `X-PO-Screen-Lock` e status de resposta
- **PoNotification**: O `PoHttpInterceptor` mostra toasts automáticos; verificar se está configurado

### 3. Bugs Comuns PO UI

**Campo sem `name` attribute**:
```
Error: If ngModel is used within a form tag, either the name attribute must be set
```
Solução: Adicionar `name="fieldName"` ao componente de input.

**Componente PO UI não renderiza**:
- Verificar se o `Po*Module` foi importado no componente standalone
- Ex: `po-page-default` requer `PoPageModule`

**Ícone não aparece**:
- Verificar se é sintaxe Polcon (depreciado) ou Animalia (`an an-*`)
- Verificar configuração de assets no `angular.json` para fontes de ícones

**APP_INITIALIZER falha**:
- Verificar se `appConfig.json` existe em `src/assets/data/`
- Verificar URL de chamada HTTP no inicializador

**ProAppConfigService error em testes**:
- Adicionar provider mock: `{ provide: ProAppConfigService, useValue: { insideProtheus: () => false } }`

### 4. Verificar e Corrigir

1. Identificar causa raiz
2. Implementar correção mínima focada
3. Adicionar teste de regressão
4. Verificar que outros testes ainda passam

## Examples

```typescript
// Teste de regressao para bug de contexto Protheus
it('should set insideProtheus to 0 when not in ERP', () => {
  spyOn(proAppConfigService, 'insideProtheus').and.returnValue(false);
  component.ngOnInit();
  expect(sessionStorage.getItem('insideProtheus')).toBe('0');
});
```