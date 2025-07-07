import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const createPdf = (data) => {
  const { purchaseOrder, customer, price, spareparts, services, notes, quotation_number } = data

  // Top Left: Customer Information
  const customerInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['Customer', ':', customer.companyName],
        ['Office', ':', customer.office],
        ['Address', ':', customer.address],
        ['', '', `${customer.city} - ${customer.province}`],
        ['', '', `${customer.subdistrict} ${customer.urban} (${customer.postalCode})`],
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
    margin: [5, 5, 5, 5],
    minHeight: 460
  }
  const topLeftSide = {
    stack: [customerInfo],
    width: '60%'
  }

  // Top Right: Purchase Order Information
  const purchaseOrderInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['PO No', ':', purchaseOrder.purchaseOrderNumber],
        ['Date', ':', purchaseOrder.purchaseOrderDate],
        ['Type', ':', purchaseOrder.type],
        ['Quotation No', ':', quotation_number || '']
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
    stack: [purchaseOrderInfo],
    width: '40%'
  }

  // Spareparts Table
  const sparepartsTable = {
    table: {
      widths: [20, 100, 80, 20, 20, 80, 80, 40],
      body: [
        [
          { text: 'No', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'PART NO.', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'QTY', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'UNIT', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 },
          { text: 'AMOUNT', style: 'tableHeader', alignment: 'center', fontSize: 8 },
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
      widths: purchaseOrder.type === 'Spareparts' ? [20, 100, 80, 20, 20, 80, 80, 40] : [20, 180, 60, 80, 80],
      body: [
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Amount', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.amount) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Discount', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.discount) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Sub Total', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.subtotal) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Advance Payment', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.advancePayment) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'Total', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.total) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'VAT', alignment: 'center', fontSize: 8 },
          { text: formatCurrency(parseFloat(price.vat) || 0), alignment: 'right', fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
        [
          '',
          '',
          '',
          ...(purchaseOrder.type === 'Spareparts' ? ['', ''] : []),
          { text: 'TOTAL AMOUNT', alignment: 'center', bold: true, fontSize: 8 },
          { text: formatCurrency(parseFloat(price.totalAmount) || 0), alignment: 'right', bold: true, fontSize: 8 },
          ...(purchaseOrder.type === 'Spareparts' ? [''] : [])
        ],
      ]
    },
    layout: {
      hLineWidth: (i) => (i === 0 ? 0 : 1),
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
      // Header
      {
        text: 'PURCHASE ORDER',
        margin: [0, 0, 0, 40],
        alignment: 'center',
        bold: true,
        fontSize: 18,
        decoration: 'underline'
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: [[topLeftSide, topRightSide]]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0
        }
      },
      {
        text: purchaseOrder.type === 'Spareparts'
          ? 'Berikut kami sampaikan Purchase Order untuk sparepart dengan rincian sebagai berikut:'
          : 'Berikut kami sampaikan Purchase Order untuk jasa dengan rincian sebagai berikut:',
        margin: [0, 15, 0, 0]
      },
      // Conditionally include Spareparts or Services table
      purchaseOrder.type === 'Spareparts' ? sparepartsTable : servicesTable,
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
        text: 'Demikian Purchase Order ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
        margin: [0, 20, 0, 0]
      },
      // Signature rows
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Semarang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` },
              { text: 'Hormat kami,' },
              { text: 'Yulia', margin: [0, 50, 0, 0] },
              { text: 'Admin Part PT. Berkat Megah Jaya' }
            ],
            margin: [0, 30, 0, 0]
          },
          {
            width: '50%',
            stack: [
              { text: 'Disetujui,' },
              { text: '(                                               )', margin: [0, 55, 0, 0] },
              { text: String(customer.companyName || '') }
            ],
            margin: [0, 40, 0, 0]
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
  if (purchaseOrder.type === 'Spareparts') {
    console.log("Spareparts Table Body:", sparepartsTable.table.body)
  } else {
    console.log("Services Table Body:", servicesTable.table.body)
  }

  pdfMake.createPdf(docDefinition).download(`Purchase_Order_${String(data.id || 'unknown')}.pdf`)
}

export { createPdf }
