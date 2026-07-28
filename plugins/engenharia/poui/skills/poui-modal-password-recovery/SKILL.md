---
name: poui-modal-password-recovery
description: Componente po-modal-password-recovery do PO UI para modal de recuperação de senha por email ou SMS. Use quando precisar criar modal de esqueci minha senha, recuperação por email, envio de código SMS, validação de código, ou automatizar recuperação de senha no PO UI.
---

# PoModalPasswordRecovery

Template de modal para recuperação de senha. Suporta recuperação por email e/ou SMS com automatização completa via URL.

**Seletor:** `po-modal-password-recovery`  
**Módulo:** `PoTemplatesModule` ou `PoModalPasswordRecoveryModule`

## Propriedades (@Input)

| Propriedade      | Binding             | Tipo                          | Padrão              | Descrição                                 |
| ---------------- | ------------------- | ----------------------------- | ------------------- | ----------------------------------------- |
| `codeError`      | `p-code-error`      | `string`                      | —                   | Mensagem de erro para código SMS inválido |
| `urlRecovery`    | `p-url-recovery`    | `string`                      | —                   | URL para automação da recuperação         |
| `contactEmail`   | `p-contact-email`   | `string`                      | —                   | Email de suporte exibido na modal         |
| `phoneMask`      | `p-phone-mask`      | `string`                      | `'(99) 99999-9999'` | Máscara do campo de telefone              |
| `type`           | `p-type`            | `PoModalPasswordRecoveryType` | `Email`             | Tipo de recuperação                       |
| `componentsSize` | `p-components-size` | `string`                      | `'medium'`          | Tamanho dos componentes                   |

## Eventos (@Output)

| Evento       | Binding         | Tipo                | Descrição                                                |
| ------------ | --------------- | ------------------- | -------------------------------------------------------- |
| `submit`     | `p-submit`      | `EventEmitter<any>` | Email/reenvio (ignorado se `urlRecovery` definido)       |
| `codeSubmit` | `p-code-submit` | `EventEmitter<any>` | Código SMS digitado (ignorado se `urlRecovery` definido) |

## Enum PoModalPasswordRecoveryType

```typescript
enum PoModalPasswordRecoveryType {
  Email, // Apenas recuperação por email
  SMS, // Apenas recuperação por SMS
  All, // Ambas opções (email e SMS)
}
```

## Telas da Modal

A modal possui três telas sequenciais:

1. **Formulário** — Campo para email ou telefone
2. **Código SMS** — Campo para código recebido por SMS (apenas se tipo incluir SMS)
3. **Confirmação** — Mensagem de envio de link por email

## Automação via URL (p-url-recovery)

### Recuperação por Email

```
POST {p-url-recovery}
Body: { email: "user@email.com", retry?: 1 }
```

**Sucesso (204):** Exibe tela de confirmação de email enviado.

### Recuperação por SMS

```
POST {p-url-recovery}
Body: { email: "user@email.com" }
```

**Sucesso (200):** Retorna hash e abre tela de código SMS.

```json
{
  "hash": "abc123",
  "urlValidationCode": "https://api.example.com/validate"
}
```

### Validação do Código SMS

```
POST {urlValidationCode || p-url-recovery/validation}
Body: { hash: "abc123", code: "123456" }
```

**Sucesso (200):**

```json
{
  "token": "xyz789",
  "urlChangePassword": "https://app.example.com/change-password"
}
```

**Erro (400):**

```json
{
  "error": { "message": "Código inválido" }
}
```

## Uso Básico

```html
<po-modal-password-recovery
  p-url-recovery="https://api.example.com/recovery"
  p-contact-email="suporte@empresa.com"
  [p-type]="recoveryType"
  p-phone-mask="(99) 99999-9999"
>
</po-modal-password-recovery>
```

```typescript
import { PoModalPasswordRecoveryType } from "@po-ui/ng-templates";

recoveryType = PoModalPasswordRecoveryType.All;
```

## Uso Manual (sem automação)

```html
<po-modal-password-recovery
  [p-type]="recoveryType"
  (p-submit)="onSubmitRecovery($event)"
  (p-code-submit)="onCodeSubmit($event)"
>
</po-modal-password-recovery>
```

```typescript
onSubmitRecovery(data: { email: string; retry?: number }) {
  // Implementar envio manual
}

onCodeSubmit(data: { code: string; hash: string }) {
  // Implementar validação manual do código
}
```

> Textos da modal são pré-definidos e traduzidos automaticamente (pt, en, es, ru).
