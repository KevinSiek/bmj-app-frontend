import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'
import { ToWords } from 'to-words'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const toWords = new ToWords({
  localeCode: 'en-US',
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: 'IDR',
      plural: 'Rupiahs',
      symbol: 'Rp.'
    },
  }
})

const createPdf = (data) => {
  const { project, customer, price, spareparts, services, notes, downPayment } = data

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Top Left: Customer Information
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
        [`${String(customer.city || '')} - ${String(customer.province || '')}`, ''],
        [`${String(customer.subdistrict || '')} ${String(customer.urban || '')} (${String(customer.postalCode || '')})`, '']
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

  // Top Right: Proforma Invoice and Purchase Order Information
  const topRightInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['No', ':', project.proformaInvoiceNumber],
        ['Date', ':', project.date],
        ['Purchase Order', ':', project.purchaseOrderNumber],
        ['PO Date', ':', project.purchaseOrderDate],
        ['Project', ':', project.type]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 2,
      paddingBottom: () => 2,
      paddingLeft: () => 2,
      paddingRight: () => 2
    },
    margin: [10, 5, 5, 5],
  }
  const topRightSide = {
    stack: [topRightInfo],
    width: '40%',
    alignment: 'right'
  }

  // Spareparts Table
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
          { text: 'STOCK', style: 'tableHeader', alignment: 'center', fontSize: 8 }
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

  // Services Table
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

  // Summary Table
  const summaryTable = {
    table: {
      widths: project.type === 'Spareparts' ? [20, 100, 80, 20, 20, 80, 80, 40] : [20, 180, 60, 80, 80],
      body: [
        [
          '',
          { text: 'Balance Payment ' + downPayment + '%', bold: true, italics: true },
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          '',
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '1',
          'Amount',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.amount) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '2',
          'Less: Discount',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.discount) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '3',
          'Sub Total (1-2)',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.subtotal) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '4',
          'Less: Advance Payment',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.advancePayment) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '5',
          'Total (3-4)',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.total) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '6',
          'VAT',
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.vat) || 0), alignment: 'right', fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
        [
          '7',
          { text: 'TOTAL AMOUNT (5+6)', bold: true },
          '',
          ...(project.type === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.totalAmount) || 0), alignment: 'right', bold: true, fontSize: 8 },
          ...(project.type === 'Spareparts' ? [''] : [])
        ],
      ]
    },
    layout: {
      hLineWidth: (i) => (i === 0 || i === 1 ? 0 : 1),
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

  const totalAmountWord = toWords.convert(parseFloat(price.totalAmount) || 0)

  const docDefinition = {
    content: [
      // Header
      {
        text: 'PROFORMA INVOICE',
        margin: [0, 0, 0, 40],
        alignment: 'center',
        bold: true,
        fontSize: 18,
        decoration: 'underline'
      },
      {
        columns: [
          {
            width: '60%',
            stack: [customerInfo]
          },
          topRightSide
        ]
      },
      {
        text: `Dengan Hormat,`,
        margin: [0, 25, 0, 0]
      },
      {
        text: project.type === 'Spareparts'
          ? `Berikut kami sampaikan Proforma Invoice untuk sparepart dengan rincian sebagai berikut:`
          : `Berikut kami sampaikan Proforma Invoice untuk jasa dengan rincian sebagai berikut:`,
        margin: [0, 15, 0, 0]
      },
      // Conditionally include Spareparts or Services table
      project.type === 'Spareparts' ? sparepartsTable : servicesTable,
      summaryTable,
      {
        text: '# ' + totalAmountWord + ' #',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 0]
      },
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
        text: 'Demikian Proforma Invoice ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
        margin: [0, 20, 0, 0]
      },
      // Signature rows
      {
        columns: [
          {
            table: {
              widths: ['auto'],
              body: [
                [{ text: 'Payment by TT to Our Account:', bold: true, margin: [0, 0, 0, 0] }],
                ['PT. Berkat Megah Jaya'],
                ['A/C 009 - 8928009 (IDR)'],
                ['BCA KCU Pemuda - Semarang (Jateng)']
              ]
            },
            layout: {
              hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
              vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
              paddingTop: () => 3,
              paddingBottom: () => 3,
              paddingLeft: () => 3,
              paddingRight: () => 3
            },
            margin: [10, 50, 10, 5],
            width: '60%',
          },
          {
            width: '40%',
            stack: [
              { text: 'SR. PRAWESTI', bold: true, alignment: 'center', decoration: 'underline' },
              { text: 'FINANCE', alignment: 'center' }
            ],
            margin: [0, 90, 0, 0]
          }
        ]
      }
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

  pdfMake.createPdf(docDefinition).download(`Proforma_Invoice_${String(data.id || 'unknown')}.pdf`)
}

export { createPdf }
