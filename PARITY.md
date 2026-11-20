# Form parity: React vs Vue

Each row is a place where `packages/react` behaves or is shaped differently from `packages/vue`. Priority: **High** gives a consumer wrong data or wrong requests. **Medium** is a behaviour or API difference a consumer can run into. **Low** is internal or cosmetic.

## Root component (`form.tsx` vs `form.vue`)

| Priority | Difference | React | Vue |
| -------- | ---------- | ----- | --- |
| Low | React StrictMode | Setup runs in an effect, so in development `read` is called twice on mount | Runs once |
| Low | Field list identity | Fields are memoized on the schema object, so an inline `fieldsGenerator` prop that changes is picked up only when the schema changes | Recomputed whenever the schema or the options change |

## Context access

| Priority | Difference | React | Vue |
| -------- | ---------- | ----- | --- |
| Medium | Reading the context outside a slot | `useFormContext()` is exported and throws when used outside `Form` | No composable is exported; read `context` from the slot scope. The slot components inject it directly and do not check that a `Form` exists |

## Slot components

No differences. Every pair has the same props, show condition, default markup and text, and `shilp-form__*` class.

## Not tracked here

These differ because the frameworks differ, not because the code drifted:

- Input bindings in the `FormField` scope: `inputProps` (`{ name, value, onChange }`) in React; `model` (`modelValue` and `onUpdate:modelValue`) and `nativeModel` (`{ name, value, onInput }`) in Vue.
- React passes `children` as nodes or a render function; Vue uses scoped slots.
- The imperative handle is a `ref` prop with the context in React and `defineExpose(toRefs(context))` in Vue.

Remove a row once it is fixed, and add one when a new difference shows up.
