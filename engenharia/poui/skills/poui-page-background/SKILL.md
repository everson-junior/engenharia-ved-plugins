---
name: poui-page-background
description: Componente po-page-background do PO UI para exibir imagem de fundo em telas de autenticação (login, bloqueio, alteração de senha). Use quando precisar configurar background, logo ou imagem de destaque em telas de autenticação PO UI.
---

# PoPageBackground

Componente de fundo utilizado internamente pelas telas de autenticação (login, blocked-user, change-password). Pode ser usado diretamente quando se deseja criar telas personalizadas com o padrão visual do PO UI.

**Seletor:** `po-page-background`

## Propriedades (@Input)

| Propriedade          | Binding                  | Tipo      | Descrição                                    |
| -------------------- | ------------------------ | --------- | -------------------------------------------- |
| `background`         | `p-background`           | `string`  | URL ou caminho da imagem de fundo            |
| `logo`               | `p-logo`                 | `string`  | Logo principal (parte superior)              |
| `secondaryLogo`      | `p-secondary-logo`       | `string`  | Logo secundária (rodapé)                     |
| `highlightInfo`      | `p-highlight-info`       | `string`  | Texto informativo sobre a imagem de destaque |
| `showSelectLanguage` | `p-show-select-language` | `boolean` | Exibe seletor de idioma                      |
| `selectedLanguage`   | `p-selected-language`    | `string`  | Idioma selecionado no seletor                |

## Uso

O componente é usado internamente pelos templates de login e autenticação. A imagem aparece ao lado direito do formulário em telas desktop. Em dispositivos móveis, a imagem de fundo é ignorada e o formulário é centralizado.

```html
<po-page-background
  p-background="./assets/images/login-bg.png"
  p-logo="./assets/images/logo.png"
  p-secondary-logo="./assets/images/secondary-logo.png"
>
  <!-- Conteúdo do formulário aqui -->
</po-page-background>
```

## Requisito de Assets

Para exibir imagens do PO UI corretamente, configure `angular.json`:

```json
"assets": [
  "src/assets",
  {
    "glob": "**/*",
    "input": "node_modules/@po-ui/style/images",
    "output": "assets/images"
  }
]
```
