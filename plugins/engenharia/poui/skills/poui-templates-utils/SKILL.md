---
name: poui-templates-utils
description: Funções utilitárias da biblioteca PO UI Templates. Use quando precisar de funções auxiliares como convertToBoolean, convertToInt, isExternalLink, formatYear, isEquals, valuesFromObject, removeKeysProperties, ou PoUtils da lib de templates PO UI.
---

# PO UI Templates - Utilitários

Funções utilitárias disponíveis em `@po-ui/ng-templates` usadas internamente pelos templates e que podem ser úteis em customizações.

## Funções Disponíveis

### `convertToBoolean(val: any): boolean`

Converte qualquer valor para booleano. Aceita `string` (`'true'`, `'on'`, `''`), `number` (`1`) e outros tipos.

```typescript
convertToBoolean("true"); // true
convertToBoolean("on"); // true
convertToBoolean(""); // true
convertToBoolean(1); // true
convertToBoolean("false"); // false
convertToBoolean(0); // false
```

### `convertToInt(value: any, valueDefault?: any): number`

Converte valor para inteiro, com fallback para valor padrão.

### `isTypeof(object: any, type: any): boolean`

Verifica tipo do objeto (wrapper para `typeof`).

### `callFunction(fn: any, context: any, param?): void`

Executa função dentro de um contexto. Aceita nome da função (string) ou referência.

### `convertIsoToDate(value: string, start: boolean, end: boolean): Date`

Converte string ISO para objeto Date. `start` define hora 00:00:00, `end` define hora 23:59:59.

### `convertDateToISOExtended(date: Date, time?: string): string`

Converte Date para formato ISO estendido com timezone.

### `formatYear(year: number): string`

Formata ano para string `yyyy` (com zeros à esquerda quando necessário).

### `isExternalLink(url: string): boolean`

Verifica se uma URL é um link externo (começa com `http`).

### `isEquals(value, comparedValue): boolean`

Compara dois valores profundamente (objetos, arrays e primitivos).

### `valuesFromObject(obj: object, properties: string[]): string`

Extrai valores de um objeto concatenados em string.

### `removeKeysProperties(keys: string[], items: any[]): any[]`

Remove propriedades-chave dos itens de um array.

### `getShortBrowserLanguage(): string`

Retorna idioma do navegador em 2 letras (ex: `'pt'`, `'en'`), com fallback para o idioma padrão do PO UI.

### `getDefaultSizeFn(): string`

Retorna tamanho padrão dos componentes conforme nível de acessibilidade (`'small'` ou `'medium'`).

### Classe `PoUtils`

Classe estática com métodos utilitários reutilizáveis para manipulação de objetos e arrays dentro dos templates PO UI.

## Importação

```typescript
import { convertToBoolean, isExternalLink } from "@po-ui/ng-templates";
```

> Nota: A maioria dessas funções são usadas internamente pelos templates. Para uso na aplicação, prefira as utilidades disponíveis diretamente em `@po-ui/ng-components`.
