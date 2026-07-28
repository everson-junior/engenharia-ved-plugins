---
name: poui-page-blocked-user
description: Componente po-page-blocked-user do PO UI para tela de bloqueio de usuário. Use quando precisar criar uma página de acesso negado, usuário bloqueado, senha expirada, excesso de tentativas de login, ou exibir informações de contato para suporte ao usuário bloqueado no PO UI.
---

# PoPageBlockedUser

Template de página para exibição de bloqueio de usuário. Apresenta mensagens contextuais com imagens e textos adequados ao tipo de bloqueio.

**Seletor:** `po-page-blocked-user`  
**Módulo:** `PoTemplatesModule` ou `PoPageBlockedUserModule`

## Propriedades (@Input)

| Propriedade      | Binding             | Tipo                            | Padrão                                 | Descrição                                         |
| ---------------- | ------------------- | ------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `contactEmail`   | `p-contact-email`   | `string`                        | —                                      | Email de contato (protocolo MAILTO)               |
| `contactPhone`   | `p-contact-phone`   | `string`                        | —                                      | Telefone de contato (protocolo TEL)               |
| `logo`           | `p-logo`            | `string`                        | Logo PO UI                             | Logomarca superior                                |
| `secondaryLogo`  | `p-secondary-logo`  | `string`                        | —                                      | Logomarca no rodapé                               |
| `componentsSize` | `p-components-size` | `string`                        | `'medium'`                             | Tamanho dos componentes (`'small'` \| `'medium'`) |
| `params`         | `p-params`          | `PoPageBlockedUserReasonParams` | `{ attempts: 5, days: 90, hours: 24 }` | Parâmetros para customizar texto de bloqueio      |
| `reason`         | `p-reason`          | `PoPageBlockedUserReason`       | `None`                                 | Motivo do bloqueio                                |
| `urlBack`        | `p-url-back`        | `string`                        | `'/'`                                  | URL de retorno                                    |

## Enums

### PoPageBlockedUserReason

```typescript
enum PoPageBlockedUserReason {
  None, // Sem motivo específico
  ExpiredPassword, // Senha expirada
  ExceededAttempts, // Tentativas de acesso esgotadas
}
```

### Interface PoPageBlockedUserReasonParams

```typescript
interface PoPageBlockedUserReasonParams {
  attempts?: number; // Número de tentativas (padrão: 5)
  days?: number; // Dias para expiração (padrão: 90)
  hours?: number; // Horas de bloqueio (padrão: 24)
}
```

## Uso Básico

```html
<po-page-blocked-user
  p-contact-email="suporte@empresa.com"
  p-contact-phone="0800 123 4567"
  [p-reason]="blockedReason"
  [p-params]="{ attempts: 3, hours: 12 }"
  p-url-back="/login"
>
</po-page-blocked-user>
```

## Uso via Rotas (sem componente)

```typescript
import {
  PoPageBlockedUserComponent,
  PoPageBlockedUserReason,
} from "@po-ui/ng-templates";

const routes: Routes = [
  {
    path: "access-denied",
    component: PoPageBlockedUserComponent,
    data: {
      contactEmail: "dev.po@po-ui.com",
      contactPhone: "0800 1234 000",
      reason: PoPageBlockedUserReason.ExpiredPassword,
      urlBack: "/home",
    },
  },
];
```

> Os textos nas telas são pré-definidos e traduzidos automaticamente (pt, en, es, ru).
