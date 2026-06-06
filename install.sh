#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

show_header() {
  clear
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}        ${MAGENTA}✨ RBIN Task Flow - Installation ✨${NC}          ${CYAN}║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

pause() {
  echo -e "\n${YELLOW}Press ENTER to continue...${NC}"
  read -r
}

check_model_updates() {
  local target="$1"
  local versions_file="$SCRIPT_DIR/.model-versions.json"

  [ ! -f "$versions_file" ] && return

  local claude_latest=$(grep -A3 '"claude"' "$versions_file" | grep '"latest"' | sed 's/.*"latest": "\([^"]*\)".*/\1/')
  local cursor_latest=$(grep -A3 '"cursor"' "$versions_file" | grep '"latest"' | sed 's/.*"latest": "\([^"]*\)".*/\1/')
  if [ -f "$SCRIPT_DIR/.claude/settings.json" ]; then
    local installed=$(grep -o '"model": "[^"]*"' "$SCRIPT_DIR/.claude/settings.json" | cut -d'"' -f4)
    if [ -n "$installed" ] && [ -n "$claude_latest" ] && [ "$installed" != "$claude_latest" ]; then
      echo ""
      echo -e "${YELLOW}⚠️  Claude: New version available${NC}"
      echo -e "   ${CYAN}Current: ${installed}${NC}"
      echo -e "   ${CYAN}Latest: ${claude_latest}${NC}"
      read -r -p "$(echo -e ${BLUE}Update Claude to latest version? [y/N]: ${NC})" response
      if [[ "$response" =~ ^[yY]$ ]]; then
        local settings_file="$SCRIPT_DIR/.claude/settings.json"
        mkdir -p "$(dirname "$settings_file")"
        printf '{\n  "model": "%s"\n}\n' "$claude_latest" > "$settings_file"
        if [ -f "$settings_file" ]; then
          local verify=$(grep -o '"model": "[^"]*"' "$settings_file" | cut -d'"' -f4)
          if [ "$verify" = "$claude_latest" ]; then
            echo -e "${GREEN}✅ Claude template updated to ${claude_latest}${NC}"
            echo -e "${CYAN}   (Repository template updated - run install.sh on projects to apply)${NC}"
          else
            echo -e "${RED}❌ Error: Update failed${NC}"
          fi
        else
          echo -e "${RED}❌ Error: Could not write to $settings_file${NC}"
        fi
      else
        echo -e "${CYAN}   Skipped Claude update${NC}"
      fi
    fi
  fi

  if [ -f "$SCRIPT_DIR/.cursor/settings.json" ]; then
    local installed=$(grep -o '"model": "[^"]*"' "$SCRIPT_DIR/.cursor/settings.json" | cut -d'"' -f4)
    if [ -n "$installed" ] && [ -n "$cursor_latest" ] && [ "$installed" != "$cursor_latest" ]; then
      echo ""
      echo -e "${YELLOW}⚠️  Cursor: New version available${NC}"
      echo -e "   ${CYAN}Current: ${installed}${NC}"
      echo -e "   ${CYAN}Latest: ${cursor_latest}${NC}"
      read -r -p "$(echo -e ${BLUE}Update Cursor to latest version? [y/N]: ${NC})" response
      if [[ "$response" =~ ^[yY]$ ]]; then
        local settings_file="$SCRIPT_DIR/.cursor/settings.json"
        mkdir -p "$(dirname "$settings_file")"
        printf '{\n  "model": "%s"\n}\n' "$cursor_latest" > "$settings_file"
        if [ -f "$settings_file" ]; then
          local verify=$(grep -o '"model": "[^"]*"' "$settings_file" | cut -d'"' -f4)
          if [ "$verify" = "$cursor_latest" ]; then
            echo -e "${GREEN}✅ Cursor template updated to ${cursor_latest}${NC}"
            echo -e "${CYAN}   (Repository template updated - run install.sh on projects to apply)${NC}"
          else
            echo -e "${RED}❌ Error: Update failed${NC}"
          fi
        else
          echo -e "${RED}❌ Error: Could not write to $settings_file${NC}"
        fi
      else
        echo -e "${CYAN}   Skipped Cursor update${NC}"
      fi
    fi
  fi
}

