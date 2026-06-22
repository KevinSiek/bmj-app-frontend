import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { getBase64FromUrl } from '../pdf-util'

// Back Order print. Mirrors the delivery-note / purchase-order PDF pattern: logo header,
// a title box, BO + customer info side-by-side, then a line-item table showing the ordered
// quantity split into delivered vs back-ordered (the heart of a back order). `data` is the
// mapped backOrder object from stores/back-order.js.
const createPdf = async (data) => {
  const { customer, spareparts, purchaseOrder, notes } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  const title = {
    table: {
      widths: ['*'],
      body: [[{ text: 'BACK ORDER', alignment: 'center', margin: [0, 4, 0, 4], bold: true, fontSize: 16 }]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 5, 10, 5],
  }

  const boInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['NO:', data.backOrderNumber || ''],
        ['DATE:', data.date || ''],
        ['CUST. PO NO.:', purchaseOrder?.purchaseOrderNumber || ''],
      ],
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      paddingTop: () => 5,
      paddingBottom: () => 5,
      paddingLeft: () => 5,
      paddingRight: () => 5,
    },
    margin: [0, 5, 10, 5],
  }

  const topLeftSide = { stack: [title, boInfo], width: '50%' }

  const to = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['TO:', customer?.companyName || ''],
        ['ADDRESS:', customer?.address || ''],
        ['CITY:', `${customer?.city || ''}, ${customer?.province || ''}`],
        ['POSTAL:', `${customer?.postalCode || ''}`],
      ],
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      paddingTop: () => 3,
      paddingBottom: () => 3,
      paddingLeft: () => 3,
      paddingRight: () => 3,
    },
    margin: [10, 5, 0, 5],
    minHeight: 200,
  }

  const topRightSide = { stack: [to], width: '50%' }

  const docDefinition = {
    header: {
      image: logoBase64,
      width: 550,
      margin: [25, 30, 30, 0],
    },
    content: [
      { text: 'PT. BERKAT MEGAH JAYA', alignment: 'right', bold: true, fontSize: 14 },
      {
        table: { widths: ['50%', '50%'], body: [[topLeftSide, topRightSide]] },
        layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingTop: () => 0, paddingBottom: () => 0, paddingLeft: () => 0, paddingRight: () => 0 },
      },

      // Line items: ordered qty split into delivered now vs back-ordered (the indent).
      {
        table: {
          widths: [20, '*', 100, 40, 40, 40],
          body: [
            [
              { text: 'NO', style: 'tableHeader' },
              { text: 'PART NAME', style: 'tableHeader' },
              { text: 'PART NO.', style: 'tableHeader' },
              { text: 'ORDER', style: 'tableHeader' },
              { text: 'DELIVERED', style: 'tableHeader' },
              { text: 'BACK ORDER', style: 'tableHeader' },
            ],
            ...(spareparts || []).map((item, idx) => [
              idx + 1,
              item.sparepartName,
              item.sparepartNumber,
              item.order,
              item.deliveryOrder,
              item.backOrder,
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20],
      },

      { text: `Note: ${notes || ''}`, margin: [0, 40, 0, 0] },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      tableHeader: { bold: true, fontSize: 10, color: 'black' },
    },
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 100, 40, 60],
    pageSize: 'A4',
  }

  // pdfMake.createPdf(docDefinition).download(`${data.backOrderNumber}.pdf`)
  pdfMake.createPdf(docDefinition).print()
}

export { createPdf }
