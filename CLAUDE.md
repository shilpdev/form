# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm monorepo (pnpm 11.9, Node 22) for `@shilp.dev/react-form` and `@shilp.dev/vue-form`: headless CRUD form components (read, create, update, delete an item) where the consumer owns the UI through slot components. The two packages are parallel implementations of one API. The repository is `shilpdev/form`; it follows the layout and rules of `shilpdev/list`.

## Product context

From the 7Span docs (https://7span.com/open-source/vue-form/ and https://7span.com/open-source/react-form/). These describe the older `@7span/vue-form` 4.x and `@7span/react-form` 1.x, so props and methods differ from the code; the purpose is the same:

- Generates forms from a schema (for example Zod) through two adapters: `schemaToFields` and `validateSchema`.
- One component handles create and edit. The mode comes from the item id (`resolveMode`).
- **Headless / UI-agnostic:** consumers control all markup through slots (scoped slots in Vue, render props in React).
- **Configuration by wrapper:** there is no global setup. Options are props of the root `Form`; a consumer who wants them everywhere writes a wrapper component and reuses it (the demo apps have `AppForm`).
- Created by 7Span.

Treat the code and the `shared/` types as the source of truth for the current API; use the docs only for intent.

## Layout

- `packages/react`, `packages/vue`: the published libraries (Vite lib mode, output to `dist/`).
- `shared/`: code both libraries use. `shared/types/` holds the TypeScript types (`FormState`, `FormContext`, `FormPropsBase`, `FieldScope`, ...). `shared/constants.ts` holds `ACTION_LABELS`. `shared/messages.ts` holds every message the packages show or throw (static text as `*_MESSAGE` constants, text built from values as `get*Message` functions). `shared/options.ts` holds the default option functions (`defaultResolveMode`, `defaultSchemaToFields`, `defaultValidateSchema`, `defaultErrorAdapter`), the fallback of each option prop. `shared/utils.ts` holds the framework-agnostic logic (`resolveSchema`, dirty and touched helpers, `isActionVisible`, `getActionLabel`, `getInputValue`). Not a workspace package: both libraries import types from `@shared`, and logic from `@shared/utils`, `@shared/options` and `@shared/constants` (the `@shared` alias is set in each package's `vite.config.ts` and `tsconfig.json`). `shared/` resolves npm packages from the repo root, so a package it imports (such as `fast-deep-equal`) must be a root dependency.
- `apps/next-demo`, `apps/nuxt-demo`: demo apps for manual testing against the packages, with an in-memory users API and Zod adapters. There are no automated tests.

## Architecture

The root component (`Form` in `packages/react/src/components/form.tsx`, `form.vue` in Vue) owns all state and exposes it with the actions through a context (`useFormContext` in both packages). Slot components (`FormFields`, `FormField`, `FormFieldError`, the three action buttons and `FormError`) read that context and throw if used outside the root. Every slot scope has a `context` key; handlers, `validateSchema` and `errorAdapter` get only the `FormState` (data, no methods). `FormField` adds the values it computes for one field.

Each action (`readItem`, `createItem`, `updateItem`, `deleteItem`) is its own function in the root component, written as one promise chain (`.then(onResponse).catch(onError).finally(...)`): flag on, clear the error, validate (create and update only), call the handler, store the response, adapt any error, flag off. Errors are stored, never thrown.

React keeps the user-edited data (`values`, `initialValues`, `touched`, `dirty`, `fieldErrors`, `error`, `response`) in one `dataRef` that is updated synchronously and mirrored into state for rendering, so an action called in the same event as `setValue` sends the new value. Vue uses one `ref` each and a `reactive` context. The three action buttons share one internal `ActionButton` per package. Options are props of `Form`; each falls back to its default in `shared/options.ts` (destructuring defaults in React, `withDefaults` in Vue).

## Engineering rules

The rules of `shilpdev/list` apply here unchanged. The ones that matter most:

- Parity: both packages have the same API, props, state keys, defaults, default markup and default text. When you change one, change the other in the same task. Record a known difference in `PARITY.md`.
- Anything that is the same in both frameworks lives once in `shared/`. The framework layer only adapts reactivity, lifecycle, rendering and event wiring.
- User-visible text lives in `shared/messages.ts`.
- Define a type once; keep framework-specific types (`InputProps`, `VueFieldScope`) in their package.
- Booleans start with `is` or `has`. Props types end in `Props`, slot scopes in `Scope`. Internal React setters take a `_` prefix.
- File names have no prefix; an exported component is `Form` plus the PascalCase file name (`field-error.tsx` exports `FormFieldError`).
- Always use braces; no ternaries for logic; a function that returns a value uses braces and an explicit `return`.
- Import types and runtime code separately.
- After a change, run the type check, lint, both library builds and the type checks of both apps. Read build output for errors too.
- Keep `README.md`, `CLAUDE.md`, `LIFECYCLE.md` and `PARITY.md` in step with the code.
- When you finish, list the breaking changes for consumers and any decision you made on the user's behalf.

## Commands

Run from repo root:

```bash
pnpm install
pnpm build:packages          # build both libs (required before typecheck/lint/apps)
pnpm build:react-form        # or build:vue-form
pnpm typecheck               # typecheck both packages
pnpm lint                    # eslint for both packages
pnpm format                  # prettier --write src/ in both packages
pnpm dev:next                # also dev:nuxt (dev runs all apps in parallel)
pnpm build:next              # also build:nuxt (build:apps builds all; build = packages + apps)
pnpm start:next              # serve a built app; also start:nuxt
```
