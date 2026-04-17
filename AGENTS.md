# Repository Instructions

## Default

- Keep changes scoped to the user's request.
- Prefer reading existing files and patterns before making edits.
- When adding or updating files, keep content concise and maintainable.

## Vim Learning Workflow

When the user asks to learn, discuss, review, or persist Vim / Neovim / LazyVim study content in this repository, follow [AGENTS-learning-vim.md](D:\program\Dog-Du.github.io\AGENTS-learning-vim.md) as the task-specific rule set.

Key points:

- Prioritize practical usage over history or exhaustive command coverage.
- Treat local actual behavior as the first truth when available:
  - `vim --version`
  - `nvim --version`
  - `:help`
  - `:checkhealth`
  - actual key behavior in the installed environment
- Treat official Vim help, Neovim help, and LazyVim documentation as primary references.
- Persist generated study content under `content/posts`.
- Keep the Vim study index file unique and stable at `content/posts/learning-vim-day000-index.md`; update it instead of creating dated index variants.
- Use the `learning-vim-dayXXX-YYYY-MM-DD-<topic>.md` naming scheme for new Vim learning files.
- Allow one special Day 000 overview file for roadmap and environment preparation.
- Treat the daily article as the primary knowledge document and the index file as lightweight navigation.
- Use a task-driven teaching style with a concept skeleton:
  - start from real editing tasks
  - then explain the minimal commands and mental model behind them
- Every daily article should include a short practice section that can be done in about `5-10` minutes.
- Keep low-frequency or optional material in `扩展内容` instead of the main path.
- If there is no stronger signal from the index, continue along the default `14`-day path:
  1. Day 000: roadmap and environment preparation
  2. Vim modes and editing mindset
  3. movement
  4. operator + motion
  5. text objects
  6. search / replace / visual mode
  7. buffers / windows / splits
  8. useful command-line mode operations
  9. Vim high-frequency advanced integration
  10. Neovim positioning plus terminal / clipboard / config / health
  11. LazyVim overview and default workflow
  12. LazyVim file / search / buffer workflow
  13. LazyVim code navigation and LSP basics
  14. LazyVim editing loop and daily working set
  15. review / consolidation / optional extensions
