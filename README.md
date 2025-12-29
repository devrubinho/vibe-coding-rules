# Rubinho Task Flow

<div align="center">

![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-8A2BE2?style=for-the-badge&logo=anthropic&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-IDE-blue?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Task Flow](https://img.shields.io/badge/Task%20Flow-AI%20Powered-green?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**One-command setup for Claude Code, Gemini, Cursor, and Rubinho Task Flow in any project**

</div>

---

## Overview

A centralized repository of development configurations and rules that can be instantly installed in any project. Provides complete setup for Claude Code, Gemini, Cursor IDE, and Rubinho Task Flow - a simple AI-powered task management system.

### Key Features

- **One-Command Installation** - Complete setup with `./install-rules.sh`
- **Simple Task Management** - Define tasks in plain text, AI generates detailed subtasks
- **Multiple AI Models** - Claude Code Sonnet and Gemini 3 Flash configured and ready to use
- **Discrete .gitignore** - AI configs hidden with generic comments
- **Zero Configuration** - Ready to use immediately
- **Rubinho Task Flow** - AI-powered task management with simple text interface

## System Requirements

- **Operating System:** macOS, Linux, or Windows (WSL)
- **Tools:** Git, Bash, Node.js
- **Required:** Claude Code CLI, Gemini API access, or Cursor IDE (with Pro subscription)

## Installation

### Quick Start

```bash
# 1. Clone this repository (one time only)
git clone https://github.com/rubensdeoliveira/rubinho-task-flow.git ~/.rubinho-task-flow

# 2. Install in your project
~/.rubinho-task-flow/install.sh
# Enter your project path when prompted

# 3. Go to your project and run the task manager
cd /path/to/your/project
Use comandos da IA: `task-flow: sync`, `task-flow: run next X`, `task-flow: run task X`, etc.
```

**That's it!** The interactive menu guides you through everything.

### What Gets Installed

The script creates and configures:

```
your-project/
├── .cursor/
│   ├── rules/                    # All development rules
│   │   ├── cursor_rules.mdc
│   │   ├── self_improve.mdc
│   │   ├── code_comments.mdc
│   │   ├── commit_practices.mdc
│   │   ├── git_control.mdc
│   │   └── task_execution.mdc
│   └── settings.json             # Cursor model settings
│
├── .claude/
│   └── settings.json             # Claude Code settings
│
├── .gemini/
│   └── settings.json             # Gemini settings
│
├── .task-flow/                   # Rubinho Task Flow
│   ├── tasks.input.txt           # Plain text task definitions (edit this!)
│   ├── tasks.status.md           # ⚠️ Task status (auto-updated, DO NOT EDIT)
│   └── .internal/                # ⚠️ Internal system files (ignore - auto-generated)
│       ├── tasks.json            # Task definitions (auto)
│       └── status.json           # Task status tracking (auto)
│
└── .gitignore                    # Updated with discrete entries
```

## Configuration

No additional configuration required! Just make sure you have:
- Claude Code CLI installed, OR
- Gemini API access configured, OR
- Cursor IDE with an active Pro subscription

**You're ready!**

## Usage

### Rubinho Task Flow - Interactive Menu

Just run the script and navigate through the menu:

```bash
Use comandos da IA: `task-flow: sync`, `task-flow: run next X`, `task-flow: run task X`, etc.
```

O menu apresenta as seguintes opções:

**Menu Principal** (quando executado fora de um projeto):
1. 🚀 **Instalar em um projeto** - Instala o Task Flow em qualquer projeto
2. 📋 **Gerenciar tasks** - Acessa o menu de gerenciamento de tasks
0. 🚪 **Sair**

**Comandos da IA disponíveis:**
- `task-flow: sync` - Sincronização completa: adiciona novas, remove removidas, atualiza modificadas, preserva status
- `task-flow: think` - Analisa código e sugere novas tasks
- `task-flow: run next X` - Trabalha nas próximas X subtasks sequenciais
- `task-flow: run task X` - Executa todas as subtasks pendentes da task X (só executa se tasks anteriores estiverem completas - permite trabalho paralelo)
- `task-flow: status` - Mostra status atual das tasks
- `task-flow: review` - Revisa tasks concluídas
- `task-flow: refactor` - Refatora código do commit atual

**Complete workflow:**

```bash
# 1. Clone the repository (one time)
git clone https://github.com/rubensdeoliveira/rubinho-task-flow.git ~/.rubinho-task-flow

# 2. Install in your project
~/.rubinho-task-flow/install.sh
# Enter: /path/to/my-project

# 3. Go to your project
cd /path/to/my-project

# 4. Use AI commands:
#    - Edit tasks.input.txt and use 'task-flow: sync' to generate
#    - Use 'task-flow: run next X' to work on next X subtasks
#    - Use 'task-flow: run task X' to work on all subtasks of task X
#    - Use 'task-flow: status' to view progress
```

**Key features:**
- ✅ **.task-flow/** directory is automatically **gitignored**
- ✅ Your task progress stays **local and private**
- ✅ Team members can use their own tasks without conflicts
- ✅ AI generates detailed, actionable subtasks from simple descriptions

### Cursor Integration

Cursor is pre-configured with:
- Claude Sonnet 4.5 Pro as default model
- Custom settings
- Rubinho Task Flow integration
- Development best practices

All rules are automatically active in Cursor. The IDE will:
- Follow coding standards from `.cursor/rules/`
- Integrate with Rubinho Task Flow workflows
- Follow commit and git practices

### Claude Code Integration

Claude Code is pre-configured with:
- Custom settings
- Rubinho Task Flow integration
- Development best practices

### Gemini Integration

Gemini is pre-configured with:
- Custom settings
- Rubinho Task Flow integration
- Development best practices

## What's Configured

### Development Rules

Included rules for:
- Cursor rule formatting
- Self-improvement processes
- Code commenting standards
- Commit practices
- Git command control
- Task execution management

### Rubinho Task Flow

Simple yet powerful task management:
- **Plain Text Input**: Write tasks in `.task-flow/tasks.input.txt` using simple format
- **AI-Powered Generation**: Transforms simple tasks into detailed, actionable subtasks
- **Smart Instructions**: Each subtask includes context, objectives, implementation steps, and validation
- **Simple Tracking**: JSON-based status management with easy CLI commands
- **Progress Monitoring**: Clear visual feedback on task completion

## Discrete .gitignore

The installer adds these entries to `.gitignore`:

```gitignore
.claude/
.gemini/
.cursor/
.task-flow/
CLAUDE.md
GEMINI.md
```

**Why discrete?**
- No comments explaining what they are
- No mention of "AI", "Claude", or "Anthropic"
- Everything related to Rubinho Task Flow stays local
- Clean git history without AI tooling files

## Updating Projects

To update configs in an existing project:

```bash
~/.rubinho-task-flow/install.sh
# Enter the project path
```

The installer will:
- ✅ Copy new rules (always overwrites)
- ✅ **Overwrite config files** (settings.json) with latest versions
- ✅ Update .gitignore if needed
- ✅ Update Task Flow scripts (always overwrites)
- ✅ **Preserve your data**: `.internal/tasks.json` and `.internal/status.json` are **NOT overwritten** (your tasks stay safe)

**Note**: The installer automatically adds `.task-flow/` to `.gitignore`, keeping your task progress private and out of version control.

## Project Structure

This repository contains:

```
rubinho-task-flow/
├── .cursor/
│   ├── settings.json             # Cursor model settings
│   └── rules/                    # All development rules
│
├── .claude/
│   └── settings.json             # Claude Code settings
│
├── .gemini/
│   └── settings.json             # Gemini settings
│
├── .task-flow/
│   ├── README.md                 # Quick commands reference
│   ├── tasks.input.txt           # Task definitions template
│   ├── tasks.status.md           # ⚠️ Task status template (DO NOT EDIT manually)
│   └── .internal/                # ⚠️ Internal system files (ignore - auto-generated)
│       ├── tasks.json            # Task definitions (auto)
│       └── status.json           # Task status tracking (auto)
│
├── .gitignore                    # Template gitignore
├── .model-versions.json          # Model version reference (update when new models are released)
├── CLAUDE.md                     # Main Claude instructions
├── GEMINI.md                     # Main Gemini instructions
├── install.sh                    # Installation script
└── README.md                     # This file
```

## Important Notes

- ⚠️ This is a **template repository** - don't use Rubinho Task Flow here
- ✅ Use Rubinho Task Flow in **projects that receive** the configs via installation
- 🔄 Installer **always overwrites** existing configs
- 🤫 .gitignore entries are **discrete** (no AI mentions)
- 🎯 Works with **Claude Code CLI**, **Gemini API**, or **Cursor Pro**
- 📦 Task Flow directory (`.task-flow/`) is **automatically gitignored**
- 📝 Define tasks in `.task-flow/tasks.input.txt` using simple format: `- Task description`
- 🚀 Simple installation with `install.sh`, management with `Use comandos da IA: `task-flow: sync`, `task-flow: run next X`, `task-flow: run task X`, etc.`
- 🔒 **API keys may be required** - depends on your AI provider (Claude Code, Gemini API, or Cursor Pro)
- 🔔 **Model version checking** - Automatically checks for newer model versions after installation (fast, local check)

## Updating Model Versions

When new model versions are released, update `.model-versions.json` in this repository:

```json
{
  "claude": {
    "current": "claude-sonnet-4-5-20250929",
    "latest": "NEW_VERSION_HERE",
    "checkUrl": "https://docs.anthropic.com/claude/docs/models-overview"
  },
  "cursor": {
    "current": "claude-sonnet-4-5-20250929",
    "latest": "NEW_VERSION_HERE",
    "checkUrl": "https://docs.cursor.com/models"
  },
  "gemini": {
    "current": "gemini-3-flash",
    "latest": "NEW_VERSION_HERE",
    "checkUrl": "https://ai.google.dev/models/gemini"
  }
}
```

The installer will automatically check for newer model versions and **ask you individually** if you want to update each one (Claude, Cursor, Gemini). This check is **fast and local** - no API calls, no network requests, just a simple string comparison.

**Interactive Updates:** When a newer version is available, the installer will:
- Show current and latest versions
- Ask: "Update [Model] to latest version? [y/N]"
- Update only if you confirm with `y`
- Skip if you press Enter or type `n`

**Important:** Model version updates work differently:

- **When installing in a target project** (passing a path):
  - The installer **copies/replaces** files from the repository template to the target project
  - **NO model update prompts** - just copies what's in the template
  - Target project receives the current template versions

- **When running installer in the repository itself** (rubinho-task-flow):
  - If new model versions are detected, you can choose to update them
  - Updates are applied **only to the repository template** files
  - After updating the template, run installer on projects to apply the new versions

**Workflow:**
1. Run installer on a project → copies current template files to project (no update prompts)
2. To update repository template → run installer in the repository itself, choose to update
3. Run installer again on projects → copies updated template files to projects

You have full control - model updates only happen in the repository template, not in target projects.

## Contributing

Contributions welcome! To add new rules or improve templates:

1. Fork this repository
2. Create a feature branch
3. Add your rules/templates following existing formats
4. Test in a real project
5. Submit a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Refer to CHANGELOG.md for recent updates

---

<div align="center">

**Made with ❤️ for developers who love simple, AI-powered workflows**

[⬆ Back to top](#rubinho-task-flow)

</div>
