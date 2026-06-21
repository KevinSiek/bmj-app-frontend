const menuMapping = {
  menu: {
    name: 'Menu',
    path: '/menu'
  },
  menu_director: {
    name: 'Menu Director',
    path: '/menu/director'
  },
  menu_marketing: {
    name: 'Menu Marketing',
    path: '/menu/marketing'
  },
  menu_inventory_admin: {
    name: 'Menu Inventory Admin',
    path: '/menu/inventory-admin'
  },
  menu_inventory_purchase: {
    name: 'Menu Inventory Purchase',
    path: '/menu/inventory-purchase'
  },
  menu_inventory_head: {
    name: 'Menu Inventory Head',
    path: '/menu/inventory-head'
  },
  menu_finance: {
    name: 'Menu Finance',
    path: '/menu/finance'
  },
  menu_service: {
    name: 'Menu Service',
    path: '/menu/service'
  },
  profile: {
    name: 'Profile',
    path: '/profile'
  },
  general: {
    name: 'General',
    path: '/general'
  },
  dashboard: {
    name: 'Dashboard',
    path: '/dashboard'
  },
  quotation: {
    name: 'Quotation',
    path: '/quotation'
  },
  quotation_add: {
    name: 'Add Quotation',
    path: '/quotation/add'
  },
  quotation_edit: {
    name: 'Edit Quotation',
    path: '/quotation/:id/edit'
  },
  quotation_review: {
    name: 'Quotation Review',
    path: '/quotation/review'
  },
  quotation_detail: {
    name: 'Detail Quotation',
    path: '/quotation/:id'
  },
  quotation_review_detail: {
    name: 'Detail Quotation Review',
    path: '/quotation/review/:id'
  },
  purchase_order: {
    name: 'Purchase Order',
    path: '/purchase-order'
  },
  purchase_order_return: {
    name: 'Purchase Order Return',
    path: '/purchase-order/return/:id'
  },
  purchase_order_detail: {
    name: 'Detail PO',
    path: '/purchase-order/:id'
  },
  proforma_invoice: {
    name: 'Proforma Invoice',
    path: '/proforma-invoice'
  },
  proforma_invoice_detail: {
    name: 'Detail Proforma Invoice',
    path: '/proforma-invoice/:id'
  },
  proforma_invoice_edit: {
    name: 'Edit Proforma Invoice',
    path: '/proforma-invoice/:id/edit'
  },
  invoice: {
    name: 'Invoice',
    path: '/invoice'
  },
  invoice_detail: {
    name: 'Detail Invoice',
    path: '/invoice/:id'
  },
  spareparts: {
    name: 'Spareparts',
    path: '/spareparts'
  },
  spareparts_add: {
    name: 'Add Spareparts',
    path: '/spareparts/add'
  },
  spareparts_detail: {
    name: 'Detail Spareparts',
    path: '/spareparts/:id'
  },
  spareparts_edit: {
    name: 'Edit Spareparts',
    path: '/spareparts/:id/edit'
  },
  sparepart_movement: {
    name: 'Sparepart Movement',
    path: '/sparepart-movement'
  },
  sparepart_movement_add: {
    name: 'Add Sparepart Movement',
    path: '/sparepart-movement/add'
  },
  sparepart_movement_detail: {
    name: 'Detail Sparepart Movement',
    path: '/sparepart-movement/:id'
  },
  back_order: {
    name: 'Back Order',
    path: '/back-order'
  },
  back_order_detail: {
    name: 'Detail Back Order',
    path: '/back-order/:id'
  },
  back_order_adjustment: {
    name: 'Adjust Back Order',
    path: '/back-order/:id/adjustment'
  },
  borrow: {
    name: 'Borrow',
    path: '/borrow'
  },
  borrow_add: {
    name: 'Add Borrow',
    path: '/borrow/add'
  },
  borrow_edit: {
    name: 'Edit Borrow',
    path: '/borrow/:id/edit'
  },
  borrow_detail: {
    name: 'Detail Borrow',
    path: '/borrow/:id'
  },
  borrow_return: {
    name: 'Return Borrow',
    path: '/borrow/:id/return'
  },
  stock_history: {
    name: 'Stock History',
    path: '/stock-history'
  },
  purchase: {
    name: 'Purchase',
    path: '/purchase'
  },
  purchase_review: {
    name: 'Purchase Review',
    path: '/purchase/review'
  },
  purchase_review_detail: {
    name: 'Detail Purchase Review',
    path: '/purchase/:id/review'
  },
  purchase_add: {
    name: 'Add Purchase',
    path: '/purchase/add'
  },
  purchase_edit: {
    name: 'Edit Purchase',
    path: '/purchase/:id/edit'
  },
  purchase_detail: {
    name: 'Detail Purchase',
    path: '/purchase/:id'
  },
  employee: {
    name: 'Employee',
    path: '/employee'
  },
  employee_add: {
    name: 'Add Employee',
    path: '/employee/add'
  },
  employee_detail: {
    name: 'Detail Employee',
    path: '/employee/:id'
  },
  employee_edit: {
    name: 'Edit Employee',
    path: '/employee/:id/edit'
  },
  work_order: {
    name: 'Work Order',
    path: '/work-order'
  },
  work_order_add: {
    name: 'Add Work Order',
    path: '/work-order/add/:id'
  },
  work_order_detail: {
    name: 'Detail Work Order',
    path: '/work-order/:id'
  },
  delivery_order: {
    name: 'Delivery Order',
    path: '/delivery-order'
  },
  delivery_order_add: {
    name: 'Add Delivery Order',
    path: '/delivery-order/add/:id'
  },
  delivery_order_detail: {
    name: 'Detail Delivery Order',
    path: '/delivery-order/:id'
  },
  return: {
    name: 'Return',
    path: '/return'
  },
  return_detail: {
    name: 'Detail Return',
    path: '/return/:id'
  },
  upload_data: {
    name: 'Upload Data',
    path: '/upload-data'
  }
}

