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
  const { purchaseOrder, invoice, customer, price, spareparts, services, notes } = data

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Top Left: Customer and Payment Information
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
    margin: [0, 10, 5, 5]
  }

  const paymentInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['Term of Payment', ':', String(invoice.termOfPayment || '')],
        ['Payment Due', ':', String(purchaseOrder.paymentDue || '')]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 3,
      paddingBottom: () => 3,
      paddingLeft: () => 3,
      paddingRight: () => 3
    },
    margin: [0, 10, 10, 10]
  }

  const topLeftSide = {
    stack: [customerInfo, paymentInfo],
    width: '50%'
  }

  // Top Right: Invoice and Purchase Order Information
  const invoiceInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['Invoice No', ':', String(invoice.invoiceNumber || '')],
        ['Invoice Date', ':', String(invoice.date || '')]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 3,
      paddingBottom: () => 3,
      paddingLeft: () => 3,
      paddingRight: () => 3
    },
    margin: [10, 5, 0, 5]
  }

  const purchaseOrderInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['PO No', ':', String(purchaseOrder.purchaseOrderNumber || '')],
        ['PO Date', ':', String(purchaseOrder.purchaseOrderDate || '')],
        ['Project', ':', String(purchaseOrder.purchaseOrderType || '')]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 3,
      paddingBottom: () => 3,
      paddingLeft: () => 3,
      paddingRight: () => 3
    },
    margin: [10, 5, 0, 5]
  }

  const topRightSide = {
    stack: [invoiceInfo, purchaseOrderInfo],
    width: '50%',
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
        ])
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
      vLineWidth: () => 1,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3
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
        ])
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
      vLineWidth: () => 1,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3
    },
    margin: [0, 15, 0, 0]
  }

  // Summary Table
  const summaryTable = {
    table: {
      widths: purchaseOrder.purchaseOrderType === 'Spareparts' ? [20, 100, 80, 20, 20, 80, 80, 40] : [20, 180, 60, 80, 80],
      body: [
        [
          '',
          { text: 'Balance Payment ' + String(purchaseOrder.discount || '0') + '%', bold: true, italics: true },
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? ['', ''] : []),
          '',
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? [''] : [])
        ],
        [
          '1',
          'SubTotal',
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.subtotal) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? [''] : [])
        ],
        [
          '2',
          'Discount',
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.discount) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? [''] : [])
        ],
        [
          '3',
          'PPN 12%',
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.ppn) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? [''] : [])
        ],
        [
          '4',
          { text: 'Grand Total', bold: true },
          '',
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? ['', ''] : []),
          '',
          { text: formatCurrency(parseFloat(price.grandTotal) || 0), alignment: 'right', bold: true, fontSize: 8 },
          ...(purchaseOrder.purchaseOrderType === 'Spareparts' ? [''] : [])
        ]
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
      paddingBottom: () => 3
    },
    margin: [0, 0, 0, 0]
  }

  const totalAmountWord = toWords.convert(parseFloat(price.grandTotal) || 0)

  const docDefinition = {
    content: [
      // Header
      {
        text: 'INVOICE',
        margin: [0, 0, 0, 10],
        alignment: 'center',
        bold: true,
        fontSize: 18,
        decoration: 'underline'
      },
      {
        text: `Semarang, ${currentDate}`,
        margin: [0, 10, 0, 20],
        alignment: 'left',
        bold: true,
        fontSize: 14
      },
      {
        columns: [
          {
            width: '50%',
            stack: [topLeftSide]
          },
          {
            width: '50%',
            stack: [topRightSide]
          }
        ]
      },
      {
        text: `Dengan Hormat,`,
        margin: [0, 25, 0, 0]
      },
      {
        text: purchaseOrder.purchaseOrderType === 'Spareparts'
          ? `Berikut kami sampaikan Invoice untuk sparepart dengan rincian sebagai berikut:`
          : `Berikut kami sampaikan Invoice untuk jasa dengan rincian sebagai berikut:`,
        margin: [0, 15, 0, 0]
      },
      // Conditionally include Spareparts or Services table
      purchaseOrder.purchaseOrderType === 'Spareparts' ? sparepartsTable : servicesTable,
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
        width: '50%'
      },
      {
        text: 'Demikian Invoice ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
        margin: [0, 20, 0, 0]
      },
      // Signature rows
      {
        columns: [
          {
            table: {
              widths: ['auto'],
              body: [
                [{ text: 'Please Transfer Payment by TT to our Account:', bold: true }],
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
            width: '60%'
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
  if (purchaseOrder.purchaseOrderType === 'Spareparts') {
    console.log("Spareparts Table Body:", sparepartsTable.table.body)
  } else {
    console.log("Services Table Body:", servicesTable.table.body)
  }

  pdfMake.createPdf(docDefinition).download(`Invoice_${String(data.id || 'unknown')}.pdf`)
}

export { createPdf }
