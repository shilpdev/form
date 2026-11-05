/** A field after `normalizeFields`: always has a `name` and a `label`. Extra keys are kept. */
export interface Field {
  name: string
  label: string
  /** Default value used in create mode and by `resetForm`. */
  value?: unknown
  /** Nested fields (for example a repeater), serialized the same way by `attrSerializer`. */
  attrs?: Field[]
  [key: string]: unknown
}

/** What `schemaToFields` may return per field: a name, or an object with at least a `name`. */
export type FieldInput = string | (Partial<Field> & { name: string; attrs?: FieldInput[] })

/** Form values keyed by field name. Loose on purpose: the library does not read the values. */
export type Values = Record<string, unknown>