show_model_versions() {
  local target="$1"

  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${MAGENTA}📋 Model Versions Configured:${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo ""

  if [ -f "$target/.claude/settings.json" ]; then
    local claude_model=$(grep -o '"model": "[^"]*"' "$target/.claude/settings.json" | cut -d'"' -f4)
    if [ -n "$claude_model" ]; then
      echo -e "${BLUE}Claude:${NC} ${YELLOW}$claude_model${NC}"
    else
      echo -e "${BLUE}Claude:${NC} ${YELLOW}Default (recommended)${NC}"
    fi
  fi

  if [ -f "$target/.cursor/settings.json" ]; then
    local cursor_model=$(grep -o '"model": "[^"]*"' "$target/.cursor/settings.json" | cut -d'"' -f4)
    if [ -n "$cursor_model" ]; then
      echo -e "${BLUE}Cursor:${NC} ${YELLOW}$cursor_model${NC}"
    fi
  fi

  echo ""

  check_model_updates "$target"

  echo ""
}

install_to_project() {
  local target="$1"

  [ ! -d "$target" ] && echo -e "${RED}❌ Directory not found: $target${NC}" && exit 1
  [ ! -w "$target" ] && echo -e "${RED}❌ No write permission${NC}" && exit 1

  target="$(cd "$target" && pwd 2>/dev/null)"

  if [ "$target" = "$SCRIPT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Installing in repository itself. Continue? (y/N)${NC}"
    read -r response
    [[ ! "$response" =~ ^[yY]$ ]] && echo -e "${BLUE}Cancelled.${NC}" && exit 0
  fi

  echo -e "${BLUE}🚀 Installing/Updating...${NC}"
  echo -e "${BLUE}📁 Target: $target${NC}\n"

  mkdir -p "$target"/{.cursor/rules,.cursor/skills,.claude,.claude/skills,.codex,.task-flow}

  [ -d "$SCRIPT_DIR/.cursor/rules" ] &&
    cp -r "$SCRIPT_DIR/.cursor/rules/"* "$target/.cursor/rules/" &&
    echo -e "${GREEN}✅ Cursor rules${NC}"

  if [ -d "$SCRIPT_DIR/.claude/skills" ]; then
    cp -r "$SCRIPT_DIR/.claude/skills/"* "$target/.claude/skills/" 2>/dev/null || true
    cp -r "$SCRIPT_DIR/.claude/skills/"* "$target/.cursor/skills/" 2>/dev/null || true
    echo -e "${GREEN}✅ Agent skills (.claude/skills + .cursor/skills)${NC}"
  fi


  [ -f "$SCRIPT_DIR/.cursor/settings.json" ] &&
    cp "$SCRIPT_DIR/.cursor/settings.json" "$target/.cursor/settings.json" &&
    echo -e "${GREEN}✅ Cursor settings${NC}"

  [ -f "$SCRIPT_DIR/.claude/settings.json" ] &&
    cp "$SCRIPT_DIR/.claude/settings.json" "$target/.claude/settings.json" &&
    echo -e "${GREEN}✅ Claude settings${NC}"

  [ -f "$SCRIPT_DIR/CLAUDE.md" ] &&
    cp "$SCRIPT_DIR/CLAUDE.md" "$target/CLAUDE.md" &&
    echo -e "${GREEN}✅ Claude instructions${NC}"

  [ -f "$SCRIPT_DIR/AGENTS.md" ] &&
    cp "$SCRIPT_DIR/AGENTS.md" "$target/AGENTS.md" &&
    echo -e "${GREEN}✅ Codex instructions (AGENTS.md)${NC}"

  if [ -f "$SCRIPT_DIR/.codex/config.toml" ] && [ ! -f "$target/.codex/config.toml" ]; then
    cp "$SCRIPT_DIR/.codex/config.toml" "$target/.codex/config.toml"
    echo -e "${GREEN}✅ Codex config (.codex/config.toml)${NC}"
  fi

  if [ -d "$SCRIPT_DIR/.task-flow" ]; then
    mkdir -p "$target/.task-flow"
    echo -e "${GREEN}✅ Task Flow directory${NC}"
    echo -e "${CYAN}   ℹ️  Note: .internal/ is protected, and on init tasks.input.txt, tasks.status.md, and tasks.flow.md are preserved if they already exist${NC}"
    [ ! -f "$target/.task-flow/tasks.input.txt" ] &&
      [ -f "$SCRIPT_DIR/.task-flow/tasks.input.txt" ] &&
      cp "$SCRIPT_DIR/.task-flow/tasks.input.txt" "$target/.task-flow/tasks.input.txt"
    [ ! -f "$target/.task-flow/tasks.status.md" ] &&
      [ -f "$SCRIPT_DIR/.task-flow/tasks.status.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/tasks.status.md" "$target/.task-flow/tasks.status.md"
    [ ! -f "$target/.task-flow/tasks.flow.md" ] && {
      printf '# Task Flow — Dependencies, Hours & Model Recommendations\n\n<!-- Populated by task-flow: generate flow. Do not edit manually. -->\n<!-- Horas: uso para cobrança ao cliente -->\n' > "$target/.task-flow/tasks.flow.md"
      echo -e "${GREEN}✅ Task Flow tasks.flow.md (empty - run task-flow: generate flow to populate)${NC}"
    }
    [ -f "$SCRIPT_DIR/.task-flow/README.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/README.md" "$target/.task-flow/README.md" &&
      echo -e "${GREEN}✅ Task Flow README${NC}"
    [ -f "$SCRIPT_DIR/.task-flow/GRAPHIFY.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/GRAPHIFY.md" "$target/.task-flow/GRAPHIFY.md" &&
      echo -e "${GREEN}✅ Graphify + Task Flow guide${NC}"
    [ -f "$SCRIPT_DIR/.task-flow/CODEX.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/CODEX.md" "$target/.task-flow/CODEX.md" &&
      echo -e "${GREEN}✅ Codex workflows (CODEX.md)${NC}"
    [ -f "$SCRIPT_DIR/.task-flow/CURSOR.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/CURSOR.md" "$target/.task-flow/CURSOR.md" &&
      echo -e "${GREEN}✅ Cursor guide (CURSOR.md)${NC}"
    if [ -d "$SCRIPT_DIR/.task-flow/docs" ]; then
      mkdir -p "$target/.task-flow/docs"
      cp -r "$SCRIPT_DIR/.task-flow/docs/"* "$target/.task-flow/docs/" 2>/dev/null || true
      echo -e "${GREEN}✅ Task Flow docs (coding-standards-full.md)${NC}"
    fi
    [ -f "$SCRIPT_DIR/.task-flow/AI-PLATFORMS.md" ] &&
      cp "$SCRIPT_DIR/.task-flow/AI-PLATFORMS.md" "$target/.task-flow/AI-PLATFORMS.md"
    [ -d "$SCRIPT_DIR/.task-flow/platforms" ] &&
      mkdir -p "$target/.task-flow/platforms" &&
      cp -r "$SCRIPT_DIR/.task-flow/platforms/"* "$target/.task-flow/platforms/" 2>/dev/null || true
    mkdir -p "$target/.task-flow/contexts" &&
      echo -e "${GREEN}✅ Contexts directory (.task-flow/contexts/)${NC}"
  fi

  [ ! -f "$target/.gitignore" ] && touch "$target/.gitignore"

  # Remove old entries if they exist
  sed -i '' '/^\.claude\/$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.cursor\/$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.task-flow\/$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^CLAUDE\.md$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^AGENTS\.md$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^# RBIN Task Flow/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.cursor\/rules\/$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.task-flow\/scripts\/tasks\.json$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.task-flow\/scripts\/status\.json$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^\.cursor\/rules\/\*\.local\.mdc$/d' "$target/.gitignore" 2>/dev/null
  sed -i '' '/^graphify-out\/$/d' "$target/.gitignore" 2>/dev/null

  if [ -f "$target/.cursor/rules/graphify.mdc" ]; then
    sed -i '' 's/alwaysApply: true/alwaysApply: false/g' "$target/.cursor/rules/graphify.mdc" 2>/dev/null || \
      sed -i 's/alwaysApply: true/alwaysApply: false/g' "$target/.cursor/rules/graphify.mdc" 2>/dev/null || true
    echo -e "${CYAN}   ℹ️  graphify.mdc set to alwaysApply: false (Task Flow priority)${NC}"
  fi

  # Add entries without comments
  {
    echo ""
    echo ".claude/"
    echo ".cursor/"
    echo ".task-flow/"
    echo "graphify-out/"
    echo "CLAUDE.md"
    echo "AGENTS.md"
  } >> "$target/.gitignore"

  echo -e "${GREEN}✅ .gitignore updated${NC}"

  echo -e "\n${GREEN}✨ Done!${NC}\n"

  show_model_versions "$target"

  echo -e "${BLUE}Next steps:${NC}"
  echo -e "   ${YELLOW}cd $target${NC}"
  echo -e "   ${CYAN}Cursor: @task-flow-sync, @task-flow-run  |  Claude: /task-flow-sync${NC}"
  echo -e "   ${CYAN}Codex: AGENTS.md + task-flow: sync / run (see .task-flow/CODEX.md)${NC}"
  echo -e "   ${CYAN}See .task-flow/README.md for all commands${NC}"
  echo -e "   ${CYAN}Graphify: rbin-task-flow init --graphify  (see .task-flow/GRAPHIFY.md)${NC}\n"
}

main() {
  show_header
  echo -e "${YELLOW}🚀 Install in a project${NC}\n"
  echo -e "${BLUE}Project path:${NC}"
  echo -e "${CYAN}(press ENTER to exit)${NC}\n"
  read -r -p "Path: " path

  [ -z "$path" ] && show_header && echo -e "${GREEN}👋 Goodbye!${NC}\n" && exit 0

  install_to_project "$path"
  pause

  show_header
  echo -e "${CYAN}Install in another project? (y/N)${NC}\n"
  read -r response

  [[ "$response" =~ ^[yY]$ ]] && main || (show_header && echo -e "${GREEN}👋 Goodbye!${NC}\n")
}

main
