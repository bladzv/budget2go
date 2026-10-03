---
name: generate-logs
description: Record changes from the current Codex session in .github/actions.md using the local Git history and working tree as evidence.
---

# Generate Session Change Log

Use this skill when asked to record the changes made in the current session in `.github/actions.md`.

1. Read `.github/actions.md` if it exists. If it does not, create it when writing the first entry. Avoid duplicate entries by comparing the existing log with the current session's changes.
2. Inspect local Git state with `git status`, `git diff`, and relevant commit history. Use `origin/main` only if the reference exists locally; do not fetch or claim to have inspected remote changes. If the comparison point is unavailable, describe only changes supported by the current working tree and session context.
3. Include every relevant change made in the session and identify the files changed. Do not invent issue references, timestamps, tests, rationale, or technical details. Get the current UTC timestamp with `date -u "+%Y-%m-%d %H:%M:%S UTC"` when writing an entry.
4. Append one entry in this format, preserving prior entries:

```markdown
# Action: [Short descriptive title]
Timestamp: [YYYY-MM-DD HH:MM:SS UTC]

## Changes Made
- [Description]

## Files Modified
- `path/to/file` - [Brief description]

## Rationale
[Reason for the changes]

## Technical Notes
- [Relevant implementation, security, performance, dependency, or follow-up detail; omit unsupported claims]

---
```

5. Confirm that the new entry was appended and report its location. Do not stage, commit, or push changes as part of this skill.
