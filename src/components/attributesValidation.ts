import * as XLSX from 'xlsx'

export const attributesValidation = (
  schemaAttributes: string[],
  templateSheetToValidate: XLSX.WorkSheet
) => {
  const errors: string[] = []
  const sheetJson = XLSX.utils.sheet_to_json(templateSheetToValidate, {
    header: 'A'
  })
  let attributesCol = ''

  sheetJson.forEach(row => {
    // eslint-disable-next-line
    // @ts-ignore
    Object.entries(row).forEach(([key, value]) => {
      if (value == 'CB: Attribute Name') {
        attributesCol = key
        return
      }
    })
  })

  if (attributesCol.length > 0) {
    schemaAttributes.forEach(attributeName => {
      let isAttributeNameDeclare = false
      /* eslint-disable */
      sheetJson.map(entry => {
        // @ts-ignore
        if (attributeName == entry[attributesCol]) {
          // @ts-ignore
          isAttributeNameDeclare = true
          return
        }
      })
      /* eslint-enable */
      if (!isAttributeNameDeclare) {
        errors.push(attributeName)
      }
    })
  } else {
    errors.push('Unable to locate the attribute Name column.')
  }
  return errors
}
