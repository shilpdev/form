# Form parity: React vs Vue

`packages/vue` is the reference implementation: it is the one that has been checked and tested. Each row below is a place where `packages/react` behaves or is shaped differently from it. Unless a row says otherwise, the fix is to change React to match Vue.

Priority: **High** gives a consumer wrong data or wrong requests. **Medium** is a behaviour or API difference a consumer can run into. **Low** is internal or cosmetic.

## Root component (`form.tsx` vs `form.vue`)

| Priority | Area | Vue (reference) | React | To match Vue |
| -------- | ---- | --------------- | ----- | ------------ |
| Low | First render | `init()` runs in `setup()`, before the first render: the fields already have their default values, and in update mode `isReading` is already `true` | `init()` runs in `useEffect`, after the first render. For one frame the values are `{}`, and in update mode `isReading` is `false`, so `FormDelete` shows and `FormUpdate` says "Update" instead of "Loading..." | Load the defaults when `dataRef` is created, and start in a reading state in update mode. Running `read` itself has to stay in the effect |
| Low | React StrictMode | `read` runs once on mount | In development StrictMode runs the effect twice, so `read` is requested twice on mount | Only needed if double requests in development are a problem: ignore the response of the first request |
| Low | Functions kept from an old render | `runOperation`, `resetForm` and the other actions read `props` when they run, so they always use the current operations and fields | Each render creates new actions that close over that render's `operations` and `fields`. An action saved earlier (for example inside an effect with missing dependencies) runs the old `handler` | Read `operations` and `fields` through a ref inside the actions |
| Low | Plain or reactive objects in callbacks | `getState()` unwraps `values`, `initialValues`, `touched`, `dirty` and `fieldErrors` with `toRaw`, but `error`, `response`, `fields`, `operations` and `dirtyValues` come out as reactive proxies | Every key is a plain object | **Change Vue, not React:** also `toRaw` the other object keys. A proxy breaks `structuredClone` and makes a callback's changes reactive |

## Context access

| Priority | Difference | React | Vue |
| -------- | ---------- | ----- | --- |
| Medium | Reading the context outside a slot | `useFormContext()` is exported and throws when used outside `Form` | No composable is exported; read `context` from the slot scope. The slot components inject it directly and do not check that a `Form` exists |

## Slot components

| Priority | Component | Vue (reference) | React | To match Vue |
| -------- | --------- | --------------- | ----- | ------------ |
| Low | `FormField` default `<input>` value | `nativeModel.value` is `value ?? ''`, so a boolean or number is passed through as it is | `inputProps.value` is the value only when it is a string, a number or an array, and `''` otherwise, so `true` and `false` show as an empty input | Pass the value through like Vue, falling back to `''` only for `null` and `undefined`. The `InputProps.value` type has to widen with it |

Checked and matching: `FormFields`, `FormFieldError`, `FormError`, `FormCreate`, `FormUpdate`, `FormDelete` and `FormOperation` have the same props, show condition, slot scope (`{ context }`, plus `run` on the buttons and `error` on `FormFieldError`), default markup, default text and `shilp-form__*` class. `FormField` matches except for the row above.

## State and actions

Checked and matching: both packages put the same keys in `FormState` and the same actions in `FormContext`, and `setFieldValue`, `setFieldError`, `setFieldErrors`, `clearErrors`, `resetForm`, `refresh`, `init` and `runOperation` follow the same steps in the same order.

## Shared issues (same in both, so not a parity row)

Listed so they are not mistaken for drift. Fix them in both packages in the same change.

- `runOperation` with a key that no operation has throws a `TypeError` before the promise chain starts. The error is thrown instead of stored, and that key's flag stays on, so `isLoading` stays `true` and every default button stays disabled.
- Update mode without a `read` prop: setup calls `runOperation('read')` and hits the same error on mount.
- `FormDelete` has a "Loading..." label branch that can never run, because the component is hidden while `isReading` is `true`.

## Not tracked here

These differ because the frameworks differ, not because the code drifted:

- Input bindings in the `FormField` scope: `inputProps` (`{ name, value, onChange }`) in React; `model` (`modelValue` and `onUpdate:modelValue`) and `nativeModel` (`{ name, value, onInput }`) in Vue.
- React passes `children` as nodes or a render function; Vue uses scoped slots.
- The imperative handle is a `ref` prop with the context in React and `defineExpose(toRefs(context))` in Vue.
- React keeps the form data in `dataRef` plus a state mirror (see `commit` in `form.tsx`); Vue uses one `ref` per key. Only the behaviour differences this causes are rows above.
- Type exports: React exports its prop and scope types (`FormProps`, `FormFieldProps`, `ReactFieldScope`, `InputProps`, ...); Vue exports `FormProps` and `VueFieldScope`, and its slot types come from the templates.

Remove a row once it is fixed, and add one when a new difference shows up.
