import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { formatPDFPrice } from '../form-util'
import { common } from '@/config'
import { getBase64FromUrl } from '@/utils/pdf-util'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

// const data = {
//   id: 'ID',
//   currentStatus: 'ready',
//   project: {
//     quotationNumber: 'Q123456',
//     type: 'Service',
//     date: '2023-09-01'
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
//     amount: '1000000',
//     discount: '100000',
//     subtotal: '900000',
//     total: '900000',
//     ppn: '0',
//     grandTotal: '900000'
//   },
//   spareparts: [
//     {
//       sparepartName: 'Sparepart A',
//       sparepartNumber: 'SP001',
//       service: 'Service A',
//       quantity: 10,
//       unitPriceSell: 100000,
//       totalPrice: 1000000,
//       stock: 'In Stock'
//     },
//     {
//       sparepartName: 'Sparepart B',
//       sparepartNumber: 'SP002',
//       service: 'Service B',
//       quantity: 5,
//       unitPriceSell: 200000,
//       totalPrice: 1000000,
//       stock: 'In Stock'
//     },
//     // {
//     //   sparepartName: 'Sparepart A',
//     //   sparepartNumber: 'SP001',
//     //   quantity: 10,
//     //   unitPriceSell: 100000,
//     //   totalPrice: 1000000,
//     //   stock: 'In Stock'
//     // },
//     // {
//     //   sparepartName: 'Sparepart A',
//     //   sparepartNumber: 'SP001',
//     //   quantity: 10,
//     //   unitPriceSell: 100000,
//     //   totalPrice: 1000000,
//     //   stock: 'In Stock'
//     // },
//     // {
//     //   sparepartName: 'Sparepart A',
//     //   sparepartNumber: 'SP001',
//     //   quantity: 10,
//     //   unitPriceSell: 100000,
//     //   totalPrice: 1000000,
//     //   stock: 'In Stock'
//     // },
//     // {
//     //   sparepartName: 'Sparepart A',
//     //   sparepartNumber: 'SP001',
//     //   quantity: 10,
//     //   unitPriceSell: 100000,
//     //   totalPrice: 1000000,
//     //   stock: 'In Stock'
//     // },
//   ]
// }

