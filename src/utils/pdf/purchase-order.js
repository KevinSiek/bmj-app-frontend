import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'
import { common } from '@/config'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const data = {
  id: 'ID',
  currentStatus: 'ready',
  purchaseOrder: {
    purchaseOrderNumber: 'PO123456',
    purchaseOrderDate: '2023-09-01',
    type: 'Spareparts'
  },
  proformaInvoice: {
    proformaInvoiceNumber: 'PI123456',
    proformaInvoiceDate: '2023-09-02',
    isDpPaid: false,
    isFullPaid: false
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
      service: 'Service A',
      quantity: 10,
      unitPriceSell: 100000,
      totalPrice: 1000000,
      stock: 'In Stock'
    },
    {
      sparepartName: 'Sparepart B',
      sparepartNumber: 'SP002',
      service: 'Service B',
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
  const { purchaseOrder, customer, price, spareparts, notes } = data

  // Top Left
  const customerInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['Customer', ':', customer.companyName],
        ['Office', ':', customer.office],
        ['Address',':', customer.address],
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
    stack: [
      customerInfo
    ],
    width: '60%'
  }
  // Top Right

  const purchaseOrderInfo = {
    table: {
      widths: ['auto', 'auto','*'],
      body: [
        ['PO No', ':', purchaseOrder.purchaseOrderNumber],
        ['Date', ':', purchaseOrder.purchaseOrderDate],
        ['Type', ':', purchaseOrder.type]
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
    stack: [
      purchaseOrderInfo
    ],
    width: '40%'
  }

  const sparepartTable = {
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
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0),
      // vLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.widths.length ? 0.5 : 0),
      vLineWidth: (i, node) => 0,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 10, 0, 0]
  }

  const serviceTable = {
    table: {
      widths: [20, 200, 20, 100, 100],
      body: [
        [
          { text: 'No', style: 'tableHeader', alignment: 'center' },
          { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
          { text: 'QTY', style: 'tableHeader', alignment: 'center' },
          { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center' },
          { text: 'AMOUNT', style: 'tableHeader', alignment: 'center' }
        ],
        ...spareparts.map((item, idx) => [
          { text: idx + 1, alignment: 'center' },
          { text: item.service, alignment: 'center' },
          { text: item.quantity, alignment: 'center' },
          { text: formatCurrency(item.unitPriceSell), alignment: 'right' },
          { text: formatCurrency(item.totalPrice), alignment: 'right' }
        ]),
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0),
      // vLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.widths.length ? 0.5 : 0),
      vLineWidth: (i, node) => 0,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 10, 0, 0]
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

      // Table
      purchaseOrder.type === common.type.sparepart ? sparepartTable : serviceTable,
      {
        table: {
          widths: [20, 200, 20, 20, 100, 100],
          body: [
            [
              '',
              '',
              '',
              '',
              { text: 'Amount' },
              { text: formatCurrency(price.amount), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'Discount' },
              { text: formatCurrency(price.discount), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'Sub Total' },
              { text: formatCurrency(price.subtotal), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'Advance Payment' },
              { text: formatCurrency(price.advancePayment), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'Total' },
              { text: formatCurrency(price.total), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'VAT' },
              { text: formatCurrency(price.vat), alignment: 'right' }
            ],
            [
              '',
              '',
              '',
              '',
              { text: 'TOTAL AMOUNT', bold: true },
              { text: formatCurrency(price.totalAmount), alignment: 'right', bold: true }
            ],
          ]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        margin: [0, 0, 0, 0]
      },

      // Signature rows
      {
        columns: [
          {
            table: {
              widths: ['auto', '*'],
              body: [
                ['Note:', ''],
                [notes, ''],
                ['', ''],
                [{ text: 'PT. Berkat Megah Jaya', bold: true, margin: [0, 0, 0, 0]}, '']
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
            width: '50%',
          },
          {
            width: '40%',
            stack: [
              { text: 'PT. Berkat Megah Jaya', bold: true, alignment: 'center', decoration: 'underline' }
            ],
            margin: [0, 50, 0, 0]
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

  pdfMake.createPdf(docDefinition).download(`Purchase_Order_${data.id}.pdf`)
}


export { createPdf }
