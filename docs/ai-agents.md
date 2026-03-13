# AI Agents

This project uses custom AI agents to provide specialized assistance for documentation, testing, and security reviews. Agents work with both Claude Code and GitHub Copilot.

## Source of truth

Agent definitions live in `ai/agents/`. Each agent is a Markdown file with instructions and project-specific context:

- `docs-agent.md` — Technical documentation writer
- `security-agent.md` — Frontend security reviewer
- `test-agent.md` — Unit and E2E test engineer

Edit agents here only. Do not edit files directly in `.github/agents/` or `.claude/agents/` — those are generated and will be overwritten by the sync script.

## Sync script

The `scripts/sync-agents.js` script copies agent files from `ai/agents/` to tool-specific locations:

| Tool           | Target directory  | Filename convention |
| -------------- | ----------------- | ------------------- |
| Claude Code    | `.claude/agents/` | `*.md`              |
| GitHub Copilot | `.github/agents/` | `*.agent.md`        |

Copilot expects the `.agent.md` extension, so the script renames files during sync. Claude Code uses the original `.md` filenames. The file contents are identical in both targets.

Run the sync after modifying any agent file:

```sh
yarn sync-agents
```

## How agents are used

**Claude Code** reads agent files from `.claude/agents/`. Agents are available as project-level subagents that Claude Code can invoke during conversations.

**GitHub Copilot** reads agent files from `.github/agents/`. Agents are available as subagents in Copilot Chat using the agent name defined in the YAML frontmatter at the top of each file (e.g., `docs-agent`, `test-agent`, `security-agent`).

Both tools also read `AGENTS.md` at the project root for shared configuration (tech stack, code style, workflow instructions) that applies to all agents.
