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

## Testing Principles

- Cover the common paths that represent the 80% of real usage. Add edge-case tests only when the edge case is important or guards against a meaningful regression.
- Test observable features and user stories, not implementation details. Test internals only when an exceptionally difficult case cannot be covered reliably through public behavior.

## Comments

Comments should be concise and relavant to explaining the algorithm or feature. It should not explain changes or a history of the codebase. Comments should serve as documentation. Use simple punctuation. Do not use semicolons or em dashes, for example.
