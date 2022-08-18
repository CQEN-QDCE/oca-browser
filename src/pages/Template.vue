<template>
  <q-page class="q-pa-md">
    <q-card class="converter-card">
      <q-card-section>
        <div class="row">
          <div class="text-h5">XLSX template for OCA</div>
          <q-btn
            color="grey"
            round
            flat
            dense
            :icon="templateHelpExpanded ? 'help_outline' : 'help'"
            @click="templateHelpExpanded = !templateHelpExpanded" />
        </div>
      </q-card-section>

      <q-slide-transition>
        <div v-show="templateHelpExpanded">
          <q-separator />
          <q-card-section class="text-subitle2">
            The templates allow you to create a starting point to facilitate the
            development of your OCA bundle.
          </q-card-section>
        </div>
      </q-slide-transition>
      <q-separator />

      <q-card-section>
        <ul>
          <li>
            Click
            <a
              href="https://github.com/THCLab/oca-ecosystem/raw/main/examples/template.xlsx">
              here</a
            >
            to get an empty template.
          </li>
          <li>
            Custom template
            <br />
            <q-card-section>
              Choose the languages for your OCA bundle. (ex: en)
            </q-card-section>

            <q-separator />

            <div v-for="(_, i) in languages" :key="i" class="row items-center">
              <q-icon
                name="remove_circle_outline"
                class="col-1 cursor-pointer"
                size="sm"
                left
                @click="removeLanguage(i)" />
              <q-input
                v-model="languages[i].value"
                class="col"
                label="Language"
                dense />
            </div>
            <div class="row items-center" style="height: 40px">
              <q-icon
                name="add_circle_outline"
                class="col-1 cursor-pointer"
                size="sm"
                left
                @click="addLanguage" />
            </div>

            <q-card-section>
              You can specify your credential definition id to get a template
              with the attributes of your schema.
            </q-card-section>
            <q-separator />
            <div class="row items-center">
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
          </li>
        </ul>
      </q-card-section>
      <q-card-section>
        <q-btn
          color="primary"
          :disable="languages.length < 1 || schemaIdentifier.length < 1"
          @click="generateTemplate()">
          Generate
        </q-btn>
      </q-card-section>
      <q-card-section> {{ errorMessage }} </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from 'vue'
import { useStore } from '@/store'
import { getCredentialDefinitions } from '@/services/getCredentialDefinitions'
import { getSchemas } from '@/services/getSchemas'
import { createCustomTemplate } from '@/components/createCustomTemplate'

export default defineComponent({
  name: 'Template',
  setup() {
    const currentInstance = getCurrentInstance()
    if (!currentInstance) {
      return
    }
    const $store = useStore()
    const errorMessage = ref('')
    const templateHelpExpanded = ref(true)
    const languages = ref([ref('en')])
    const schemaIdentifier = ref('')

    const addLanguage = () => {
      languages.value.push(ref(''))
    }

    const removeLanguage = (i: number) => {
      languages.value.splice(i, 1)
    }

    const removeSchemaIdentifier = () => {
      schemaIdentifier.value = ''
    }
    /* eslint-disable */
    const generateTemplate = async () => {
      let schemaId = schemaIdentifier.value
      let attributesNames: string[] = []
      const basePath = $store.state.settings.agentUrl

      try{
        schemaId = (await getCredentialDefinitions(basePath, schemaIdentifier.value)).schemaId
      } catch (err) {
        console.warn('Unable to fetch the credential definition')
      }

      try{
        attributesNames = (await getSchemas(basePath, schemaId)).attrNames
        createCustomTemplate(languages, attributesNames)
        errorMessage.value = ""
      } catch(err) {
        errorMessage.value = "**Impossible to retrieve the attributes from the information provided. Make sure that the Credential Definition Id is correct and that you use the good Agent URL in the setting page."
      }
    }

    return {

      errorMessage,
      removeLanguage,
      addLanguage,
      templateHelpExpanded,
      languages,
      schemaIdentifier,
      removeSchemaIdentifier,
      generateTemplate
    }
  }
})
</script>
