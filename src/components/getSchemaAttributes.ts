import { getCredentialDefinitions } from '@/services/getCredentialDefinitions'
import { getSchemas } from '@/services/getSchemas'

export const getSchemaAttributes = async (
  basePath: string,
  schemaIdentifier: string
) => {
  let schemaId: string = schemaIdentifier
  let attributesNames: string[] = []

  /* eslint-disable */
  try {
    schemaId = (await getCredentialDefinitions(basePath, schemaId)).schemaId
  } catch (err) {
    console.warn('Unable to fetch the credential definition')
  }

  try {
    attributesNames = (await getSchemas(basePath, schemaId)).attrNames
  } catch (err) {
    throw new Error(
      '**Impossible to retrieve the attributes from the information provided. Make sure that the Credential Definition Id is correct and that you use the good Agent URL in the setting page.'
    )
  }
  return attributesNames
}
