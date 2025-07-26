import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'
import { common } from '@/config'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const data = {
  id: 'ID',
  currentStatus: 'ready',
  purchaseOrder: {
    purchaseOrderNumber: 'PO_NUMBER',
    purchaseOrderDate: '2023-09-30',
    purchaseOrderType: 'Spareparts',
    paymentDue: '2023-10-15',
    discount: '10%'
  },
  invoice: {
    invoiceNumber: 'INV_NUMBER',
    date: '2023-10-01',
    termOfPayment: 'CASH',
    subTotal: '1000000',
    grandTotal: '900000'
  },
  customer: {
    companyName: 'BMJ Company',
    address: 'JL. KARYA BARU NO 60. PONTIANAK SELATAN',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    office: 'Head Office',
    urban: 'Central Jakarta',
    subdistrict: 'Gambir',
    postalCode: '10110'
  },
  notes: 'Please handle with care.',
  price: {
    subtotal: '1000000',
    discount: '100000',
    ppn: '100000',
    grandTotal: '1100000',
  },
  spareparts: [
    {
      sparepartName: 'Sparepart A',
      sparepartNumber: 'SP001',
      quantity: 10,
      unitPriceSell: 100000,
      totalPrice: 1000000,
      stock: 'In Stock'
    },
    {
      sparepartName: 'Sparepart B',
      sparepartNumber: 'SP002',
      quantity: 5,
      unitPriceSell: 200000,
      totalPrice: 1000000,
      stock: 'In Stock'
    }
  ]
}

const createPdf = () => {
  const { purchaseOrder, invoice, customer, price } = data

  // Top Left
  const customerInfo = {
    table: {
      widths: ['auto', 'auto', '*'],
      body: [
        ['To', ':', customer.companyName],
        ['Address', ':', customer.address],
        ['City', ':',`${customer.city}, ${customer.province}`],
        ['Postal', ':',`${customer.postalCode}`]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
    },
    margin: [0, 10, 10, 10]
  }
  const paymentInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['Term of Payment', ':',invoice.termOfPayment],
        ['Payment Due', ':', purchaseOrder.paymentDue],
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
    margin: [0, 10, 10, 10],
  }
  const topLeftSide = {
    stack: [
      customerInfo,
      paymentInfo
    ],
    width: '50%'
  }
  // Top Right
  const invoiceInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['INV NO', ':', invoice.invoiceNumber],
        ['INV DATE',':', invoice.date]
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
    margin: [10, 5, 0, 5],
    minHeight: 460
  }
  const purchaseOrderInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['PO NO',':', purchaseOrder.purchaseOrderNumber],
        ['PO DATE', ':', purchaseOrder.purchaseOrderDate],
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
    margin: [10, 5, 0, 5],
    minHeight: 160
  }
  const topRightSide = {
    stack: [
      invoiceInfo,
      purchaseOrderInfo
    ],
    width: '50%'
  }

  const sparepart = {
    header: {
      table: {
        widths: [20, 20, 100, 100, 30, '*', '*'],
        body: [
          [
            { text: 'No', style: 'tableHeader' },
            { text: 'PRD', style: 'tableHeader' },
            { text: 'ITEM NUMBER', style: 'tableHeader' },
            { text: 'DESCRIPTION', style: 'tableHeader' },
            { text: 'QTY', style: 'tableHeader' },
            { text: 'UNIT PRICE', style: 'tableHeader' },
            { text: 'SUB TOTAL', style: 'tableHeader' }
          ]
        ]
      },
      layout: {
        hLineWidth: (i, node) => i === 1 ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
      margin: [0, 5, 0, 0]
    }
  }

  const service = {
    header: {
      table: {
        widths: [20, 20, 100, 30, '*', '*'],
        body: [
          [
            { text: 'No', style: 'tableHeader' },
            { text: 'PRD', style: 'tableHeader' },
            { text: 'DESCRIPTION', style: 'tableHeader' },
            { text: 'QTY', style: 'tableHeader' },
            { text: 'UNIT PRICE', style: 'tableHeader' },
            { text: 'SUB TOTAL', style: 'tableHeader' }
          ]
        ]
      },
      layout: {
        hLineWidth: (i, node) => i === 1 ? 1 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
      margin: [0, 5, 0, 0]
    }
  }

  const type = purchaseOrder.purchaseOrderType === common.type.sparepart ? 'SPAREPART' : 'SERVICE'

  const docDefinition = {
    content: [
      // Header details
      {
        text: 'INVOICE',
        margin: [0, 0, 0, 5],
        alignment: 'left',
        bold: true,
        fontSize: 16
      },
      {
        text: 'SEMARANG',
        margin: [0, 5, 0, 0],
        alignment: 'left',
        bold: true,
        fontSize: 14
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [topLeftSide, topRightSide],
          ]
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

      // // Table
      purchaseOrder.purchaseOrderType === common.type.sparepart ? sparepart.header : service.header,
      {
        table: {
          widths: ['10%', '*', '30%'],
          body: [
            [
              '',
              { text: 'Balance Payment', bold: true, margin: [55, 0, 0, 0], italics: true },
              ''
            ],
            [
              { text: '1', margin: [8, 0, 0, 0] },
              { text: `${type} ATAS PO ${purchaseOrder.purchaseOrderNumber}`, margin: [8, 0, 0, 0] },
              {
                text: formatCurrency(price.subtotal),
                margin: [0, 0, 30, 0],
                alignment: 'right'
              },
            ],
          ]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 0,
          paddingRight: () => 0
        }
      },

      {
        table: {
          widths: [100, '*'],
          body: [
            ['SUB TOTAL', { text: formatCurrency(price.subtotal), alignment: 'right' }],
            ['DISC', { text: formatCurrency(price.discount), alignment: 'right' }],
            ['PPN 11%', { text: formatCurrency(price.ppn), alignment: 'right' }],
            ['GRAND TOTAL', { text: formatCurrency(price.grandTotal), alignment: 'right' }]
          ]
        },
        layout: {
          hLineWidth: (i, node) => i === 3 ? 1 : 0,
          vLineWidth: () => 0,
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [250, 200, 30, 5],
      },

      // // Signature rows
      {
        columns: [
          {
            table: {
              widths: ['auto'],
              body: [
                [
                  {
                    text: 'Please Transfer Payment by TT to our Account :',
                    bold: true
                  },
                ],
                ['PT. BERKAT MEGAH JAYA'],
                ['A/C 009 - 8928009 (IDR)'],
                ['BCA KCU Pemuda - Semarang (Jateng)'],
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
            margin: [10, 50, 0, 5],
          },
          {
            width: '40%',
            stack: [
              { text: 'SR. PRAWESTI', bold: true, alignment: 'center', decoration: 'underline' },
              { text: 'FINANCE', alignment: 'center' }
            ],
            margin: [0, 90, 0, 0]
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

  pdfMake.createPdf(docDefinition).download(`Invoice_${data.id}.pdf`)
}


export { createPdf }
