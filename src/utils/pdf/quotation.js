import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatCurrency } from '../form-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

const data = {
  id: 'ID',
  currentStatus: 'ready',
  project: {
    quotationNumber: 'Q123456',
    type: 'Spareparts',
    date: '2023-09-01'
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
    total: '900000',
    ppn: '0',
    grandTotal: '900000'
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
  const { project, customer, price, spareparts, notes } = data

  // Top Left
  const customerInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        [
          {
            text: [ `Kepada Yth `, { text: `${customer.companyName}`, bold: true } ],
          },
          ''
        ],
        [customer.office, ''],
        [customer.address, ''],
        [`${customer.city} - ${customer.province}`, '']
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

  const docDefinition = {
    content: [
      // Header details
      // {
      //   image: 'data:image/png;base64,...', // your image in base64
      //   width: 100, // or height: 50
      //   margin: [0, 10, 0, 0]
      // },
      {
        text: `Quotation No : ${data.project.quotationNumber}`,
        margin: [0, 0, 0, 0],
      },

      customerInfo,

      {
        text: `Dengan Hormat,`,
        margin: [0, 25, 0, 0]
      },
      {
        text: `Berikut kami sampaikan Penawaran harga sparepart Mesin Mitsubishi dengan rincian sebagain berikut:`,
        margin: [0, 15, 0, 0]
      },

      // // Table
      {
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
            ...spareparts.map((item, idx) => [
              { text: idx + 1, alignment: 'center', fontSize: 8 },
              { text: item.sparepartName, fontSize: 8 },
              { text: item.sparepartNumber, alignment: 'center', fontSize: 8 },
              { text: item.quantity, alignment: 'center', fontSize: 8 },
              { text: 'pcs', alignment: 'center', fontSize: 8 },
              { text: formatCurrency(item.unitPriceSell), alignment: 'right', fontSize: 8 },
              { text: formatCurrency(item.totalPrice), alignment: 'right', fontSize: 8 },
              { text: item.stock, alignment: 'left', fontSize: 8 }
            ]),
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
          // vLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.widths.length ? 0.5 : 0),
          vLineWidth: (i, node) => 1,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
        margin: [0, 15, 0, 0]
      },
      {
        table: {
          widths: [20, 100, 80, 20, 20, 80, 80, 40],
          body: [
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'SubTotal', alignment: 'center', fontSize: 8 },
              { text: formatCurrency(price.subtotal), alignment: 'right', fontSize: 8 },
              ''
            ],
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'Ppn 11%', alignment: 'center', fontSize: 8 },
              { text: formatCurrency(price.ppn), alignment: 'right', fontSize: 8 },
              ''
            ],
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'Grand Total', alignment: 'center', bold: true, fontSize: 8 },
              { text: formatCurrency(price.grandTotal), alignment: 'right', fontSize: 8 },
              ''
            ],
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0) ? 0 : 1,
          // hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
          // vLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.widths.length ? 0.5 : 0),
          vLineWidth: (i, node) => 1,
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
        table: {
          widths: ['auto', '*'],
          body: [
            ['Note:', ''],
            [notes, '']
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
              { text: `Desetujui,` },
              { text: '(                                               )', margin: [0, 55, 0, 0] },
              { text: `${customer.companyName}` }
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

  pdfMake.createPdf(docDefinition).download(`Quotation_${data.id}.pdf`)
}


export { createPdf }
