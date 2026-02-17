# npm-package-template

A modern NPM package template powered by [Bun](https://bun.sh), TypeScript, and Biome.

## Features

- **Bun** - Fast runtime, package manager, and test runner
- **TypeScript** - Strict mode, ESNext target, decorator support
- **Biome** - Linting, formatting, and import organization
- **Husky** - Pre-commit linting (lint-staged) and conventional commit message validation
- **GitHub Actions CI** - Build, lint, and typecheck on push/PR to main
- **Semantic versioning** - Auto version bumps based on conventional commits
- **Environment docs generation** - Auto-generate env variable documentation from `.env.sample` files
- **Dual package output** - CJS + ESM + type declarations

## Getting Started

```bash
# Install dependencies
bun install

# Run in development mode (watch)
bun run dev

# Build
bun run build

# Run tests
bun test

# Lint & format
bun run lint
bun run format

# Type check
bun run typecheck
```

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Watch mode development |
| `bun run start` | Run compiled output |
| `bun run build` | Compile TypeScript |
| `bun test` | Run tests (bail on first failure) |
| `bun test --watch` | Run tests in watch mode |
| `bun run lint` | Lint and auto-fix with Biome |
| `bun run format` | Format code with Biome |
| `bun run typecheck` | Type check without emitting |
| `bun run version` | Bump version from conventional commits |
| `bun run version:dry-run` | Preview version bump |
| `bun run gen:env:docs` | Generate env variable docs |
| `bun run mod:cost` | Analyze dependency costs |

## Project Structure

```
src/               # Source code
dist/              # Compiled output (CJS, ESM, type declarations)
scripts/           # Utility scripts (versioning, env docs)
.github/ci.yml     # CI workflow
.husky/            # Git hooks
```

## Commit Convention

Commits are validated against the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope)?: description
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `test`, `style`, `refactor`, `perf`, `build`, `ci`, `revert`, `security`, `sync`

## Versioning

Run `bun run version` to auto-bump based on the last commit message:

- **Breaking change** (`!` suffix or `BREAKING CHANGE` in body) → major
- **`feat:`** → minor
- **Everything else** → patch

Use `bun run version:dry-run` to preview without making changes.

## License

[MIT](LICENSE)

## Speed
```sh
bun run --parallel build lint typecheck
lint      | Checked 8 files in 8ms. No fixes applied.
lint      | Done in 165ms
build     | Done in 484ms
typecheck | Done in 511ms
```