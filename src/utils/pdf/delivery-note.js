import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'

// pdfMake.vfs = pdfFonts.pdfMake.vfs

// const data = {
//   id: 'ID',
//   currentStatus: 'ready',
//   deliveryOrder: {
//     deliveryOrderNumber: 'DO_NUMBER',
//     deliveryOrderDate: '2023-10-01',
//     receivedBy: 'John Doe',
//     pickedBy: 'Jane Smith',
//     preparedBy: 'Alice Johnson',
//     shipMode: 'Air',
//     orderType: 'Standard',
//     delivery: 'Express',
//     npp: '1234567890'
//   },
//   purchaseOrder: {
//     purchaseOrderNumber: 'PO_NUMBER',
//     purchaseOrderDate: '2023-09-30',
//     type: 'Spareparts'
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
//   sparepart: [
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

const createPdf = (data) => {
  const { deliveryOrder, customer, spareparts, notes } = data

  // Top Left
  const title = {
    table: {
      widths: ['*'],
      body: [
        [
          {
            text: 'DELIVERY NOTE',
            alignment: 'center',
            margin: [0, 4, 0, 4],
            bold: true,
            fontSize: 16
          }
        ]
      ]
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000'
    },
    margin: [0, 5, 10, 5]
  }
  const deliveryNoteInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['NO:', data.deliveryOrder.deliveryOrderNumber],
        ['DATE:', data.deliveryOrder.deliveryOrderDate],
        ['CUST. PO NO.:', data.purchaseOrder.purchaseOrderNumber],
        ['PACK. LIST:', data.id]
      ]
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
      paddingTop: () => 5,
      paddingBottom: () => 5,
      paddingLeft: () => 5,
      paddingRight: () => 5
    },
    margin: [0, 5, 10, 5],
  }
  const topLeftSide = {
    stack: [
      title,
      deliveryNoteInfo
    ],
    width: '50%'
  }
  // Top Right
  const to = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['TO:', customer.companyName],
        ['ADDRESS:', customer.address],
        ['CITY:', `${customer.city}, ${customer.province}`],
        ['POSTAL:', `${customer.postalCode}`]
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
    margin: [10, 5, 0, 5],
    minHeight: 460
  }
  const delivery = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['DLVR:', deliveryOrder.delivery],
        ['UP:', ''],
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
    margin: [10, 5, 0, 5],
    minHeight: 160
  }
  const topRightSide = {
    stack: [
      to,
      delivery
    ],
    width: '50%'
  }

  const docDefinition = {
    content: [
      // Header details
      {
        text: 'PT. BERKAT MEGAH JAYA',
        margin: [0, 0, 0, 0],
        alignment: 'right',
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

      // Table
      {
        table: {
          widths: [20, '*', 100, 40, 30, '*'],
          body: [
            [
              { text: 'NO', style: 'tableHeader' },
              { text: 'PART NAME', style: 'tableHeader' },
              { text: 'PART NO.', style: 'tableHeader' },
              { text: 'QTY', style: 'tableHeader' },
              { text: 'UNIT', style: 'tableHeader' },
              { text: 'REMARKS', style: 'tableHeader' }
            ],
            ...spareparts.map((item, idx) => [
              idx + 1,
              item.sparepartName,
              item.sparepartNumber,
              item.quantity,
              'PCS',
              item.stock
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        // layout: {
        //   hLineWidth: (i, node) => i === 1 ? 1 : 0.5,
        //   vLineWidth: () => 0.5,
        //   hLineColor: () => '#000000',
        //   vLineColor: () => '#000000',
        //   paddingLeft: () => 5,
        //   paddingRight: () => 5,
        //   paddingTop: () => 3,
        //   paddingBottom: () => 3,
        // },
        margin: [0, 10, 0, 20]
      },

      // Signature rows
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'PREPARED BY:', bold: true },
              { text: deliveryOrder.preparedBy, margin: [0, 50, 0, 0] }
            ],
            margin: [0, 20, 0, 0]
          },
          {
            width: '*',
            stack: [
              { text: 'PICKED / PACKED BY:', bold: true },
              { text: deliveryOrder.pickedBy, margin: [0, 50, 0, 0] }
            ],
            margin: [30, 20, 0, 0]
          },
          {
            width: '*',
            stack: [
              { text: 'RECEIVED BY:', bold: true },
              { text: deliveryOrder.receivedBy, margin: [0, 50, 0, 0] }
            ],
            margin: [50, 20, 0, 0]
          }
        ]
      },

      // Notes
      { text: `Note: ${notes}`, margin: [0, 40, 0, 0] },
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

  pdfMake.createPdf(docDefinition).download(`Delivery_Note_${data.id}.pdf`)
}


export { createPdf }
