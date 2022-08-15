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
              You can specify your AnonCred Schema to get a template with the
              attributes of your schema.
            </q-card-section>
            <q-separator />
            <div
              v-for="(_, i) in schemaIdentifier"
              :key="i"
              class="row items-center">
              <q-icon
                name="remove_circle_outline"
                class="col-1 cursor-pointer"
                size="sm"
                left
                @click="removeSchemaIdentifier(i)" />
              <q-input
                v-model="schemaIdentifier[i].value"
                class="col"
                label="AnonCred/CredDef"
                dense />
            </div>
            <div
              v-if="schemaIdentifier.length < 1"
              class="row items-center"
              style="height: 40px">
              <q-icon
                name="add_circle_outline"
                class="col-1 cursor-pointer"
                size="sm"
                left
                @click="addSchemaIdentifier" />
            </div>
          </li>
        </ul>
      </q-card-section>
      <q-card-section>
        <q-btn
          color="primary"
          :disable="
            languages.length < 1 || schemaIdentifier[0].value.length < 1
          "
          @click="Generate">
          Generate
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from 'vue'

export default defineComponent({
  name: 'Template',
  setup() {
    const templateHelpExpanded = ref(true)
    const languages = ref([ref('en')])
    const schemaIdentifier: Ref<Ref<string>[]> = ref([ref('')])

    const addLanguage = () => {
      languages.value.push(ref(''))
    }

    const removeLanguage = (i: number) => {
      languages.value.splice(i, 1)
    }

    function addSchemaIdentifier() {
      if (schemaIdentifier.value.length < 1) {
        schemaIdentifier.value.push(ref(''))
      }
    }

    function removeSchemaIdentifier() {
      schemaIdentifier.value.splice(0, 1)
    }

    return {
      removeLanguage,
      addLanguage,
      templateHelpExpanded,
      languages,
      schemaIdentifier,
      addSchemaIdentifier,
      removeSchemaIdentifier
    }
  }
})
</script>
