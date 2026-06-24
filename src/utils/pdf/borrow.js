import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { getBase64FromUrl } from '../pdf-util'

// Pinjaman (Borrow) handover print. Mirrors the back-order / delivery-note PDF pattern:
// logo header, a title box, borrow + PO info, a line-item table, and a two-party signature
// block. `data` is the mapped borrow object from stores/borrow.js. `handOverName` is the
// logged-in user (Yang Menyerahkan); `receiverName` is entered at print time (Yang Menerima).
const createPdf = async (data, handOverName = '', receiverName = '') => {
  const { spareparts, purchaseOrder, workOrder, notes } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  const title = {
    table: {
      widths: ['*'],
      body: [[{ text: 'BUKTI PINJAMAN', alignment: 'center', margin: [0, 4, 0, 4], bold: true, fontSize: 16 }]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 5, 10, 5],
  }

  const borrowInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['NO:', data.borrowNumber || ''],
        ['PO SERVICE:', purchaseOrder?.poNumber || purchaseOrder?.purchaseOrderNumber || ''],
        ['WORK ORDER:', workOrder?.workOrderNumber || ''],
        ['BRANCH:', data.branch?.name || ''],
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

  const signature = {
    columns: [
      {
        width: '50%',
        stack: [
          { text: 'Yang Menyerahkan,', margin: [0, 0, 0, 50] },
          { text: handOverName || '(................................)', alignment: 'left' },
        ],
        alignment: 'left',
      },
      {
        width: '50%',
        stack: [
          { text: 'Yang Menerima,', margin: [0, 0, 0, 50] },
          { text: receiverName || '(................................)', alignment: 'left' },
        ],
        alignment: 'left',
      },
    ],
    margin: [0, 50, 0, 0],
  }

  const docDefinition = {
    header: {
      image: logoBase64,
      width: 550,
      margin: [25, 30, 30, 0],
    },
    content: [
      { text: 'PT. BERKAT MEGAH JAYA', alignment: 'right', bold: true, fontSize: 14 },
      { stack: [title, borrowInfo], width: '60%' },

      {
        table: {
          widths: [20, '*', 100, 60],
          body: [
            [
              { text: 'NO', style: 'tableHeader' },
              { text: 'PART NAME', style: 'tableHeader' },
              { text: 'PART NO.', style: 'tableHeader' },
              { text: 'QUANTITY', style: 'tableHeader' },
            ],
            ...(spareparts || []).map((item, idx) => [
              idx + 1,
              item.sparepartName,
              item.sparepartNumber,
              item.quantity,
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20],
      },

      { text: `Note: ${notes || ''}`, margin: [0, 10, 0, 0] },
      signature,
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      tableHeader: { bold: true, fontSize: 10, color: 'black' },
    },
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 100, 40, 60],
    pageSize: 'A4',
  }

  // pdfMake.createPdf(docDefinition).download(`Pinjaman_${data.borrowNumber || data.id}.pdf`)
  pdfMake.createPdf(docDefinition).print()
}

const createReturnPdf = async (data, returnedByName = '', receiverName = '') => {
  const { spareparts, purchaseOrder, workOrder, returnNotes } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  const title = {
    table: {
      widths: ['*'],
      body: [[{ text: 'BUKTI PENGEMBALIAN PINJAMAN', alignment: 'center', margin: [0, 4, 0, 4], bold: true, fontSize: 16 }]],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 5, 10, 5],
  }

  const borrowInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['NO PINJAMAN:', data.borrowNumber || ''],
        ['PO SERVICE:', purchaseOrder?.poNumber || purchaseOrder?.purchaseOrderNumber || ''],
        ['WORK ORDER:', workOrder?.workOrderNumber || ''],
        ['BRANCH:', data.branch?.name || ''],
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

  const signature = {
    columns: [
      {
        width: '50%',
        stack: [
          { text: 'Yang Mengembalikan,', margin: [0, 0, 0, 50] },
          { text: returnedByName || '(................................)', alignment: 'left' },
        ],
        alignment: 'left',
      },
      {
        width: '50%',
        stack: [
          { text: 'Yang Menerima,', margin: [0, 0, 0, 50] },
          { text: receiverName || '(................................)', alignment: 'left' },
        ],
        alignment: 'left',
      },
    ],
    margin: [0, 50, 0, 0],
  }

  const docDefinition = {
    header: {
      image: logoBase64,
      width: 550,
      margin: [25, 30, 30, 0],
    },
    content: [
      { text: 'PT. BERKAT MEGAH JAYA', alignment: 'right', bold: true, fontSize: 14 },
      { stack: [title, borrowInfo], width: '60%' },

      {
        table: {
          widths: [20, '*', 100, 60, 60, 60],
          body: [
            [
              { text: 'NO', style: 'tableHeader' },
              { text: 'PART NAME', style: 'tableHeader' },
              { text: 'PART NO.', style: 'tableHeader' },
              { text: 'QTY BORROWED', style: 'tableHeader' },
              { text: 'QTY RETURNED', style: 'tableHeader' },
              { text: 'SHORTFALL', style: 'tableHeader' },
            ],
            ...(spareparts || []).map((item, idx) => {
              const borrowed = item.quantity || 0
              const returned = item.quantityReturn !== null && item.quantityReturn !== undefined ? item.quantityReturn : 0
              const shortfall = Math.max(0, borrowed - returned)
              return [
                idx + 1,
                item.sparepartName,
                item.sparepartNumber,
                borrowed,
                returned,
                shortfall,
              ]
            }),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20],
      },

      { text: `Return Note: ${returnNotes || ''}`, margin: [0, 10, 0, 0] },
      signature,
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      tableHeader: { bold: true, fontSize: 10, color: 'black' },
    },
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 100, 40, 60],
    pageSize: 'A4',
  }

  pdfMake.createPdf(docDefinition).download(`Pengembalian_Pinjaman_${data.borrowNumber || data.id}.pdf`)
}

export { createPdf, createReturnPdf }
