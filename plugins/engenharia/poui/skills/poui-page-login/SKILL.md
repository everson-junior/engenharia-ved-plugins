---
name: poui-page-login
description: Componente po-page-login do PO UI para tela de login com autenticação automática. Use quando precisar criar tela de login, autenticação de usuário, formulário de login com senha, lembrar usuário, campo personalizado de domínio/tenant, integração com API de autenticação, recovery de senha, ou configurar login via rotas no PO UI.
---

# PoPageLogin

Template completo de tela de login com automação de autenticação, campos customizáveis, recuperação de senha e i18n.

**Seletor:** `po-page-login`  
**Módulo:** `PoTemplatesModule` ou `PoPageLoginModule`

## Propriedades (@Input)

### Campos e Aparência

| Propriedade        | Binding                | Tipo                     | Padrão     | Descrição                                |
| ------------------ | ---------------------- | ------------------------ | ---------- | ---------------------------------------- |
| `background`       | `p-background`         | `string`                 | —          | Imagem de destaque ao lado direito       |
| `logo`             | `p-logo`               | `string`                 | —          | Logo principal (parte superior)          |
| `secondaryLogo`    | `p-secondary-logo`     | `string`                 | —          | Logo secundária (rodapé)                 |
| `productName`      | `p-product-name`       | `string`                 | —          | Nome do produto no topo                  |
| `environment`      | `p-environment`        | `string`                 | —          | Rótulo do ambiente (ex: "Produção")      |
| `contactEmail`     | `p-contact-email`      | `string`                 | —          | Email de contato para suporte            |
| `customField`      | `p-custom-field`       | `PoPageLoginCustomField` | —          | Campo personalizado extra (ex: domínio)  |
| `hideRememberUser` | `p-hide-remember-user` | `boolean`                | `false`    | Esconde checkbox "Logar automaticamente" |
| `loginPattern`     | `p-login-pattern`      | `string`                 | —          | Regex de validação do login              |
| `passwordPattern`  | `p-password-pattern`   | `string`                 | —          | Regex de validação da senha              |
| `componentsSize`   | `p-components-size`    | `string`                 | `'medium'` | Tamanho dos componentes                  |
| `support`          | `p-support`            | `string`                 | —          | URL ou rota interna para suporte         |

### Autenticação

| Propriedade               | Binding                       | Tipo                                        | Padrão  | Descrição                                |
| ------------------------- | ----------------------------- | ------------------------------------------- | ------- | ---------------------------------------- |
| `authenticationUrl`       | `p-authentication-url`        | `string`                                    | —       | URL para POST automático de autenticação |
| `authenticationType`      | `p-authentication-type`       | `PoPageLoginAuthenticationType`             | `Basic` | Tipo de autenticação                     |
| `blockedUrl`              | `p-blocked-url`               | `string`                                    | —       | URL para redirecionar quando bloqueado   |
| `exceededAttemptsWarning` | `p-exceeded-attempts-warning` | `number`                                    | —       | Nº de tentativas antes de exibir aviso   |
| `maxAttempts`             | `p-max-attempts`              | `number`                                    | —       | Máximo de tentativas antes de bloquear   |
| `recovery`                | `p-recovery`                  | `string \| Function \| PoPageLoginRecovery` | —       | Config de recuperação de senha           |
| `registerUrl`             | `p-register-url`              | `string`                                    | —       | URL para registro de novo usuário        |

### Literais

| Propriedade | Binding      | Tipo                  | Descrição              |
| ----------- | ------------ | --------------------- | ---------------------- |
| `literals`  | `p-literals` | `PoPageLoginLiterals` | Customização de textos |

## Eventos (@Output)

| Evento           | Binding             | Tipo                        | Descrição                                                    |
| ---------------- | ------------------- | --------------------------- | ------------------------------------------------------------ |
| `loginSubmit`    | `p-login-submit`    | `EventEmitter<PoPageLogin>` | Emitido no submit (ignorado se `authenticationUrl` definido) |
| `loginError`     | `p-login-error`     | `EventEmitter<any>`         | Emitido em erro de autenticação                              |
| `loginChange`    | `p-login-change`    | `EventEmitter<string>`      | Emitido ao alterar campo login                               |
| `passwordChange` | `p-password-change` | `EventEmitter<string>`      | Emitido ao alterar campo senha                               |
| `languageChange` | `p-language-change` | `EventEmitter<string>`      | Emitido ao trocar idioma                                     |

