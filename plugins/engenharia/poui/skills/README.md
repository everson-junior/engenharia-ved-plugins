# Skills

On-demand expertise for AI agents. Skills are task-specific procedures that get activated when relevant.

> Project: poui-skill-config

## How Skills Work

1. **Discovery**: AI agents discover available skills
2. **Matching**: When a task matches a skill's description, it's activated
3. **Execution**: The skill's instructions guide the AI's behavior

## Available Skills

### Built-in Skills

| Skill | Description | Phases |
|-------|-------------|--------|
| [Commit Message](./commit-message/SKILL.md) | Generate commit messages following conventional commits with scope detection | E, C |
| [Pr Review](./pr-review/SKILL.md) | Review pull requests against team standards and best practices | R, V |
| [Code Review](./code-review/SKILL.md) | Review code quality, patterns, and best practices | R, V |
| [Test Generation](./test-generation/SKILL.md) | Generate comprehensive test cases for code | E, V |
| [Documentation](./documentation/SKILL.md) | Generate and update technical documentation | P, C |
| [Refactoring](./refactoring/SKILL.md) | Safe code refactoring with step-by-step approach | E |
| [Bug Investigation](./bug-investigation/SKILL.md) | Systematic bug investigation and root cause analysis | E, V |
| [Feature Breakdown](./feature-breakdown/SKILL.md) | Break down features into implementable tasks | P |
| [Api Design](./api-design/SKILL.md) | Design RESTful APIs following best practices | P, R |
| [Security Audit](./security-audit/SKILL.md) | Security review checklist for code and infrastructure | R, V |
| [Skill Creator](./skill-creator/SKILL.md) | Create, improve and evaluate skills with benchmarking and evals | P, E, V |

### PO UI Skills

| Skill | Description | Phases |
|-------|-------------|--------|
| [Poui Templates Overview](./poui-templates-overview/SKILL.md) | General guide for @po-ui/ng-templates library — module setup and component overview | P, E |
| [Poui Page Login](./poui-page-login/SKILL.md) | po-page-login component for authentication screens with automatic login integration | E |
| [Poui Page Background](./poui-page-background/SKILL.md) | po-page-background component for background images on authentication screens | E |
| [Poui Page Blocked User](./poui-page-blocked-user/SKILL.md) | po-page-blocked-user component for blocked/access-denied screens with contact info | E |
| [Poui Page Change Password](./poui-page-change-password/SKILL.md) | po-page-change-password component for password change or creation forms | E |
| [Poui Modal Password Recovery](./poui-modal-password-recovery/SKILL.md) | po-modal-password-recovery component for password recovery via email or SMS | E |
| [Poui Page Dynamic Table](./poui-page-dynamic-table/SKILL.md) | po-page-dynamic-table component for dynamic listing with pagination and full CRUD | E |
| [Poui Page Dynamic Detail](./poui-page-dynamic-detail/SKILL.md) | po-page-dynamic-detail component for read-only record detail views | E |
| [Poui Page Dynamic Edit](./poui-page-dynamic-edit/SKILL.md) | po-page-dynamic-edit component for dynamic create/edit forms | E |
| [Poui Page Dynamic Search](./poui-page-dynamic-search/SKILL.md) | po-page-dynamic-search component for quick search and advanced filter pages | E |
| [Poui Page Dynamic Service](./poui-page-dynamic-service/SKILL.md) | PoPageDynamicService for REST CRUD requests and metadata fetching | E |
| [Poui Page Customization Service](./poui-page-customization-service/SKILL.md) | PoPageCustomizationService for runtime dynamic metadata customization | E |
| [Poui Page Job Scheduler](./poui-page-job-scheduler/SKILL.md) | po-page-job-scheduler component for process scheduling wizard | E |
| [Poui Templates Utils](./poui-templates-utils/SKILL.md) | Utility functions from @po-ui/ng-templates such as convertToBoolean, isExternalLink | E |

## Creating Custom Skills

Create a new skill by adding a directory with a `SKILL.md` file:

```
.context/skills/
└── my-skill/
    ├── SKILL.md          # Required: skill definition
    └── templates/        # Optional: helper resources
        └── checklist.md
```

### SKILL.md Format

```yaml
---
name: my-skill
description: When to use this skill
phases: [P, E, V]  # Optional: PREVC phases
mode: false        # Optional: mode command?
---

# My Skill

## When to Use
[Description of when this skill applies]

## Instructions
1. Step one
2. Step two

## Examples
[Usage examples]
```

## PREVC Phase Mapping

| Phase | Name | Skills |
|-------|------|--------|
| P | Planning | feature-breakdown, documentation, api-design |
| R | Review | pr-review, code-review, api-design, security-audit |
| E | Execution | commit-message, test-generation, refactoring, bug-investigation |
| V | Validation | pr-review, code-review, test-generation, security-audit |
| C | Confirmation | commit-message, documentation |
