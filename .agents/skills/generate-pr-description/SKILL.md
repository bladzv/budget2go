---
name: generate-pr-description
description: Draft a pull request description from the current branch changes, with a suggested branch name and conventional commit message.
---

# Generate Pull Request Description

Use this skill when asked to prepare a PR description from the current repository changes.

1. Inspect `git status`, the diff against the available base branch (prefer local `origin/main` when present), and relevant commit history. Do not fetch, push, create a branch, or open a PR. If the base reference is unavailable, use the current diff and session context, and state that limitation in the testing notes.
2. Suggest a semantic branch name using `feature/`, `fix/`, `refactor/`, `chore/`, `docs/`, or `security/`, followed by a concise kebab-case description under 50 characters.
3. Suggest a conventional commit message in `[type]([scope]): [description]` format. Use an appropriate type such as `feat`, `fix`, `refactor`, `chore`, `docs`, `security`, `perf`, or `test`; keep the description imperative, lowercase, and under 72 characters.
4. Include related issue references only when they are present in the repository or supplied in the session. Do not claim to search GitHub issues unless a connected GitHub tool is available and used.
5. Draft a PR description using the template below. Treat absent categories as `None`, and base testing, security, performance, and dependency claims on evidence.
6. Save to `.github/pr_description.md` only when the user asks for the file to be written; otherwise present the draft in the response. If writing, preserve any existing content by appending the new entry. Do not stage, commit, push, or create the PR.

```markdown
# PR: [Short imperative title]
Timestamp: [YYYY-MM-DD HH:MM:SS UTC]
Git Branch: [Suggested branch name]
Git Commit Message: [Suggested commit message]

---

## Summary
[2–4 sentence paragraph]

## Related Issues
None

## Added Features
None

## Changes
None

## Fixes
None

## Files Changed
| File | Change |
|---|---|
| `path/to/file` | [One-line description] |

## Testing Notes
[Tests actually run or clear verification steps; state limitations]

## Security Considerations
No security changes in this PR

## Performance Impact
No significant performance impact

## Breaking Changes
None

## Dependencies
None

## Follow-up Items
None

---
```
