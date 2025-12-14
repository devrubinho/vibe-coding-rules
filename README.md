# Vibe Coding Rules

<div align="center">

![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-8A2BE2?style=for-the-badge&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-IDE-blue?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Task Master](https://img.shields.io/badge/Task%20Master-AI-green?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**One-command setup for Claude Code, Cursor, and Taskmaster in any project**

</div>

---

## Overview

A centralized repository of development configurations and rules that can be instantly installed in any project. Provides complete setup for Claude Code, Cursor IDE, and Taskmaster AI with a single command.

### Key Features

- **One-Command Installation** - Complete setup with `./install-rules.sh`
- **Always Overwrites** - Fresh configs every time, no conflicts
- **Claude as Default** - Claude Code Sonnet configured across all tools
- **Discrete .gitignore** - AI configs hidden with generic comments
- **Zero Configuration** - No need to run `task-master init` or configure manually
- **Complete Templates** - PRD examples, commands, and workflows included

## System Requirements

- **Operating System:** macOS, Linux, or Windows (WSL)
- **Tools:** Git, Bash
- **Optional:** Claude Code CLI, Cursor IDE, Taskmaster AI
- **API Keys:** Anthropic API key (required), Perplexity API key (optional)

## Installation

### Quick Start

```bash
# 1. Clone this repository (one time only)
git clone https://github.com/rubensdeoliveira/vibe-coding-rules.git ~/.vibe-coding-rules

# 2. In any new project, run the installer
cd /your/project
~/.vibe-coding-rules/install-rules.sh
```

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
│   │   ├── task_execution.mdc
│   │   └── taskmaster/
│   │       ├── dev_workflow.mdc
│   │       ├── taskmaster.mdc
│   │       └── hamster.mdc
│   └── mcp.json                  # MCP server config
│
├── .claude/
│   ├── settings.json             # Claude Code settings
│   └── commands/
│       └── taskmaster.md         # Taskmaster commands
│
├── .taskmaster/
│   ├── config.json               # Pre-configured with Claude Sonnet
│   ├── CLAUDE.md                 # Claude instructions
│   └── templates/
│       └── prd-example.md        # Complete PRD example
│
├── .mcp.json                     # MCP config for Claude Code
├── .env                          # API keys template
├── CLAUDE.md                     # Main Claude instructions
└── .gitignore                    # Updated with discrete entries
```

## Configuration

### 1. Add API Keys

Edit `.env` and add your keys:

```bash
ANTHROPIC_API_KEY=your-anthropic-key-here
PERPLEXITY_API_KEY=your-perplexity-key-here
```

### 2. Update MCP Configs

Copy the same keys to:
- `.mcp.json` (for Claude Code)
- `.cursor/mcp.json` (for Cursor)

Or use environment variables (recommended).

### 3. Restart Cursor

Restart Cursor IDE to load the MCP server.

### 4. Verify Setup

Check `.taskmaster/config.json` - should show:

```json
{
  "models": {
    "main": {
      "provider": "claude-code",
      "modelId": "sonnet"
    },
    "research": {
      "provider": "claude-code",
      "modelId": "sonnet"
    },
    "fallback": {
      "provider": "claude-code",
      "modelId": "sonnet"
    }
  }
}
```

**You're ready!** No need to run `task-master init`.

## Usage

### Basic Workflow

```bash
# Create a PRD (Product Requirements Document)
vim .taskmaster/docs/prd.txt

# Parse the PRD to generate tasks
task-master parse-prd .taskmaster/docs/prd.txt

# Analyze task complexity
task-master analyze-complexity --research

# Expand tasks into subtasks
task-master expand --all --research

# Start working
task-master next
```

### Cursor Integration

All rules are automatically active in Cursor. The IDE will:
- Follow coding standards from `.cursor/rules/`
- Use Taskmaster workflows from `.cursor/rules/taskmaster/`
- Connect to Taskmaster via MCP server

### Claude Code Integration

Claude Code is pre-configured with:
- MCP server connection to Taskmaster
- Custom commands in `.claude/commands/`
- Development rules from CLAUDE.md

## What's Configured

### Claude Code Sonnet

All Taskmaster operations use **Claude Code Sonnet**:
- **Main model** (generation/updates) → `claude-code/sonnet`
- **Research model** → `claude-code/sonnet`
- **Fallback model** → `claude-code/sonnet`

### Development Rules

Included rules for:
- Cursor rule formatting
- Self-improvement processes
- Code commenting standards
- Commit practices
- Git command control
- Task execution management
- Complete Taskmaster workflows

### Templates

Pre-configured templates:
- **PRD Example** - Complete authentication system PRD
- **Taskmaster Commands** - Ready-to-use slash commands
- **Workflows** - Optimized development processes

## Discrete .gitignore

The installer adds configs to `.gitignore` with **generic comments**:

```gitignore
# Local configuration
.env
.env.local
.mcp.json
CLAUDE.md

# IDE and tools
.claude/
.cursor/mcp.json
.cursor/rules/*.local.mdc

# Task management
.taskmaster/tasks/
.taskmaster/state.json
.taskmaster/config.json
.taskmaster/CLAUDE.md
.taskmaster/docs/
.taskmaster/reports/
```

**Why discrete?**
- No mention of "AI", "Claude", or "Anthropic"
- Looks like standard project configs
- Generic section names
- Professional appearance

## Updating Projects

To update configs in an existing project:

```bash
cd /your/project
~/.vibe-coding-rules/install-rules.sh
```

The script will:
- ✅ Copy new rules
- ✅ **Overwrite all configs** with latest versions
- ✅ Update .gitignore if needed
- ✅ Refresh templates

## Project Structure

This repository contains:

```
vibe-coding-rules/
├── .cursor/
│   ├── mcp.json.example          # MCP config template
│   └── rules/                    # All development rules
│
├── .claude/
│   ├── settings.json             # Claude Code settings
│   └── commands/                 # Custom commands
│
├── .taskmaster/
│   ├── config.json.example       # Pre-configured with Claude
│   ├── CLAUDE.md.example         # Claude instructions
│   └── templates/                # PRD and other templates
│
├── .mcp.json                     # Root MCP config
├── .env.example                  # API keys template
├── .gitignore                    # Template gitignore
├── CLAUDE.md                     # Main Claude instructions
├── CHANGELOG.md                  # Version history
├── install-rules.sh              # Installation script
└── README.md                     # This file
```

## API Keys

### Required

**ANTHROPIC_API_KEY** - For Claude
- Used in: Claude Code, Cursor (via MCP), Taskmaster
- Get it at: https://console.anthropic.com/

### Optional

**PERPLEXITY_API_KEY** - For research tasks
- Used in: Taskmaster research operations
- Get it at: https://www.perplexity.ai/settings/api

## Important Notes

- ⚠️ This is a **template repository** - don't use Taskmaster here
- ✅ Use Taskmaster in **projects that receive** the configs
- 🔄 Script **always overwrites** existing configs
- 🤫 .gitignore entries are **discrete** (no AI mentions)
- 🎯 Claude Code Sonnet is **default everywhere**
- 📦 Configs are **gitignored** in destination projects

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

**Made with ❤️ for developers who vibe with AI-powered workflows**

[⬆ Back to top](#vibe-coding-rules)

</div>
