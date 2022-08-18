export const getSchemas = (basePath: string, schemaId: string) => {
  /* eslint-disable */
  return fetch(`${basePath}schemas/${schemaId}`)
    .then(response => {
      if (response.status == 200) {
        return response.json()
      } else {
        throw new Error('Unable to fetch the schema')
      }
    })
    .then(json => {
      if (json.schema != null) {
        return json.schema
      } else {
        throw new Error('Invalid schema id')
      }
    })
    .catch((err) => {
      throw new Error(err)
    })
}