## Enum PoPageLoginAuthenticationType

```typescript
enum PoPageLoginAuthenticationType {
  Basic, // Autenticação Basic (header Authorization)
  Bearer, // Autenticação Bearer (token)
}
```

## Interface PoPageLogin (payload do submit)

```typescript
interface PoPageLogin {
  login: string;
  password: string;
  rememberUser: boolean;
  customValue?: string; // Valor do campo customizado
}
```

## Interface PoPageLoginCustomField

```typescript
interface PoPageLoginCustomField {
  property: string; // Nome da propriedade
  placeholder?: string; // Placeholder do campo
  pattern?: string; // Regex de validação
  errorPattern?: string; // Mensagem de erro de validação
  value?: string; // Valor inicial
  options?: Array<{ label: string; value: string }>; // Opções para select
}
```

## Automação via URL (p-authentication-url)

Quando `p-authentication-url` é definido, o componente automatiza a autenticação:

### Basic Auth

```
POST {p-authentication-url}
Headers: { Authorization: "Basic base64(login:password)" }
```

### Bearer Auth

```
POST {p-authentication-url}
Body: { login, password, rememberUser, customValue? }
```

**Sucesso (200):** Espera resposta JSON. Se `rememberUser = true`, armazena dados em localStorage.

**Erro (400/401):** Incrementa contador de tentativas, exibe popover de aviso.

**Bloqueio (403/423):** Com `maxAttempts` e `blockedUrl` definidos, redireciona para `blockedUrl`.

## Uso Básico (Automático)

```html
<po-page-login
  p-logo="./assets/logo.png"
  p-background="./assets/background.png"
  p-authentication-url="https://api.example.com/auth"
  [p-authentication-type]="authType"
  p-blocked-url="/access-denied"
  [p-exceeded-attempts-warning]="3"
  [p-max-attempts]="5"
  p-register-url="/register"
  [p-recovery]="recoveryConfig"
>
</po-page-login>
```

## Uso Manual

```html
<po-page-login
  p-logo="./assets/logo.png"
  (p-login-submit)="onLogin($event)"
  (p-login-error)="onError($event)"
>
</po-page-login>
```

```typescript
onLogin(loginData: PoPageLogin) {
  this.authService.authenticate(loginData.login, loginData.password)
    .subscribe(response => {
      this.router.navigate(['/home']);
    });
}
```

## Uso via Rotas

```typescript
import { PoPageLoginComponent } from "@po-ui/ng-templates";

const routes: Routes = [
  {
    path: "login",
    component: PoPageLoginComponent,
    data: {
      serviceApi: "https://api.example.com/auth",
      environment: "Produção",
      registerUrl: "/register",
      recovery: { url: "https://api.example.com/recovery" },
    },
  },
];
```

## Interface PoPageLoginLiterals (texto customizável)

```typescript
interface PoPageLoginLiterals {
  title?: string; // "Bem-vindo"
  loginPlaceholder?: string; // "Insira seu e-mail"
  loginHint?: string; // Dica sobre o login
  loginErrorPattern?: string; // "Login inválido"
  passwordPlaceholder?: string; // "Insira sua senha"
  passwordErrorPattern?: string; // "Senha inválida"
  rememberUser?: string; // "Logar automaticamente"
  rememberUserHint?: string; // Dica sobre lembrar
  submitLabel?: string; // "Entrar"
  submittedLabel?: string; // "Carregando..."
  forgotPassword?: string; // "Esqueceu sua senha?"
  registerUrl?: string; // "Novo registro"
  highlightInfo?: string; // Texto sobre imagem de destaque
  welcome?: string; // "Boas-vindas"
  support?: string; // "Suporte"
}
```
