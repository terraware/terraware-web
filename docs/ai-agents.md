# AI Agents

This project uses custom AI agents to provide specialized assistance for documentation, testing, and security reviews. Agents work with both Claude Code and GitHub Copilot.

## Source of truth

Agent definitions live in `.claude/agents/`. Each agent is a Markdown file with instructions and project-specific context:

- `docs-agent.md` — Technical documentation writer
- `security-agent.md` — Frontend security reviewer
- `test-agent.md` — Unit and E2E test engineer

## How agents are used

Both **Claude Code** and **GitHub Copilot** read agent files from `.claude/agents/`. Agents are available as subagents that either tool can invoke during conversations, using the agent name defined in the YAML frontmatter at the top of each file (e.g., `docs-agent`, `test-agent`, `security-agent`).

Both tools also read `AGENTS.md` at the project root for shared configuration (tech stack, code style, workflow instructions) that applies to all agents.
