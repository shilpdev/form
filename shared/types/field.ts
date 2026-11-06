/** What `schemaToFields` returns per field: always has a `name` and a `label`. Extra keys are kept. */
export interface Field {
  name: string
  label: string
  /** Default value used in create mode and by `resetForm`. */
  value?: unknown
  /** Nested fields, for example the columns of a repeater. */
  attrs?: Field[]
  [key: string]: unknown
}

/** Form values keyed by field name. Loose on purpose: the library does not read the values. */
export type Values = Record<string, unknown>
