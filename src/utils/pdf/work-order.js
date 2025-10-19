import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { getBase64FromUrl } from '../pdf-util'

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

const createPdf = async (data) => {
  const {
    serviceOrder,
    purchaseOrder,
    customer,
    units,
    additional,
    poc,
    date,
    description
  } = data

  const logoBase64 = await getBase64FromUrl('/images/logo-header.png')

  // Top Left
  const poInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['Reff PO No.', purchaseOrder.purchaseOrderNumber],
        ['PO Date', purchaseOrder.purchaseOrderDate],
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
    margin: [0, 5, 10, 5]
  }
  const addressInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['CUSTOMER NAME', customer.companyName],
        ['ADDRESS', customer.address],
        ['', `${customer.city}, ${customer.province}`]
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
    margin: [0, 5, 10, 5]
  }
  const topLeftSide = {
    stack: [
      poInfo,
      addressInfo
    ],
    width: '50%'
  }
  // Top Right
  const woInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['ORDER NUMBER', serviceOrder.no],
        ['ORDER DATE', serviceOrder.date],
        ['ORDER RECEIVED BY', serviceOrder.receivedBy],
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
    margin: [10, 5, 0, 5]
  }
  const dateInfo = {
    table: {
      widths: ['auto', '*'],
      body: [
        ['EXPECTED START DATE', serviceOrder.startDate],
        ['EXPECTED END DATE', serviceOrder.endDate],
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
    margin: [10, 5, 0, 5]
  }
  const topRightSide = {
    stack: [
      dateInfo,
      woInfo
    ],
    width: '50%'
  }

  const leftPOC = {
    stack: [
      {
        table: {
          widths: ['100%'],
          body: [
            [
              [
                { text: 'Work Order', style: 'tableHeader', alignment: 'center' },
                { text: 'Compiled By,', style: 'tableHeader', alignment: 'center' },
              ]
            ],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [
              [
                { text: poc.compiled, alignment: 'center', bold: true, decoration: 'underline' },
                { text: 'ADMIN CSO', alignment: 'center', bold: true }
              ]
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length-1 || i === node.table.body.length ? 0.5 : 0),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [0, 5, 0, 5]
      }
    ],
  }

  const rightPOC = {
    stack: [
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'Work Order ', style: 'tableHeader', alignment: 'center' },
                  { text: 'Authorized by,', style: 'tableHeader', alignment: 'center' }
                ],
                colSpan: 2
              },
              {}
            ],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            ['', ''],
            [
              {
                stack: [
                  { text: poc.headOfService, alignment: 'center', bold: true, decoration: 'underline' },
                  { text: 'Dept Head Service', alignment: 'center', bold: true },
                ]
              },
              {
                stack: [
                  { text: poc.director, alignment: 'center', bold: true, decoration: 'underline' },
                  { text: 'Director', alignment: 'center', bold: true }
                ]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length-1 || i === node.table.body.length ? 0.5 : 0),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [0, 5, 0, 5],
      }
    ],
  }

  const leftDate = {
    stack: [],
    width: '50%'
  }

  const rightDate = {
    stack: [
      {
        table: {
          widths: ['30%', '35%', '35%'],
          body: [
            ['Date Completed', `Start Date: ${date.startDate}`, `End Date: ${date.endDate}`],
            ['Work Performed by', { text: poc.worker, colSpan: 2}, {}],
          ]
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [10, 5, 0, 5],
        minHeight: 160
      },
      {
        table: {
          widths: ['70%', '30%'],
          body: [
            [
              { text: 'Description of Work Completed', alignment: 'center' },
              { text: 'Approved By', alignment: 'center' }
            ],
            [description, poc.approver],
          ]
        },
        layout: {
          hLineWidth: (i, node) => 0.5,
          vLineWidth: (i, node) => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [10, 5, 0, 5],
        minHeight: 160
      },
    ],
  }

  const docDefinition = {
    header: {
      image: logoBase64, // your base64 logo string
      width: 550,
      margin: [25, 30, 30, 0]
    },
    content: [
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

      // WORK DESCRIPTION
      {
        table: {
          widths: ['40%', '60%'],
          body: [
            [
              { text: 'WORK DESCRIPTION', style: 'tableHeader', alignment: 'center', colSpan: 2 },
              {},
            ],
            ...units.map((item) => [
              [
                { text: 'JOB DESCRIPTION', bold: true },
                { text: 'QTY UNIT', bold: true },
                { text: 'UNIT TYPE', bold: true },
              ],
              [
                item.jobDescriptions,
                item.quantity,
                item.unitType
              ]
            ])
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [0, 10, 0, 10]
      },

      // // Additional Comments
      {
        table: {
          widths: ['40%', '60%'],
          body: [
            [
              { text: 'ADDITIONAL COMMENTS', style: 'tableHeader', alignment: 'center', colSpan: 2 },
              {},
            ],
            ['1  LIST SPAREPART YANG AKAN DIGANTI', additional.spareparts !== '' && additional.spareparts !== '-' ? 'V' : '-'],
            ['2  LIST SPAREPART CADANGAN', additional.backupSparepart !== '' && additional.backupSparepart !== '-' ? 'V' : '-'],
            ['3  LINGKUP PEKERJAAN', additional.scope !== '' && additional.scope !== '-' ? 'V' : '-'],
            ['4  APD', additional.apd !== '' && additional.apd !== '-' ? 'V' : '-'],
            ['5  VAKSINASI', additional.vaccine !== '' && additional.vaccine !== '-' ? 'V' : '-'],
            ['6  EKSEKUSI JAM KERJA / MALAM HARI', additional.executionTime !== '' && additional.executionTime !== '-' ? `V ${additional.executionTime}` : '-'],
            ['7  FOTO DOKUMENTASI', 'V'],
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0),
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
          paddingTop: () => 3,
          paddingBottom: () => 3,
          paddingLeft: () => 3,
          paddingRight: () => 3
        },
        margin: [0, 10, 0, 20]
      },

      // // POC
      {
        table: {
          widths: ['25%', '15%', '60%'],
          body: [
            [leftPOC, '', rightPOC],
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

      // DATE
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [leftDate, rightDate],
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

  pdfMake.createPdf(docDefinition).download(`Delivery_Note_${data.id}.pdf`)
}


export { createPdf }
