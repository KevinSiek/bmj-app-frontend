const menuMapping = {
  menu: {
    name: 'Menu',
    path: '/menu'
  },
  menu_director: {
    name: 'Menu Director',
    path: '/menu/director'
  },
  menu_sales: {
    name: 'Menu Sales',
    path: '/menu/sales'
  },
  menu_inventory: {
    name: 'Menu Inventory',
    path: '/menu/inventory'
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
    path: '/purchase-order/:id/return'
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
  back_order: {
    name: 'Back Order',
    path: '/back-order'
  },
  back_order_detail: {
    name: 'Detail Back Order',
    path: '/back-order/:id'
  },
  purchase: {
    name: 'Purchase',
    path: '/purchase'
  },
  purchase_add: {
    name: 'Add Purchase',
    path: '/purchase/add'
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
      revised: 'Revised'
    },
    po: {
      release: 'Release',
      prepare: 'Prepare',
      dpPaid: 'DP Paid',
      ready: 'Ready',
      done: 'done',
      bo: 'BO'
    },
    work_order: {
      ready: 'Sparepart Ready',
      on_progress: 'On Progress',
      done: 'Done'
    },
    purchase: {
      wait_review: 'Wait for Review',
      rejected: 'Rejected',
      approved: 'Approved'
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
    inventory: 'Inventory',
    service: 'Service'
  },
  track: {
    po: 'Po',
    pi: 'Pi',
    dp_paid: 'DP Paid',
    full_paid: 'Full Paid',
    ready: 'Ready',
    release: 'Release',
    done: 'Done',
    return: 'Return'
  }
}

const api = {
  quotation: '/api/quotation',
  proforma_invoice: '/api/proforma-invoice',
  purchase_order: '/api/purchase-order',
  back_order: '/api/back-order',
  invoice: '/api/invoice',
  sparepart: '/api/sparepart',
  work_order: '/api/work-order',
  employee: '/api/employee',
  purchase: '/api/buy',
  delivery_order: '/api/delivery-order'
}

export {
  menuMapping,
  common,
  api
}
