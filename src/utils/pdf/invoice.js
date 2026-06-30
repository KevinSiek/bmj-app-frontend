import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'
import { ToWords } from 'to-words'  
import { common } from '@/config'
import { getBase64FromUrl } from '../pdf-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

// const data = {
//   id: 'ID',
//   currentStatus: 'ready',
//   purchaseOrder: {
//     purchaseOrderNumber: 'PO_NUMBER',
//     purchaseOrderDate: '2023-09-30',
//     purchaseOrderType: 'Service',
//     paymentDue: '2023-10-15',
//     discount: '10%'
//   },
//   invoice: {
//     invoiceNumber: 'INV_NUMBER',
//     date: '2023-10-01',
//     termOfPayment: 'CASH',
//     subTotal: '1000000',
//     grandTotal: '900000'
//   },
//   customer: {
//     companyName: 'BMJ Company',
//     address: 'JL. KARYA BARU NO 60. PONTIANAK SELATAN',
//     city: 'Jakarta',
//     province: 'DKI Jakarta',
//     office: 'Head Office',
//     urban: 'Central Jakarta',
//     subdistrict: 'Gambir',
//     postalCode: '10110'
//   },
//   notes: 'Please handle with care.',
//   price: {
//     subtotal: '1000000',
//     discount: '100000',
//     ppn: '100000',
//     grandTotal: '1100000',
//   },
//   spareparts: [
//     {
//       sparepartName: 'Sparepart A',
//       sparepartNumber: 'SP001',
//       quantity: 10,
//       unitPriceSell: 100000,
//       totalPrice: 1000000,
//       stock: 'In Stock'
//     },
//     {
//       sparepartName: 'Sparepart B',
//       sparepartNumber: 'SP002',
//       quantity: 5,
//       unitPriceSell: 200000,
//       totalPrice: 1000000,
//       stock: 'In Stock'
//     }
//   ]
// }
const toWords = new ToWords({
  localeCode: 'en-US',
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: 'IDR',
      plural: 'Rupiahs',
      symbol: 'Rp.'
    },
  }
})

const createPdf = async (data) => {
  const { purchaseOrder, invoice, customer, price, termOfPayment, paymentDue, ppn } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

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
        ['Term of Payment', ':', termOfPayment],
        ['Payment Due', ':', paymentDue],
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
        ['PO NO',':', purchaseOrder.poNumber],
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
        widths: [20, 20, 200, 30, '*', '*'],
        body: [
          [
            { text: 'No', style: 'tableHeader' },
            { text: 'PRD', style: 'tableHeader' },
            { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
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

  const totalAmountWord = toWords.convert(Math.ceil(price.grandTotal), { ignoreDecimal: true })
  const type = purchaseOrder.purchaseOrderType === common.type.sparepart ? 'SPAREPART' : 'SERVICE'
  const invoiceType = invoice.type

  const dp = invoice.downPayment || 0
  const subtotalAmount = Math.ceil(price.subtotal)
  const subtotalTypeDp = invoice.type === 'DP' ? subtotalAmount*dp/100 : subtotalAmount*(100-dp)/100
  const ppnTypeDp = Math.ceil(subtotalTypeDp * (ppn/100))
  const grandTotalTypeDpWithPpn = subtotalTypeDp + ppnTypeDp

  const totalDP = [
    [{ text: invoice.type === 'DP' ? 'Subtotal DP 1' : 'Subtotal DP 2', bold: true, margin: [0, 20, 0, 0] }, { text: formatCurrency(subtotalTypeDp), alignment: 'right', bold: true, margin: [0, 20, 0, 0] }],
    [{ text: 'PPN 11%', bold: true }, { text: formatCurrency(ppnTypeDp), alignment: 'right', bold: true }],
    [{ text: invoiceType === 'DP' ? 'Grand Total DP 1' :'Grand Total DP 2', bold: true }, { text: formatCurrency(grandTotalTypeDpWithPpn), alignment: 'right', bold: true }]
  ]

  const hasDiscount = price.discount > 0

  const docDefinition = {
    header: {
      image: logoBase64, // your base64 logo string
      width: 550,
      margin: [25, 30, 30, 0]
    },
    content: [
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
          widths: ['50%', '50%'],
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
              { text: invoice.type === 'DP' ? 'Down Payment 1' : invoice.type === 'DP2' ? 'Down Payment 2' : 'Balance Payment', bold: true, margin: [55, 0, 0, 0], italics: true },
              ''
            ],
            [
              { text: '1', margin: [8, 0, 0, 0] },
              { text: `${type} ATAS PO ${purchaseOrder.poNumber}`, margin: [8, 0, 0, 0] },
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
            ...(hasDiscount ? [
              ['AMOUNT', { text: formatCurrency(price.amount), alignment: 'right' }],
              ['DISC', { text: formatCurrency(price.discount), alignment: 'right' }],
            ] : []),
            ['SUB TOTAL', { text: formatCurrency(price.subtotal), alignment: 'right' }],
            ...(invoice.type === 'Final' ? [
              ['PPN 11%', { text: formatCurrency(price.ppn), alignment: 'right' }],
              [{ text: 'GRAND TOTAL', bold: true }, { text: formatCurrency(price.grandTotal), alignment: 'right', bold: true }]
            ] : totalDP)
          ]
        },
        layout: {
          hLineWidth: (i, node) => {
            if (invoice.type === 'Final') return i === 2 || i === 4 ? 1 : 0
            return i === 2 || i === 5 ? 1 : 0
          },
          vLineWidth: () => 0,
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [250, 110, 30, 5],
      },
      {
        text: '# ' + totalAmountWord + ' #',
        alignment: 'center',
        bold: true,
        margin: [0, 40, 0, 10]
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
            margin: [10, 30, 0, 5],
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
    pageMargins: [40, 100, 40, 60],
    pageSize: 'A4',
  }

  // pdfMake.createPdf(docDefinition).download(`Invoice_${data.id}.pdf`)
  pdfMake.createPdf(docDefinition).print()
}


export { createPdf }
