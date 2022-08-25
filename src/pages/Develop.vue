<template>
  <q-page class="q-pa-md">
    <q-card class="converter-card">
      <q-card-section>
        <div class="row">
          <div class="text-h5">XLS to OCA Converter</div>
          <q-btn
            color="grey"
            round
            flat
            dense
            :icon="converterHelpExpanded ? 'help_outline' : 'help'"
            @click="converterHelpExpanded = !converterHelpExpanded" />
        </div>
      </q-card-section>

      <q-slide-transition>
        <div v-show="converterHelpExpanded">
          <q-separator />
          <q-card-section class="text-subitle2">
            It converts properly prepared xls(x) file to OCA Bundle.<br />
            As an outcome you would receive a zip file which would include
            capture base object and all overlays within JSON format.
            <ul>
              <li>
                <b>OCA file [required] (XLS/XLSX)</b><br />
                <a href="/#/template"> Download template</a>.
              </li>
              <li>
                <b>OCA references files (XLS/XLSX)</b><br />
                When any of attributes in OCA file is a
                <a
                  target="_blank"
                  href="https://oca.colossi.network/v1.0.0.html#attribute-type">
                  Reference or Array[Reference] type</a
                >, you can compose it's OCA files into OCA Bundle.
              </li>
              <li>
                <b>OCA credential layout file (YML/YAML)</b><br />
                <a
                  target="_blank"
                  href="https://github.com/THCLab/oca-html-preview-demo/tree/main/examples/layout/credential.yaml">
                  See example</a
                >. If not provided, Credential Layout Overlay will be generated
                with default layout.
              </li>
              <li>
                <b>OCA form layout file (YML/YAML)</b><br />
                <a
                  target="_blank"
                  href="https://github.com/THCLab/oca-html-preview-demo/tree/main/examples/layout/form.yaml">
                  See example</a
                >. If not provided, Form Layout Overlay will be generated with
                default layout.
              </li>
            </ul>
          </q-card-section>
        </div>
      </q-slide-transition>

      <q-separator />
      <q-card-section>
        You can specify your credential definition id to validate the attributes
        of your template.
      </q-card-section>
      <q-card-section>
        <q-separator />
        <div class="row items-center q-ma-sm">
          <q-icon
            name="remove_circle_outline"
            class="col-1 cursor-pointer"
            size="sm"
            left
            :disabled="true"
            @click="removeSchemaIdentifier()" />
          <q-input
            v-model="schemaIdentifier"
            class="col"
            label="CredDef"
            dense />
        </div>
      </q-card-section>
      <q-card-section>
        <q-file
          v-model="rootFile"
          label="Select OCA file"
          accept=".xls,.xlsx"
          filled />
        <q-file
          v-model="referenceFiles"
          label="Select OCA references files"
          accept=".xls,.xlsx"
          multiple />

        <q-file
          v-model="credentialLayoutFile"
          label="Select Credential Layout file"
          accept=".yml,.yaml" />
        <q-file
          v-model="formLayoutFile"
          label="Select Form Layout file"
          accept=".yml,.yaml" />

        <br />

        <q-btn color="primary" :disable="!rootFile" @click="convert">
          Convert
        </q-btn>
        <br />
        <br />
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="convertionSchemaAttributesResult" />
        <br />
        <span v-html="convertionResult" />
        <!-- eslint-enable vue/no-v-html -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from 'vue'
import { AxiosInstance } from 'axios'
import * as XLSX from 'xlsx'
import { useStore } from '@/store'
import { attributesValidation } from '@/components/attributesValidation'
import { getSchemaAttributes } from '@/components/getSchemaAttributes'

export default defineComponent({
  name: 'Develop',
  setup() {
    const currentInstance = getCurrentInstance()
    if (!currentInstance) {
      return
    }
    const $axios = currentInstance.appContext.config.globalProperties
      .$axios as AxiosInstance
    const $store = useStore()
    const converterHelpExpanded = ref(true)
    const rootFile = ref()
    const referenceFiles = ref([])
    const credentialLayoutFile = ref()
    const formLayoutFile = ref()
    const convertionResult = ref('')
    const convertionSchemaAttributesResult = ref('')
    const schemaIdentifier = ref('')

    const ocaConverterUrl = 'https://tool.oca.argo.colossi.network'

    /* eslint-disable */
    const convert = async () => {

      if(schemaIdentifier.value.length > 0){
        const basePath = $store.state.settings.agentUrl
        let attributesNames: string[] = []
        const fileReader = await new FileReader()
        let wb: XLSX.WorkBook | undefined = undefined;

        fileReader.readAsArrayBuffer(rootFile.value)

        fileReader.onload = (e: any) => {
          const bufferArray= e?.target.result
          wb = XLSX.read(bufferArray, {type: 'buffer'})
        }
        try{
          attributesNames = await getSchemaAttributes(basePath, schemaIdentifier.value)
          convertionSchemaAttributesResult.value = "Successfully fetch the schema."
        } catch (err) {
          convertionSchemaAttributesResult.value = err.message
        }

         if (wb != undefined){
           const sheets = (wb as XLSX.WorkBook).Sheets
           Object.entries(sheets).map(([key, _]) => {
             if(key != 'READ ME'){
               const schemaErrors = attributesValidation(attributesNames, wb.Sheets[key])
               if(schemaErrors.length > 0){
                 convertionSchemaAttributesResult.value += `<br /> Missing attribute(s) in sheet "${key}":`
                 schemaErrors.forEach((error) => {
                   convertionSchemaAttributesResult.value += `<li>${error}</li>`
                 })
               }
             }
           })
         }
      } else {
        convertionSchemaAttributesResult.value =
          'Schema attributes validation skipped.'
      }

      const formData = new FormData()
      formData.append('file', rootFile.value)
      referenceFiles.value.forEach((file: File) =>
        formData.append('referencesFiles[]', file)
      )

      if (credentialLayoutFile.value) {
        formData.append('credentialLayoutFile', credentialLayoutFile.value)
      }
      if (formLayoutFile.value) {
        formData.append('formLayoutFile', formLayoutFile.value)
      }

      const response = await $axios.post(ocaConverterUrl, formData)
      resetForm()
      const responseResult = response.data
      if (responseResult.success) {
        convertionResult.value = `Success! <a href="${ocaConverterUrl}/${responseResult.filename}">Click here to download OCA Bundle</a>`
      } else {
        const errors: string[] = responseResult.errors
        console.error(errors)
        convertionResult.value = 'Failure! Fix those errors and try again: <ul>'
        errors.forEach(e => (convertionResult.value += `<li>${e}</li>`))
        convertionResult.value += '</ul>'
      }
    }
    /* eslint-enable */

    const resetForm = () => {
      rootFile.value = null
      referenceFiles.value = []
      credentialLayoutFile.value = null
      formLayoutFile.value = null
    }

    const removeSchemaIdentifier = () => {
      schemaIdentifier.value = ''
    }

    return {
      convert,
      converterHelpExpanded,
      convertionResult,
      convertionSchemaAttributesResult,
      rootFile,
      referenceFiles,
      credentialLayoutFile,
      formLayoutFile,
      schemaIdentifier,
      removeSchemaIdentifier
    }
  }
})
</script>

<style>
.converter-card {
  min-width: 300px;
  width: min(500px, 100%);
}
</style>
