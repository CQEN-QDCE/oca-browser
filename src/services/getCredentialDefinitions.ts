export const getCredentialDefinitions = (
  basePath: string,
  credentialDefinitionId: string
) => {
  /* eslint-disable */
  return fetch(`${basePath}credential-definitions/${credentialDefinitionId}`)
    .then(response => {
      if (response.status == 200) {
        return response.json()
      }
    })
    .then(json => {
      if (json.credential_definition != null) {
        return json.credential_definition
      } else {
        throw new Error('Invalid credential definition id')
      }
    })
    .catch((err) => {
      throw new Error(err)
    })
}
