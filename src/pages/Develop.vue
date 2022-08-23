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
import { getCredentialDefinitions } from '@/services/getCredentialDefinitions'
import { getSchemas } from '@/services/getSchemas'
import { useStore } from '@/store'

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
        let mainSheetJson: any[] = [];
        const fileReader = await new FileReader()
        fileReader.readAsArrayBuffer(rootFile.value)

        fileReader.onload = (e: any) => {
          const bufferArray= e?.target.result
          const wb = XLSX.read(bufferArray, {type: 'buffer'})
          const mainSheet = wb.Sheets['Main']
          mainSheetJson = XLSX.utils.sheet_to_json(mainSheet)
        }


        let schemaId = schemaIdentifier.value
        const basePath = $store.state.settings.agentUrl
        let attributesNames: string[] = []
        try{
          schemaId = (await getCredentialDefinitions(basePath, schemaIdentifier.value)).schemaId
        } catch (err) {
          console.warn('Unable to fetch the credential definition')
        }
        const undeclaredAttributes: string[] = []
        try{
          attributesNames = (await getSchemas(basePath, schemaId)).attrNames
          convertionSchemaAttributesResult.value = "Successfully fetch the schema."

          attributesNames.forEach((attributeName) => {
            let isAttributeNameDeclare = false
            mainSheetJson.forEach((row) => {
              if(attributeName == row['CB: Attribute Name']){
                isAttributeNameDeclare = true
              }
            })
            if(!isAttributeNameDeclare){
              undeclaredAttributes.push(attributeName)
            }
          })
          if(undeclaredAttributes.length > 0){
            convertionSchemaAttributesResult.value += `<br /> Missing attribute(s):`
            undeclaredAttributes.forEach((undeclaredAttribute) => {
              convertionSchemaAttributesResult.value += `<li>${undeclaredAttribute}</li>`
            })
          }
        } catch(err) {
          convertionSchemaAttributesResult.value = "**Impossible to retrieve the attributes with the information provided. Make sure that the Credential Definition Id is correct and that you use the good Agent URL in the setting page."
        }
      } else {
        convertionSchemaAttributesResult.value = "Schema attribute validation skipped."
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
        errors.forEach(e => convertionResult.value += `<li>${e}</li>`)
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
