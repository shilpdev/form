import type { FieldScope, FormOptions } from '@shared'

/** `FieldScope` plus the Vue-only bindings. */
export interface VueFieldScope<Schema = unknown> extends FieldScope<Schema> {
  /*
   * `any` on purpose: these objects are spread on components whose `modelValue` type the package
   * cannot know (`string` for an input, `string[]` for a multi select, ...).
   */
  /** For components with `v-model`: `<UInput v-bind="model" />`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: { modelValue: any; 'onUpdate:modelValue': (value: any) => void }
  /** For native inputs: `<input v-bind="nativeModel" />`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nativeModel: { name: string; value: any; onInput: (event: Event) => void }
}

/** `app.use(ShilpForm, options)`: the form options plus the prefix for the global component names. */
export interface PluginOptions<Schema = unknown> extends Partial<FormOptions<Schema>> {
  /** `'Ui'` registers `UiForm`, `UiFormField`, ... Leave empty for `Form`, `FormField`, ... */
  componentPrefix?: string
}
