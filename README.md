# Shilp Form

Headless CRUD form components for React and Vue. Point a `Form` at an item id and a schema, give it your `read`, `create`, `update` and `delete` functions, and it handles the mode, the values, dirty and touched tracking, validation, loading flags and errors. You write all the markup.

| Package | npm | Framework |
| ------- | --- | --------- |
| [`@shilp.dev/react-form`](./packages/react) | [![npm](https://img.shields.io/npm/v/@shilp.dev/react-form.svg)](https://www.npmjs.com/package/@shilp.dev/react-form) | React 19 |
| [`@shilp.dev/vue-form`](./packages/vue) | [![npm](https://img.shields.io/npm/v/@shilp.dev/vue-form.svg)](https://www.npmjs.com/package/@shilp.dev/vue-form) | Vue 3.5 |

Both packages have the same API: the same component names, props, state keys, actions, defaults, default markup and default text. They grew out of [`@7span/react-form`](https://7span.com/open-source/react-form/) and [`@7span/vue-form`](https://7span.com/open-source/vue-form/).

## Features

- Headless: render props in React, scoped slots in Vue, and nothing is styled for you
- One component for create and edit: the mode comes from the item id (`+` or no id means create)
- Works with any schema library (Zod, Yup, Valibot, a plain array) through `schemaToFields` and `validateSchema`
- Works with any backend: every handler is a function that returns a promise
- Options are props of `Form`: write one wrapper component, reuse it everywhere
- Tracks `values`, `initialValues`, `dirty`, `dirtyValues` and `touched`
- Separate `createSchema` and `updateSchema` when the two modes need different fields
- Server errors are mapped to field errors through one `errorAdapter`
- Loading flags per action: `isReading`, `isCreating`, `isUpdating`, `isDeleting`
- Written in TypeScript, with types included

## Quick start

React:

```tsx
import { Form, FormFields, FormCreate, FormUpdate, FormError } from '@shilp.dev/react-form'

export function UserForm({ id }: { id: string }) {
  return (
    <Form
      itemId={id}
      schema={[
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'Email' },
      ]}
      read={(state) => api.get(`/users/${state.itemId}`)}
      create={(state) => api.post('/users', state.values)}
      update={(state) => api.patch(`/users/${state.itemId}`, state.values)}
    >
      <FormFields />
      <FormError />
      <FormCreate />
      <FormUpdate />
    </Form>
  )
}
```

Vue:

```vue
<template>
  <Form
    :item-id="id"
    :schema="[
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
    ]"
    :read="(state) => api.get(`/users/${state.itemId}`)"
    :create="(state) => api.post('/users', state.values)"
    :update="(state) => api.patch(`/users/${state.itemId}`, state.values)"
  >
    <FormFields />
    <FormError />
    <FormCreate />
    <FormUpdate />
  </Form>
</template>

<script setup lang="ts">
import { Form, FormFields, FormCreate, FormUpdate, FormError } from '@shilp.dev/vue-form'
defineProps<{ id: string }>()
</script>
```

Every handler resolves with `{ values }` (plus anything else you want to keep in `context.response`). Without children, `FormFields` renders a labelled input for every field, so the snippets above are a working form. Pass your own children to control the markup. The demo apps show a full example with Zod, custom inputs and every action.

## API

### Options

There is no global setup. Options are props of `Form`; a prop wins over the default. To share them, write a wrapper component that sets them and forwards the rest (`AppForm` in the demo apps) and use it across your app.

| Option | Signature | Default |
| ------ | --------- | ------- |
| `resolveMode` | `({ itemId }) => 'create' \| 'update'` | `create` when `itemId` is `undefined`, `null`, `''` or `'+'` |
| `schemaToFields` | `(schema) => Field[]` | Uses the schema when it is an array of `{ name, label, value? }` objects |
| `validateSchema` | `(state) => Promise`, reject to stop | Always passes |
| `errorAdapter` | `(error, state) => { name, message, fieldErrors }` | Reads `name`, `message` and `errors` from the thrown value |

### `Form` props

`itemId`, `schema`, `createSchema`, `updateSchema`, `meta`, the handlers `read`, `create`, `update`, `delete` (each `(state) => Promise<{ values?, ... }>`), and the options above.

### Context

Every slot and render prop gets `{ context }`. `useFormContext()` returns the same object.

- State: `mode`, `itemId`, `fields`, `values`, `initialValues`, `dirtyValues`, `touched`, `dirty`, `error`, `fieldErrors`, `response`, `meta`, `isCreateMode`, `isUpdateMode`, `isLoading` and one flag per action
- Actions: `readItem`, `createItem`, `updateItem`, `deleteItem`, `setValue(name, value)`, `setFieldError(name, message)`, `setFieldErrors(errors)`, `clearErrors`, `resetForm`, `refresh`

Actions never throw: a failed request is stored in `error` and `fieldErrors`.

### Components

| Component | Shown when | Extra scope |
| --------- | ---------- | ----------- |
| `Form` | always | |
| `FormFields` | always | |
| `FormField name="..."` | the field is in the schema | `field`, `name`, `label`, `value`, `error`, `updateValue`, plus `inputProps` (React) or `model` and `nativeModel` (Vue) |
| `FormFieldError name="..."` | the field has an error | `error` |
| `FormCreate` | create mode | |
| `FormUpdate` | update mode | |
| `FormDelete` | update mode, not reading | |
| `FormError` | there is an error | |

CSS classes: `shilp-form`, `shilp-form__fields`, `shilp-form__field`, `shilp-form__field-error`, `shilp-form__create`, `shilp-form__update`, `shilp-form__delete`, `shilp-form__error`.

## Repository

```
packages/react    @shilp.dev/react-form
packages/vue      @shilp.dev/vue-form
shared/           types, defaults, messages and logic used by both packages
apps/next-demo    Next.js demo (port 3002)
apps/nuxt-demo    Nuxt demo with Nuxt UI (port 3007)
```

## Development

Needs Node 22 and pnpm 11.

```bash
pnpm install
pnpm build:packages   # build both libraries (needed before the apps)
pnpm typecheck
pnpm lint
pnpm dev              # both demo apps; or dev:next / dev:nuxt
```

See [CLAUDE.md](./CLAUDE.md) for the engineering rules, [LIFECYCLE.md](./LIFECYCLE.md) for the request flow and [PARITY.md](./PARITY.md) for known differences between the packages.

## Migrating from `@7span/react-form` and `@7span/vue-form`

- Components lost their framework prefix: `ReactForm` and `VueForm` are now `Form`, `ReactFormField` and `VueFormField` are now `FormField`, and so on. `ReactFormProvider` is gone: pass the options as props, or write a wrapper around `Form`.
- Vue: the default export and the plugin are gone. Import the components directly.
- Handlers take one argument, the form state: `read(state)`, `update(state)`, and so on. React's `read(itemId, context)` becomes `read(state)` with `state.itemId`.
- `resolveMode` replaces React's `isNewItemCheck` and returns `'create'` or `'update'` (lowercase). The default treats `'+'` and an empty id as create; React used `'create'`.
- `validateSchema(state)` rejects to stop the request. React's `{ success, errors }` return value is gone: throw `{ errors }` instead, and the default `errorAdapter` turns it into `fieldErrors`.
- Field errors live in `context.fieldErrors`. `FormField` gets `error` as a string.
- React: `FormField` gives `inputProps` (`{ name, value, onChange }`) where it gave `field`; `field` is now the field definition, as in Vue.
- React `FormDelete` and Vue `FormDelete` now both show only in update mode.
- Actions no longer throw on a validation error. Read `context.error` instead.

## License

[MIT](./LICENSE)
