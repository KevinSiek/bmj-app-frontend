import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { getBase64FromUrl } from '@/utils/pdf-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

export const generateSparepartMovementPdf = async (data) => {
  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  const itemsBody = data.details.map((item, index) => [
    index + 1,
    item.sparepart.sparepart_number,
    item.sparepart.sparepart_name,
    item.quantity
  ])

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    header: {
      image: logoBase64, // your base64 logo string
      width: 550,
      margin: [25, 30, 30, 0]
    },
    content: [
      {
        text: 'STOCK MOVEMENT / TRANSFER',
        alignment: 'center',
        bold: true,
        fontSize: 18,
        margin: [0, 70, 0, 30],
      },
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: 'Movement No: ', bold: true }, data.movementNumber, '\n',
              { text: 'Date: ', bold: true }, new Date(data.createdAt).toLocaleDateString('id-ID'), '\n',
              { text: 'Status: ', bold: true }, data.currentStatus, '\n'
            ]
          },
          {
            width: '50%',
            text: [
              { text: 'From Branch: ', bold: true }, data.sourceBranch, '\n',
              { text: 'To Branch: ', bold: true }, data.targetBranch, '\n',
              { text: 'Created By: ', bold: true }, data.employee.name, '\n'
            ],
            alignment: 'right'
          }
        ]
      },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto'],
          body: [
            [
              { text: 'No', style: 'tableHeader' },
              { text: 'Part Number', style: 'tableHeader' },
              { text: 'Part Name', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' }
            ],
            ...itemsBody
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n\n' },
      {
        columns: [
          {
            width: '50%',
            text: 'Yang Menerima,\n\n\n\n\n_______________________',
            alignment: 'center'
          },
          {
            width: '50%',
            text: `Yang Mengirim,\n\n\n\n\n${data.employee.name}`,
            alignment: 'center'
          }
        ]
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      tableHeader: {
        bold: true,
        fillColor: '#eeeeee'
      }
    }
  }

  // pdfMake.createPdf(docDefinition).download(`Sparepart_Movement_${data.movementNumber}.pdf`).open()
  pdfMake.createPdf(docDefinition).print()
}
