const fs = require('fs');
const path = require('path');

// Source of truth: ai/agents/ directory
// Targets:
//   - .claude/agents/*.md (Claude Code subagents)
//   - .github/agents/*.agent.md (GitHub Copilot agents)

const rootDir = path.join(__dirname, '..');
const aiDir = path.join(rootDir, 'ai', 'agents');
const claudeAgentsDir = path.join(rootDir, '.claude', 'agents');
const copilotAgentsDir = path.join(rootDir, '.github', 'agents');

const sourceFiles = fs.readdirSync(aiDir).filter((f) => f.endsWith('.md'));

if (sourceFiles.length === 0) {
  console.log('No agent files found in ai/');
  process.exit(0);
}

let synced = 0;

for (const file of sourceFiles) {
  const content = fs.readFileSync(path.join(aiDir, file), 'utf8');

  console.log(`${file}`);

  // Sync to Claude Code subagents
  const claudePath = path.join(claudeAgentsDir, file);
  fs.mkdirSync(claudeAgentsDir, { recursive: true });
  fs.writeFileSync(claudePath, content);
  console.log(`  → Claude:  ${path.relative(rootDir, claudePath)}`);
  synced++;

  // Sync to Copilot agents (uses .agent.md extension)
  const copilotFile = file.replace(/\.md$/, '.agent.md');
  const copilotPath = path.join(copilotAgentsDir, copilotFile);
  fs.mkdirSync(copilotAgentsDir, { recursive: true });
  fs.writeFileSync(copilotPath, content);
  console.log(`  → Copilot: ${path.relative(rootDir, copilotPath)}`);
  synced++;
}

console.log(`\nSynced ${synced} file(s) from ${sourceFiles.length} agent(s).`);
