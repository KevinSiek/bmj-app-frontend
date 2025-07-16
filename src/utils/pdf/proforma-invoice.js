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
      // can be used to override defaults for the selected locale
      name: 'IDR',
      plural: 'Rupiahs',
      symbol: 'Rp.'
    },
  }
})

const data = {
  id: 'ID',
  currentStatus: 'ready',
  project: {
    proformaInvoiceNumber: 'PROFORMA_INV_NUMBER',
    purchaseOrderNumber: 'PO_NUMBER',
    purchaseOrderDate: '2023-09-01',
    date: '2023-09-30',
    type: 'Spareparts'
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
    amount: '1000000',
    discount: '100000',
    subtotal: '900000',
    advancePayment: '0',
    total: '900000',
    vat: '0',
    totalAmount: '900000'
  },
  downPayment: '0',
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
    },
    // {
    //   sparepartName: 'Sparepart A',
    //   sparepartNumber: 'SP001',
    //   quantity: 10,
    //   unitPriceSell: 100000,
    //   totalPrice: 1000000,
    //   stock: 'In Stock'
    // },
    // {
    //   sparepartName: 'Sparepart A',
    //   sparepartNumber: 'SP001',
    //   quantity: 10,
    //   unitPriceSell: 100000,
    //   totalPrice: 1000000,
    //   stock: 'In Stock'
    // },
    // {
    //   sparepartName: 'Sparepart A',
    //   sparepartNumber: 'SP001',
    //   quantity: 10,
    //   unitPriceSell: 100000,
    //   totalPrice: 1000000,
    //   stock: 'In Stock'
    // },
    // {
    //   sparepartName: 'Sparepart A',
    //   sparepartNumber: 'SP001',
    //   quantity: 10,
    //   unitPriceSell: 100000,
    //   totalPrice: 1000000,
    //   stock: 'In Stock'
    // },
  ]
}

const createPdf = () => {
  const { project, customer, price, downPayment, spareparts } = data

  const totalAmountWord = toWords.convert(price.totalAmount)

  // Top Left
  const purchaseOrderInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['Purchase Order', ':', project.purchaseOrderNumber],
        ['Date', ':', project.purchaseOrderDate],
        ['Project', ':', project.type],
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
    margin: [0, 10, 10, 10],
  }
  const topLeftSide = {
    stack: [
      purchaseOrderInfo
    ],
    width: '50%'
  }
  // Top Right
  const proformaInvoiceInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['No', ':', project.proformaInvoiceNumber],
        ['Date',':', project.date]
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
    margin: [40, 5, 0, 5],
    minHeight: 460
  }
  const topRightSide = {
    stack: [
      proformaInvoiceInfo
    ],
    width: '50%'
  }

  const docDefinition = {

    content: [
      // Header details
      {
        text: 'PROFORMA INVOICE',
        margin: [0, 0, 0, 0],
        alignment: 'center',
        bold: true,
        fontSize: 18
      },
      {
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
        margin: [0, 20, 0, 10]
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
      {
        table: {
          widths: [20, 200, 20, 20, 100, 100],
          body: [
            [
              { text: 'No', style: 'tableHeader', alignment: 'center' },
              { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
              { text: 'QTY', style: 'tableHeader', alignment: 'center' },
              { text: 'Unit', style: 'tableHeader', alignment: 'center' },
              { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center' },
              { text: 'AMOUNT', style: 'tableHeader', alignment: 'center' }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        margin: [0, 5, 0, 0]
      },
      {
        table: {
          widths: [20, 200, 20, 20, 100, 100],
          body: [
            [
              '',
              { text: 'Balance Payment ' + downPayment + '%', bold: true, margin: [55, 0, 0, 0], italics: true },
              '',
              '',
              '',
              '',
            ],
            ...spareparts.map((item, idx) => [
              { text: idx + 1, alignment: 'center' },
              {
                columns: [
                  {
                    text: item.sparepartName,
                    width: '60%',
                  },
                  {
                    text: item.sparepartNumber,
                    width: '40%',
                  },
                ]
              },
              { text: item.quantity, alignment: 'center' },
              { text: 'pcs', alignment: 'center' },
              { text: formatCurrency(item.unitPriceSell), alignment: 'right' },
              { text: formatCurrency(item.totalPrice), alignment: 'right' }
            ]),
            [
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
              { text: '', margin: [0, (90-spareparts.length*10), 0, (90-spareparts.length*10)] },
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        margin: [0, 0, 0, 0],
        minHeight: 700
      },
      {
        table: {
          widths: [20, 200, 20, 20, 100, 100],
          body: [
            [
              '1',
              { text: 'Amount' },
              '',
              '',
              '',
              { text: formatCurrency(price.amount), alignment: 'right' }
            ],
            [
              '2',
              { text: 'Less: Discount' },
              '',
              '',
              '',
              { text: formatCurrency(price.discount), alignment: 'right' }
            ],
            [
              '3',
              { text: 'Sub Total ( 1-2 )' },
              '',
              '',
              '',
              { text: formatCurrency(price.subtotal), alignment: 'right' }
            ],
            [
              '4',
              { text: 'Less: Advance Payment' },
              '',
              '',
              '',
              { text: formatCurrency(price.advancePayment), alignment: 'right' }
            ],
            [
              '5',
              { text: 'Total ( 3-4 )' },
              '',
              '',
              '',
              { text: formatCurrency(price.total), alignment: 'right' }
            ],
            [
              '6',
              { text: 'VAT' },
              '',
              '',
              '',
              { text: formatCurrency(price.vat), alignment: 'right' }
            ],
            [
              '7',
              { text: 'TOTAL AMOUNT ( 5+6 )', bold: true },
              '',
              '',
              '',
              { text: formatCurrency(price.totalAmount), alignment: 'right', bold: true }
            ],
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        margin: [0, 0, 0, 0]
      },

      {
        text: '# ' + totalAmountWord + ' #',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 0]
      },

      // Signature rows
      {
        columns: [
          {
            table: {
              widths: ['auto'],
              body: [
                [{ text: 'Payment by TT to Our Account : ', bold: true, margin: [0, 0, 0, 0] }],
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
            minHeight: 460,
            width: '60%',
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

  pdfMake.createPdf(docDefinition).download(`Proforma_Invoice_${data.id}.pdf`)
}


export { createPdf }
