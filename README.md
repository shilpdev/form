# Shilp Form

Headless CRUD form components for React and Vue. Point a `Form` at an item id, give each of `read`, `create`, `update` and `delete` an operation (a handler, and optionally a schema and callbacks), plus `modeDetector`, `fieldsGenerator` and `schemaValidator`, and it handles the mode, the values, dirty and touched tracking, validation, loading flags and errors. You write all the markup.

| Package | npm | Framework |
| ------- | --- | --------- |
| [`@shilp.dev/react-form`](./packages/react) | [![npm](https://img.shields.io/npm/v/@shilp.dev/react-form.svg)](https://www.npmjs.com/package/@shilp.dev/react-form) | React 19 |
| [`@shilp.dev/vue-form`](./packages/vue) | [![npm](https://img.shields.io/npm/v/@shilp.dev/vue-form.svg)](https://www.npmjs.com/package/@shilp.dev/vue-form) | Vue 3.5 |

Both packages have the same API: the same component names, props, state keys, actions, defaults, default markup and default text. They grew out of `@7span/react-form` and `@7span/vue-form`.

## Features

- Headless: render props in React, scoped slots in Vue, and nothing is styled for you
- One component for create and edit: the mode comes from the item id (`+` or no id means create)
- Works with any schema library (Zod, Yup, Valibot) through `fieldsGenerator` and `schemaValidator`
- Works with any backend: every operation's `handler` returns a promise
- `onSuccess` and `onError` callbacks per operation
- Options are props of `Form`: write one wrapper component, reuse it everywhere
- Tracks `values`, `initialValues`, `dirty`, `dirtyValues` and `touched`
- One `schema` per operation, so create and update can have different fields
- Server errors are mapped to field errors by each operation's `onError`
- Loading flags per operation: `isReading`, `isCreating`, `isUpdating`, `isDeleting`, and `isRunning(key)` for any
- Custom operations: pass `operations` with your own keys and run one with `runOperation(key)` or `FormOperation`
- Written in TypeScript, with types included

## Quick start

`modeDetector`, `fieldsGenerator` and `schemaValidator` are required. These are used in both examples:

```ts
const fields = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
]

const modeDetector = ({ itemId }: { itemId?: string | number }) => {
  if (itemId === undefined || itemId === '+') {
    return 'create'
  }
  return 'update'
}

// Here the schema is already the list of fields. With Zod, build the list from the schema instead.
const fieldsGenerator = ({ schema }: { schema: unknown }) => {
  return schema as typeof fields
}

// Nothing to validate here. With Zod, parse `state.values` and throw when it fails.
const schemaValidator = async () => {}
```

React:

```tsx
import { Form, FormFields, FormCreate, FormUpdate, FormError } from '@shilp.dev/react-form'

export function UserForm({ id }: { id: string }) {
  return (
    <Form
      itemId={id}
      modeDetector={modeDetector}
      fieldsGenerator={fieldsGenerator}
      schemaValidator={schemaValidator}
      read={{ handler: (state) => api.get(`/users/${state.itemId}`) }}
      create={{
        schema: fields,
        handler: (state) => api.post('/users', state.values),
      }}
      update={{
        schema: fields,
        handler: (state) => api.patch(`/users/${state.itemId}`, state.values),
      }}
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
    :mode-detector="modeDetector"
    :fields-generator="fieldsGenerator"
    :schema-validator="schemaValidator"
    :read="{ handler: (state) => api.get(`/users/${state.itemId}`) }"
    :create="{ schema: fields, handler: (state) => api.post('/users', state.values) }"
    :update="{ schema: fields, handler: (state) => api.patch(`/users/${state.itemId}`, state.values) }"
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

There is no global setup. The options are required props of `Form`. To share them, write a wrapper component that sets them and passes down only the props the page needs (`AppForm` in the demo apps) and use it across your app.

| Option | Signature | What it does |
| ------ | --------- | ------------ |
| `modeDetector` | `({ itemId }) => 'create' \| 'update'` | Decides which item ids mean create (for example `undefined` or `'+'`). Any other return value logs a warning and is treated as `'update'` |
| `fieldsGenerator` | `({ schema }) => Field[]` | Turns the schema of the current mode into `{ name, label, value? }` fields |
| `schemaValidator` | `(state, operation) => Promise`, reject to stop | Runs before the handler of every operation that has a `schema`. `operation` is the one being run, so read its `schema` there |

### `Form` props

`itemId`, the operations `read`, `create`, `update` and `delete`, the list `operations` for custom ones, and the options above. Each operation is an object:

| Key | Type | |
| --- | ---- | --- |
| `handler` | `(state) => Promise<OperationResponse>` | Required. Does the request |
| `schema` | anything your `fieldsGenerator` and `schemaValidator` accept | Create mode uses `create.schema` for the fields, update mode uses `update.schema`. When set, `schemaValidator` runs before the handler; without it, nothing is validated |
| `onSuccess` | `(state) => void` | After the response is stored and its `values` are loaded into the form; the response is `state.response` |
| `onError` | `(error, state) => OperationError \| undefined` | Gets whatever was thrown. Return `{ name, message, fieldErrors }` to set `error` and `fieldErrors`; return nothing to leave them empty |
| `meta` | object | Free-form data for your own use; read it back from `state.operations` |

`OperationResponse` is `{ values?: Record<string, unknown>, ...anything else }`. When `values` is present it is loaded into the form; the whole object is stored as `state.response`, which `onSuccess` reads.

`fields` is the array that `fieldsGenerator` returns for your schema.

### Context

Every slot and render prop gets `{ context }`. In React, `useFormContext()` returns the same object. Vue has no such composable: use the slot scope.

- State: `mode`, `itemId`, `fields`, `values`, `initialValues`, `dirtyValues`, `touched`, `dirty`, `error`, `fieldErrors`, `response`, `operations`, `isCreateMode`, `isUpdateMode`, `running` (a `{ [key]: boolean }` record), `isLoading` and one flag per action
- Actions: `runOperation(key)` (`'create'`, `'read'`, `'update'`, `'delete'` or a custom key), `isRunning(key)`, `setFieldValue(name, value)`, `setFieldError(name, message)`, `setFieldErrors(errors)` (replaces all field errors), `clearErrors`, `reset`, `refresh`

Actions never throw: a failed request is stored in `error` and `fieldErrors`.

### Components

| Component | Shown when | Extra scope |
| --------- | ---------- | ----------- |
| `Form` | always | |
| `FormFields` | always | |
| `FormField name="..."` | the field is in the schema | `field`, `name`, `label`, `value`, `error`, `updateValue`, plus `inputProps` (React) or `model` and `nativeModel` (Vue) |
| `FormFieldError name?="..."` | the field has an error. Inside a `FormField` it needs no `name`; with a `name` it shows that field's error | `error` |
| `FormCreate` | create mode | `run` |
| `FormUpdate` | update mode | `run` |
| `FormDelete` | update mode, not reading | `run` |
| `FormOperation operation="..."` | always | `run` (runs the operation with that key) |
| `FormError` | there is an error | |

CSS classes: `shilp-form`, `shilp-form__fields`, `shilp-form__field`, `shilp-form__field-error`, `shilp-form__create`, `shilp-form__update`, `shilp-form__delete`, `shilp-form__error`.

## Repository

```
packages/react    @shilp.dev/react-form
packages/vue      @shilp.dev/vue-form
shared/           types, messages and logic used by both packages
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
- `modeDetector` replaces React's `isNewItemCheck` and returns `'create'` or `'update'` (lowercase). It has no default: you decide which ids mean create.
- `schemaValidator(state)` rejects to stop the request. React's `{ success, errors }` return value is gone: throw an error and return it as `fieldErrors` from the operation's `onError`.
- Field errors live in `context.fieldErrors`. `FormField` gets `error` as a string.
- React: `FormField` gives `inputProps` (`{ name, value, onChange }`) where it gave `field`; `field` is now the field definition, as in Vue.
- React `FormDelete` and Vue `FormDelete` now both show only in update mode.
- Actions no longer throw on a validation error. Read `context.error` instead.

## License

[MIT](./LICENSE)
