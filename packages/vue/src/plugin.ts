import type { App } from 'vue'
import { OPTIONS_KEY } from '@shared/constants'
import type { PluginOptions } from './types'
import Form from './components/form.vue'
import FormFields from './components/fields.vue'
import FormField from './components/field.vue'
import FormFieldError from './components/field-error.vue'
import FormCreate from './components/create.vue'
import FormUpdate from './components/update.vue'
import FormDelete from './components/delete.vue'
import FormArchive from './components/archive.vue'
import FormUnarchive from './components/unarchive.vue'
import FormError from './components/error.vue'

const COMPONENTS = {
  Form,
  FormFields,
  FormField,
  FormFieldError,
  FormCreate,
  FormUpdate,
  FormDelete,
  FormArchive,
  FormUnarchive,
  FormError,
}

/**
 * Optional. Sets the options once for every `Form` in the app and registers the components globally.
 * Without it, import the components where you use them and pass the options as props.
 */
export const ShilpForm = {
  install(app: App, pluginOptions: PluginOptions = {}) {
    const { componentPrefix = '', ...options } = pluginOptions
    app.provide(OPTIONS_KEY, options)
    Object.entries(COMPONENTS).forEach(([name, component]) => {
      app.component(`${componentPrefix}${name}`, component)
    })
  },
}
