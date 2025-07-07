import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const createPdf = (data) => {
  const { project, customer, price, spareparts, services, notes } = data

  // Top Left
  const customerInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        [
          {
            text: [`Kepada Yth `, { text: `${String(customer.companyName || '')}`, bold: true }],
          },
          ''
        ],
        [String(customer.office || ''), ''],
        [String(customer.address || ''), ''],
        [`${String(customer.city || '')} - ${String(customer.province || '')}`, '']
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 1,
      paddingBottom: () => 1,
      paddingLeft: () => 0,
      paddingRight: () => 1
    },
    margin: [0, 10, 5, 5],
    minHeight: 460
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Define spareparts table with strict validation
  const sparepartsTable = {
    table: {
      widths: [20, 100, 80, 20, 20, 80, 80, 40],
      body: [
        [
          { text: 'No', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'PART NAME', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'PART NO.', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'QTY', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'UNIT', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'TOTAL PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'STOK', style: 'tableHeader', alignment: 'center', fontSize: 8 }
        ],
        ...spareparts.filter(item =>
          typeof item.sparepartName === 'string' &&
          typeof item.sparepartNumber === 'string' &&
          !isNaN(parseFloat(item.quantity)) &&
          !isNaN(parseFloat(item.unitPriceSell)) &&
          !isNaN(parseFloat(item.totalPrice))
        ).map((item, idx) => [
          { text: String(idx + 1), alignment: 'center', fontSize: 8 },
          { text: String(item.sparepartName || ''), fontSize: 8 },
          { text: String(item.sparepartNumber || ''), alignment: 'center', fontSize: 8 },
          { text: String(parseFloat(item.quantity) || 0), alignment: 'center', fontSize: 8 },
          { text: String(item.unit || 'pcs'), alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(item.unitPriceSell) || 0), alignment: 'right', fontSize: 8 },
          { text: formatCurrency(parseFloat(item.totalPrice) || 0), alignment: 'right', fontSize: 8 },
          { text: String(item.stock || ''), alignment: 'left', fontSize: 8 }
        ]),
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
      vLineWidth: () => 1,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 15, 0, 0]
  }

  // Define services table with similar validation
  const servicesTable = {
    table: {
      widths: [20, 180, 60, 80, 80],
      body: [
        [
          { text: 'No', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'SERVICE NAME', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'QUANTITY', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'TOTAL PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 }
        ],
        ...services.filter(item =>
          typeof item.service === 'string' &&
          !isNaN(parseFloat(item.quantity)) &&
          !isNaN(parseFloat(item.unitPriceSell)) &&
          !isNaN(parseFloat(item.totalPrice))
        ).map((item, idx) => [
          { text: String(idx + 1), alignment: 'center', fontSize: 8 },
          { text: String(item.service || ''), fontSize: 8 },
          { text: String(parseFloat(item.quantity) || 0), alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(item.unitPriceSell) || 0), alignment: 'right', fontSize: 8 },
          { text: formatCurrency(parseFloat(item.totalPrice) || 0), alignment: 'right', fontSize: 8 }
        ]),
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
      vLineWidth: () => 1,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 15, 0, 0]
  }

  // Summary table for subtotal, PPN, and grand total
  const summaryTable = {
    table: {
      widths: project.type === 'Spareparts' ? [20, 100, 80, 20, 20, 80, 80, 40] : [20, 180, 60, 80, 80],
      body: [
        [
          '',
          '',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Discount', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.discount) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          { text: 'SubTotal', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.subtotal) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Ppn 11%', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.ppn) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Grand Total', alignment: 'center', bold: true, fontSize: 8 },
          { text: formatCurrency(parseFloat(price.grandTotal) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
      ]
    },
    layout: {
      hLineWidth: (i) => (i === 0) ? 0 : 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 0, 0, 0]
  }

  const docDefinition = {
    content: [
      // Header details
      // {
      //   image: 'data:image/png;base64,...', // your image in base64
      //   width: 100, // or height: 50
      //   margin: [0, 10, 0, 0]
      // },
      {
        text: `Quotation No : ${String(project.quotationNumber || '')}`,
        margin: [0, 0, 0, 0],
      },

      customerInfo,

      {
        text: `Dengan Hormat,`,
        margin: [0, 25, 0, 0]
      },
      {
        text: project.type === 'Spareparts'
          ? `Berikut kami sampaikan Penawaran harga sparepart Mesin Mitsubishi dengan rincian sebagai berikut:`
          : `Berikut kami sampaikan Penawaran harga jasa dengan rincian sebagai berikut:`,
        margin: [0, 15, 0, 0]
      },

      // Conditionally include spareparts or services table
      project.type === 'Spareparts' ? sparepartsTable : servicesTable,

      summaryTable,

      {
        table: {
          widths: ['auto', '*'],
          body: [
            ['Note:', ''],
            [String(notes || ''), '']
          ]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [0, 30, 10, 5],
        minHeight: 460,
        width: '50%',
      },
      {
        text: 'Demikian Penawaran ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
        margin: [0, 20, 0, 0]
      },

      // Signature rows
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Semarang, ${currentDate}` },
              { text: 'Hormat kami,' },
              { text: `Yulia`, margin: [0, 50, 0, 0] },
              { text: `Admin Part PT. Berkat Megah Jaya` },
            ],
            margin: [0, 30, 0, 0]
          },
          {
            width: '50%',
            stack: [
              { text: `Disetujui,` },
              { text: '(                                               )', margin: [0, 55, 0, 0] },
              { text: `${String(customer.companyName || '')}` }
            ],
            margin: [0, 40, 0, 0]
          },
        ]
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'black'
      }
    },
    defaultStyle: {
      fontSize: 10
    },
    pageMargins: [40, 60, 40, 60]
  }

  // Log table body for debugging
  if (project.type === 'Spareparts') {
    console.log("Spareparts Table Body:", sparepartsTable.table.body)
  } else {
    console.log("Services Table Body:", servicesTable.table.body)
  }

  pdfMake.createPdf(docDefinition).download(`Quotation_${String(data.id || 'unknown')}.pdf`)
}

export { createPdf }
