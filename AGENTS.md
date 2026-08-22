<!-- managed:start -->

## Workspace Tools

- **Package Manager:** pnpm
- **Linter:** oxlint
- **Formatter:** prettier

### After Editing

✅ After editing files, format and lint only the files changed for the current task.

```sh
# Example
# Run format and lint for only files modified
pnpm exec prettier --config .config/prettier/base.json --ignore-path .config/prettier/prettierignore --write src/App.tsx src/core/systems/move-entity.ts
pnpm exec oxlint src/App.tsx src/core/systems/move-entity.ts
```

❌ Avoid unless explicitly approved:

```sh
pnpm format
pnpm lint
```

<!-- managed:end -->