const common = {
  type: {
    sparepart: 'Spareparts',
    service: 'Service'
  },
  form: {
    type: {
      edit: 'Edit',
      add: 'Add',
      view: 'View'
    }
  },
  status: {
    approved: 'Approved',
    waiting: 'Waiting',
    rejected: 'Rejected',
    quotation: {
      process: 'Process',
      on_review: 'On Review',
      po: 'PO',
      cancelled: 'Cancelled',
      revised: 'Revised',
      change: 'Change'
    },
    po: {
      release: 'Release',
      prepare: 'Prepare',
      dpPaid: 'DP Paid',
      ready: 'Ready',
      done: 'Done',
      bo: 'BO'
    },
    work_order: {
      ready: 'Sparepart Ready',
      wait_on_progress: 'Wait On Progress',
      on_progress: 'On Progress',
      done: 'Done'
    },
    purchase: {
      wait_review: 'Wait for Review',
      rejected: 'Rejected',
      approved: 'Approved',
      received: 'Received'
    },
    borrow: {
      created: 'Created',
      approved: 'Approved',
      borrowed: 'Borrowed',
      returned: 'Returned',
      received: 'Received',
      done: 'Done',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    },
    sparepart_movement: {
      created: 'Created',
      send: 'Send',
      received: 'Received',
      cancelled: 'Cancelled'
    }
  },
  modal: {
    success: 'Success',
    failed: 'Failed'
  },
  role: {
    director: 'Director',
    marketing: 'Marketing',
    finance: 'Finance',
    inventory_admin: 'Inventory Admin',
    service: 'Service',
    inventory_purchase: 'Inventory Purchase',
    head_inventory: 'Head Inventory'
  },
  track: {
    po: 'Po',
    bo: 'Bo',
    pi: 'Pi',
    dp_paid: 'DP Paid',
    full_paid: 'Full Paid',
    ready: 'Ready',
    release: 'Release',
    done: 'Done',
    return: 'Return'
  },
  branch: {
    jakarta: 'Jakarta',
    semarang: 'Semarang'
  },
  sourceTypes: ['PurchaseOrder', 'Buy', 'BackOrder', 'Return', 'Borrow', 'ManualEdit', 'Import', 'SparepartMovement'],
  sourceRouteMap: {
    PurchaseOrder: 'purchase_order_detail',
    Buy: 'purchase_detail',
    BackOrder: 'back_order_detail',
    Return: 'return_detail',
    Borrow: 'borrow_detail',
    ManualEdit: 'spareparts_detail',
    Import: 'spareparts_detail',
    SparepartMovement: 'sparepart_movement_detail',
  },
}

