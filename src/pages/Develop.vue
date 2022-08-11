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
                <a
                  href="https://github.com/THCLab/oca-ecosystem/raw/main/examples/template.xlsx">
                  Download template</a
                >.
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
      <div class="q-pa-md">
        <q-btn-toggle
          v-model="toggleButton"
          toggle-color="primary"
          :options="[
            { label: 'Local File', value: 'Local' },
            { label: 'Path To File', value: 'Path' }
          ]"></q-btn-toggle>
      </div>

      <q-card-section>
        <div v-if="!enableFileFromPath">
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
        </div>
        <div v-else>
          <q-input v-model="rootPath" label="Path to OCA file" filled />
          <q-input
            v-model="referencePath"
            label="Path to OCA references files" />

          <q-input
            v-model="credentialLayoutPath"
            label="Path to Credential Layout file" />
          <q-input v-model="formLayoutPath" label="Path to Form Layout file" />
        </div>
        <br />

        <q-btn
          color="primary"
          :disable="!(rootFile || rootPath)"
          @click="convert">
          Convert
        </q-btn>
        <br />
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="convertionResult" />
        <!-- eslint-enable vue/no-v-html -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance, watch } from 'vue'
import { AxiosInstance } from 'axios'
import { makeCAZipBundle } from '@/components/makeCAZipBundle'

export default defineComponent({
  name: 'Develop',
  setup() {
    const currentInstance = getCurrentInstance()
    if (!currentInstance) {
      return
    }
    const $axios = currentInstance.appContext.config.globalProperties
      .$axios as AxiosInstance
    const converterHelpExpanded = ref(true)
    const rootFile = ref()
    const referenceFiles = ref([])
    const credentialLayoutFile = ref()
    const formLayoutFile = ref()
    const convertionResult = ref('')
    const toggleButton = ref('Local')
    const enableFileFromPath = ref(false)
    const rootPath = ref()
    const referencePath = ref()
    const credentialLayoutPath = ref()
    const formLayoutPath = ref()
    const ocaConverterUrl = 'https://tool.oca.argo.colossi.network'

    /* eslint-disable */
    const convert = async () => {
      if(toggleButton.value == 'Local') {
        console.log(rootFile.value)
        const response = await makeCAZipBundle(rootFile.value, referenceFiles.value, credentialLayoutFile.value, formLayoutFile.value)
      } else {
        const SPREADSHEET_ID = "1CF1AJqpN93SA3Uu9qSKTlyTNlIZG8dOQcsvIP2V1cOQ";
        const url = `https://spreadsheets.google.com/feeds/list/d/1igqjNFfCI7t7y5sNzU6z8g-IaA83r0-5qgzC0tNKPSE/od6/public/values?alt=json`;

        const externRootFile = await $axios
          .get(
            `https://spreadsheets.google.com/feeds/worksheets/${SPREADSHEET_ID}/public/full?alt=json`)
        console.log(externRootFile)
      }

      resetForm()
      resetPathForm()
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

    watch(toggleButton, () => {
      enableFileFromPath.value = toggleButton.value == 'Path'
      resetForm()
      resetPathForm()
    })

    const resetForm = () => {
      rootFile.value = null
      referenceFiles.value = []
      credentialLayoutFile.value = null
      formLayoutFile.value = null
    }

    const resetPathForm = () => {
      rootPath.value = null
      referencePath.value = null
      credentialLayoutPath.value = null
      formLayoutPath.value = null
    }

    return {
      enableFileFromPath,
      toggleButton,
      convert,
      converterHelpExpanded,
      convertionResult,
      rootFile,
      referenceFiles,
      credentialLayoutFile,
      formLayoutFile,
      rootPath,
      referencePath,
      credentialLayoutPath,
      formLayoutPath
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