const createPdf = async (data, notes, user) => {
  const { project, customer, price, spareparts, services } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  // Top Left
  const customerInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        [{ text: `Kepada Yth. `}, ''],
        [
          {
            text: `${customer.companyName}`,
            bold: true
          },
          ''
        ],
        [customer.office, ''],
        [customer.address, ''],
        [`${customer.city} - ${customer.province}`, ''],
        ...(project.nameUP ? [[`Up. ${project.nameUP}`, '']] : [])
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
    margin: [0, 13, 5, 5],
    minHeight: 460
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasDiscount = price.discount && price.discount > 0

  const sparepartTable = {
    header: {
      table: {
        widths: [20, 100, 80, 20, 20, 80, 80, 40],
        body: [
          [
            { text: 'No', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'PART NAME', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'PART NUMBER', style: 'tableHeader', alignment: 'center', fontSize: 8 },
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
            formatPDFPrice(item.unitPriceSell, { fontSize: 8 }),
            formatPDFPrice(item.totalPrice, { fontSize: 8 }),
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
    footer: {
      table: {
          widths: [20, 100, 80, 20, 20, 80, 80, 40],
          body: [
            ...(hasDiscount ? [
              [
                '', '', '', '', '',
                { text: 'Amount', alignment: 'center', fontSize: 8 },
                { text: formatCurrency(price.amount), alignment: 'right', fontSize: 8 },
                ''
              ],
              [
                '', '', '', '', '',
                { text: 'Discount', alignment: 'center', fontSize: 8 },
                { text: formatCurrency(price.discount), alignment: 'right', fontSize: 8 },
                ''
              ],
            ] : []),
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'SubTotal', alignment: 'center', fontSize: 8 },
              formatPDFPrice(price.subtotal, { fontSize: 8 }),
              ''
            ],
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'PPN 11%', alignment: 'center', fontSize: 8 },
              formatPDFPrice(price.ppn, { fontSize: 8 }),
              ''
            ],
            [
              '',
              '',
              '',
              '',
              '',
              { text: 'Grand Total', alignment: 'center', bold: true, fontSize: 8 },
              formatPDFPrice(price.grandTotal, { fontSize: 8 }),
              ''
            ],
          ]
      },
      layout: {
        hLineWidth: (i, node) => (i === 0) ? 0 : 1,
        // hLineWidth: (i, node) => {
        //   if(i === 0) return 1
        //   if(i === 1) return 0
        //   return (i === 1 || i === node.table.body.length ? 1 : 0.5)
        // },
        // vLineWidth: (i, node) => {
        //   if(i === 0) return 0.5
        //   return (i === 1 || i === node.table.widths.length ? 0.5 : 0)
        // },
        vLineWidth: (i, node) => 1,
        hLineColor: (i, node, c) => (c !== undefined && (c < 5 || c > 6)) ? '#ffffff' : '#000000',
        vLineColor: (i, node) => (i >= 5 && i <= 7) ? '#000000' : '#ffffff',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
      margin: [0, 0, 0, 0]
    }
  }

  const serviceTable = {
    header: {
      table: {
        widths: [20, 200, 30, 100, 100],
        body: [
          [
            { text: 'No', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'QTY', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 },
            { text: 'TOTAL PRICE', style: 'tableHeader', alignment: 'center', fontSize: 8 }
          ],
          ...services.map((item, idx) => [
            { text: idx + 1, alignment: 'center', fontSize: 8 },
            { text: item.service, fontSize: 8 },
            { text: item.quantity, alignment: 'center', fontSize: 8 },
            formatPDFPrice(item.unitPriceSell, { fontSize: 8 }),
            formatPDFPrice(item.totalPrice, { fontSize: 8 })
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
    footer: {
      table: {
          widths: [20, 200, 30, 100, 100],
          body: [
            ...(hasDiscount ? [
              [
                '', '',
                { text: 'Amount', alignment: 'center', fontSize: 8 },
                { text: formatCurrency(price.amount), alignment: 'right', fontSize: 8 },
                ''
              ],
              [
                '', '',
                { text: 'Discount', alignment: 'center', fontSize: 8 },
                { text: formatCurrency(price.discount), alignment: 'right', fontSize: 8 },
                ''
              ],
            ] : []),
            [
              '',
              '',
              '',
              { text: 'SubTotal', alignment: 'center', fontSize: 8 },
              formatPDFPrice(price.subtotal, { fontSize: 8 }),
            ],
            [
              '',
              '',
              '',
              { text: 'PPN 11%', alignment: 'center', fontSize: 8 },
              formatPDFPrice(price.ppn, { fontSize: 8 }),
            ],
            [
              '',
              '',
              '',
              { text: 'Grand Total', alignment: 'center', bold: true, fontSize: 8 },
              formatPDFPrice(price.grandTotal, { fontSize: 8 }),
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
    }
  }

  const revisionText = data.version > 1 ? `-Rev. ${data.version-1}` : ''
  const branchText = project.branch || ''
  const phoneNumber = user.phone || ''
  
  const docDefinition = {
    header: {
      image: logoBase64, // your base64 logo string
      width: 550,
      margin: [25, 30, 30, 0]
    },
    content: [
      {
        text: `Quotation No : ${data.project.quotationNumber}${revisionText}`,
        margin: [0, 3, 0, 0],
      },

      customerInfo,

      {
        text: `Dengan Hormat,`,
        margin: [0, 15, 0, 0]
      },
      {
        text: `Berikut kami sampaikan penawaran harga dengan rincian sebagai berikut:`,
        margin: [0, 15, 0, 0]
      },

      // Table
      project.type === common.type.sparepart ? sparepartTable.header : serviceTable.header,
      project.type === common.type.sparepart ? sparepartTable.footer : serviceTable.footer,

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
        text: 'Demikian penawaran ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
        margin: [0, 20, 0, 0]
      },

      // Signature rows
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `${branchText}, ${currentDate}` },
              { text: 'Hormat kami,' },
              { text: `${user.fullname || ''}`, margin: [0, 50, 0, 0] },
              { text: `PT. Berkat Megah Jaya` },
              { text: `${phoneNumber}` }
            ],
            margin: [0, 30, 0, 0]
          },
          {
            width: '50%',
            stack: [
              { text: `Disetujui,` },
              { text: '(                                               )', margin: [0, 55, 0, 0] },
              // { text: `${customer.companyName}` }
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
    pageMargins: [40, 100, 40, 60],
    pageSize: 'A4',
  }

  // pdfMake.createPdf(docDefinition).download(`${data.project.quotationNumber}.pdf`)
  pdfMake.createPdf(docDefinition).print()
}


export { createPdf }
