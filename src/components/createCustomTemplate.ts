import * as XLSX from 'xlsx'
import { Ref } from 'vue'

export const createCustomTemplate = (
  languages: Ref<Ref<string>[]>,
  attributesNames: string[]
) => {
  const aoaMain = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    [
      'CB: Classification',
      'CB: Attribute Name',
      'CB: Attribute Type',
      'CB: Flagged Attribute',
      'OL: Character Encoding',
      'OL: Format',
      'OL: Entry Codes'
    ]
  ]

  const aoaLang = [
    ['', '', '', '', 'Holder', 'Holder'],
    ['', '', '', '', 'Claim', 'Claim'],
    [
      'OL: Meta [Form Name]',
      'OL: Meta [Form Description]',
      'CB: Attribute Name',
      'OL: Label',
      'OL: Entry',
      'OL: Information'
    ]
  ]

  const sheetColsStyle = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ]

  const workbook = XLSX.utils.book_new()
  const readMeSheet = XLSX.utils.aoa_to_sheet([
    ['Click here for more informations']
  ])
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  readMeSheet['A1'].l = {
    Target:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3r5ywx1mDoXT6r2ENzFQZa_gFc0YZoH23Dt4W844gyItBSQYwZozzFD8vT-4dAxmhG5rG-KSLFS1z/pubhtml?gid=622055295&single=true'
  }

  readMeSheet['!cols'] = [{ wch: 40 }]

  XLSX.utils.book_append_sheet(workbook, readMeSheet, 'READ ME')

  attributesNames.forEach((attributeName: string) => {
    aoaMain.push(['', attributeName, '', '', '', '', ''])
    aoaLang.push(['', '', attributeName, '', '', ''])
  })

  const sheetMain = XLSX.utils.aoa_to_sheet(aoaMain)

  sheetMain['!cols'] = sheetColsStyle
  XLSX.utils.book_append_sheet(workbook, sheetMain, 'Main')

  const sheetLang = XLSX.utils.aoa_to_sheet(aoaLang)
  sheetLang['!cols'] = sheetColsStyle

  languages.value.forEach(language => {
    XLSX.utils.book_append_sheet(workbook, sheetLang, language.value)
  })

  XLSX.writeFileXLSX(workbook, 'custom_template.xlsx')
}