const accessFeature = {
  director: {
    path: '/director',
    name: 'Director',
    feature: [
      'dashboard',
      'quotation',
      'purchase_order',
      'proforma_invoice',
      'invoice',
      {
        label: 'Spareparts',
        key: 'spareparts',
        feature: [
          'spareparts',
          'borrow',
          'stock_history',
          'sparepart_movement',
          'purchase'
        ]
      },
      'back_order',
      'employee',
      'work_order',
      'delivery_order',
      'general',
      'upload_data'
    ]
  },
  marketing: {
    path: '/marketing',
    name: 'Marketing',
    feature: [
      'quotation',
      'purchase_order',
      {
        label: 'Spareparts',
        key: 'spareparts',
        feature: [
          'spareparts',
          'borrow'
        ]
      }
    ]
  },
  'inventory admin': {
    path: '/inventory-admin',
    name: 'Inventory Admin',
    feature: [
      'purchase_order',
      {
        label: 'Spareparts',
        key: 'spareparts',
        feature: [
          'spareparts',
          'borrow',
          'stock_history',
          'sparepart_movement'
        ]
      },
      'back_order',
      'delivery_order'
    ]
  },
  'inventory purchase': {
    path: '/inventory-purchase',
    name: 'Inventory Purchase',
    feature: [
      {
        label: 'Spareparts',
        key: 'spareparts',
        feature: [
          'spareparts',
          'purchase'
        ]
      },
      'back_order'
    ]
  },
  'head inventory': {
    path: '/head-inventory',
    name: 'Head Inventory',
    feature: [
      'purchase_order',
      {
        label: 'Spareparts',
        key: 'spareparts',
        feature: [
          'spareparts',
          'borrow',
          'stock_history',
          'sparepart_movement',
          'purchase'
        ]
      },
      'back_order',
      'delivery_order'
    ]
  },
  finance: {
    path: '/finance',
    name: 'Finance',
    feature: [
      'quotation',
      'purchase_order',
      'proforma_invoice',
      'invoice'
    ]
  },
  service: {
    path: '/service',
    name: 'Service',
    feature: [
      'purchase_order',
      'spareparts',
      'work_order'
    ]
  }
}


const api = {
  quotation: '/api/quotation',
  proforma_invoice: '/api/proforma-invoice',
  purchase_order: '/api/purchase-order',
  back_order: '/api/back-order',
  borrow: '/api/borrow',
  stock_movement: '/api/stock-movement',
  sparepart_movement: '/api/sparepart-movement',
  invoice: '/api/invoice',
  sparepart: '/api/sparepart',
  work_order: '/api/work-order',
  employee: '/api/employee',
  purchase: '/api/buy',
  delivery_order: '/api/delivery-order',
  dashboard: '/api/dashboard',
  general: '/api/general',
  summary: '/api/summary',
  login: '/api/login',
  logout: '/api/logout',
  user: '/api/user',
  customer: '/api/customer',
  seller: '/api/seller',
}

export {
  menuMapping,
  common,
  api,
  accessFeature
}
