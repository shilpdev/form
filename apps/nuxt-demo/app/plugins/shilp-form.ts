import { ShilpForm } from '@shilp.dev/vue-form'
import { formOptions } from '~/utils/form-options'

// App-wide form options (Zod adapters), set once for every `Form`.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ShilpForm, formOptions)
})
