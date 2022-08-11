import { AxiosInstance } from 'axios'
import { getCurrentInstance } from 'vue'

export const makeCAZipBundle = async (
  root: File,
  references: never[],
  credentialLayout: File,
  formLayout: File
) => {
  const currentInstance = getCurrentInstance()
  if (!currentInstance) {
    return
  }
  const $axios = currentInstance.appContext.config.globalProperties
    .$axios as AxiosInstance
  const ocaConverterUrl = 'https://tool.oca.argo.colossi.network'

  const formData = new FormData()
  formData.append('file', root)
  references.forEach((file: File) => formData.append('referencesFiles[]', file))

  if (credentialLayout) {
    formData.append('credentialLayoutFile', credentialLayout)
  }
  if (formLayout) {
    formData.append('formLayoutFile', formLayout)
  }

  return await $axios.post(ocaConverterUrl, formData)
}
