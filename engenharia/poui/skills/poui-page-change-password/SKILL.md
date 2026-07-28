---
name: poui-page-change-password
description: Componente po-page-change-password do PO UI para tela de alteração ou criação de senha. Use quando precisar criar um formulário de troca de senha, definir requisitos de senha, validar senhas, recuperação de senha com modal, ou configurar URL para POST de nova senha no PO UI.
---

# PoPageChangePassword

Template de página para criação ou alteração de senha. Inclui dicas de segurança, validações customizáveis e integração automática via URL.

**Seletor:** `po-page-change-password`  
**Módulo:** `PoTemplatesModule` ou `PoPageChangePasswordModule`

## Propriedades (@Input)

| Propriedade           | Binding                   | Tipo                                                 | Padrão     | Descrição                                      |
| --------------------- | ------------------------- | ---------------------------------------------------- | ---------- | ---------------------------------------------- |
| `logo`                | `p-logo`                  | `string`                                             | —          | Logomarca superior                             |
| `secondaryLogo`       | `p-secondary-logo`        | `string`                                             | —          | Logomarca no rodapé                            |
| `token`               | `p-token`                 | `string`                                             | —          | Token para requisição de troca de senha        |
| `urlBack`             | `p-url-back`              | `string`                                             | `'/'`      | URL de retorno (botão Voltar)                  |
| `urlNewPassword`      | `p-url-new-password`      | `string`                                             | —          | URL para POST automático da nova senha         |
| `urlHome`             | `p-url-home`              | `string`                                             | `'/'`      | URL para navegação após alteração bem-sucedida |
| `hideCurrentPassword` | `p-hide-current-password` | `boolean`                                            | `false`    | Esconde campo "Senha atual" (modo criação)     |
| `recovery`            | `p-recovery`              | `string \| Function \| PoPageChangePasswordRecovery` | —          | Config de recuperação de senha                 |
| `requirements`        | `p-requirements`          | `PoPageChangePasswordRequirement[]`                  | `[]`       | Lista de requisitos para validação de senha    |
| `componentsSize`      | `p-components-size`       | `string`                                             | `'medium'` | Tamanho dos componentes                        |

## Eventos (@Output)

| Evento   | Binding    | Tipo                | Descrição                                                                        |
| -------- | ---------- | ------------------- | -------------------------------------------------------------------------------- |
| `submit` | `p-submit` | `EventEmitter<any>` | Emitido ao submeter o formulário (ignorado se `urlNewPassword` estiver definido) |

## Automação via URL (p-url-new-password)

Quando `p-url-new-password` é definido, o componente automatiza todo o processo:

```
POST {p-url-new-password}
Body: {
  token?: string,
  oldPassword?: string,
  newPassword: string
}
```

**Resposta esperada:** HTTP `204` (No Content)

Em caso de sucesso, exibe modal de confirmação automática.

## Interfaces

### PoPageChangePasswordRequirement

```typescript
interface PoPageChangePasswordRequirement {
  requirement: string; // Texto descritivo do requisito
  status: boolean; // true = atendido, false = não atendido
}
```

### PoPageChangePasswordRecovery

```typescript
interface PoPageChangePasswordRecovery {
  url: string; // URL para recuperação
  type?: PoModalPasswordRecoveryType; // Tipo de recuperação
  contactMail?: string; // Email de contato
  phoneMask?: string; // Máscara do telefone
}
```

## Uso Básico

```html
<po-page-change-password
  p-logo="./assets/logo.png"
  p-url-new-password="https://api.example.com/new-password"
  [p-requirements]="requirements"
  [p-recovery]="recoveryConfig"
>
</po-page-change-password>
```

```typescript
requirements: PoPageChangePasswordRequirement[] = [
  { requirement: 'Mínimo 8 caracteres', status: false },
  { requirement: 'Pelo menos uma letra maiúscula', status: false },
  { requirement: 'Pelo menos um número', status: false }
];

recoveryConfig: PoPageChangePasswordRecovery = {
  url: 'https://api.example.com/recovery',
  type: PoModalPasswordRecoveryType.All,
  contactMail: 'suporte@empresa.com',
  phoneMask: '(99) 99999-9999'
};
```

## Uso via Rotas

```typescript
import {
  PoModalPasswordRecoveryType,
  PoPageChangePasswordComponent,
} from "@po-ui/ng-templates";

const routes: Routes = [
  {
    path: "change-password",
    component: PoPageChangePasswordComponent,
    data: {
      serviceApi: "https://api.example.com/new-password",
      recovery: {
        url: "https://api.example.com/users",
        type: PoModalPasswordRecoveryType.All,
        contactMail: "dev.po@po-ui.com",
        phoneMask: "9-999-999-9999",
      },
    },
  },
];
```

## Método Público

### `openConfirmation()`

Abre a modal de confirmação de senha alterada manualmente (útil quando `p-submit` é usado ao invés de `p-url-new-password`).

```typescript
@ViewChild(PoPageChangePasswordComponent) changePassword: PoPageChangePasswordComponent;

onSubmit() {
  // processar manualmente...
  this.changePassword.openConfirmation();
}
```
