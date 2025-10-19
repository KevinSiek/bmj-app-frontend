import { createRouter, createWebHistory } from 'vue-router'
import { menuMapping as menuConfig } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/utils/local-storage'

const HomePage = () => import('@/views/HomePage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const MenuPage = () => import('@/views/MenuPage.vue')
const MainMenuPage = () => import('@/views/role/MainMenu.vue')
const MenuDirectorPage = () => import('@/views/role/DirectorMenu.vue')
const MenuMarketingPage = () => import('@/views/role/MarketingMenu.vue')
const MenuServicePage = () => import('@/views/role/ServiceMenu.vue')
const MenuInventoryPage = () => import('@/views/role/InventoryMenu.vue')
const MenuFinancePage = () => import('@/views/role/FinanceMenu.vue')
const ProfilePage = () => import('@/views/menu/ProfilePage.vue')
const DashboardPage = () => import('@/views/menu/DashboardPage.vue')
const QuotationPage = () => import('@/views/menu/QuotationPage.vue')
const QuotationAddPage = () => import('@/views/menu/QuotationAddPage.vue')
const QuotationEditPage = () => import('@/views/menu/QuotationEditPage.vue')
const QuotationReviewPage = () => import('@/views/menu/QuotationReviewPage.vue')
const QuotationReviewDetailPage = () => import('@/views/menu/QuotationReviewDetailPage.vue')
const QuotationDetailPage = () => import('@/views/menu/QuotationDetailPage.vue')
const InvoicePage = () => import('@/views/menu/InvoicePage.vue')
const InvoiceDetailPage = () => import('@/views/menu/InvoiceDetailPage.vue')
const BackOrderPage = () => import('@/views/menu/BackOrderPage.vue')
const BackOrderDetailPage = () => import('@/views/menu/BackOrderDetailPage.vue')
const PurchasePage = () => import('@/views/menu/PurchasePage.vue')
const PurchaseAddPage = () => import('@/views/menu/PurchaseAddPage.vue')
const PurchaseEditPage = () => import('@/views/menu/PurchaseEditPage.vue')
const PurchaseReviewPage = () => import('@/views/menu/PurchaseReviewPage.vue')
const PurchaseReviewDetailPage = () => import('@/views/menu/PurchaseReviewDetailPage.vue')
const PurchaseDetailPage = () => import('@/views/menu/PurchaseDetailPage.vue')
const ProformaInvoicePage = () => import('@/views/menu/ProformaInvoicePage.vue')
const ProformaInvoiceDetailPage = () => import('@/views/menu/ProformaInvoiceDetailPage.vue')
const ProformaInvoiceEditPage = () => import('@/views/menu/ProformaInvoiceEditPage.vue')
const PurchaseOrderPage = () => import('@/views/menu/PurchaseOrderPage.vue')
const PurchaseOrderReturnPage = () => import('@/views/menu/PurchaseOrderReturnPage.vue')
const PurchaseOrderDetailPage = () => import('@/views/menu/PurchaseOrderDetailPage.vue')
const WorkOrderPage = () => import('@/views/menu/WorkOrderPage.vue')
const WorkOrderAddPage = () => import('@/views/menu/WorkOrderAddPage.vue')
const WorkOrderDetailPage = () => import('@/views/menu/WorkOrderDetailPage.vue')
const SparepartsPage = () => import('@/views/menu/SparepartsPage.vue')
const SparepartsAddPage = () => import('@/views/menu/SparepartsAddPage.vue')
const SparepartsDetailPage = () => import('@/views/menu/SparepartsDetailPage.vue')
const SparepartsEditPage = () => import('@/views/menu/SparepartsEditPage.vue')
const EmployeePage = () => import('@/views/menu/EmployeePage.vue')
const EmployeeAddPage = () => import('@/views/menu/EmployeeAddPage.vue')
const EmployeeDetailPage = () => import('@/views/menu/EmployeeDetailPage.vue')
const EmployeeEditPage = () => import('@/views/menu/EmployeeEditPage.vue')
const DeliveryOrderPage = () => import('@/views/menu/DeliveryOrderPage.vue')
const DeliveryOrderAddPage = () => import('@/views/menu/DeliveryOrderAddPage.vue')
const DeliveryOrderDetailPage = () => import('@/views/menu/DeliveryOrderDetailPage.vue')
const ReturnPage = () => import('@/views/menu/ReturnPage.vue')
const ReturnDetailPage = () => import('@/views/menu/ReturnDetailPage.vue')
const GeneralPage = () => import('@/views/menu/GeneralPage.vue')
const UploadDataPage = () => import('@/views/menu/UploadDataPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "active",
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {
        authPage: true
      },
    },
    {
      path: '/menu',
      name: 'Menu',
      component: MenuPage,
      meta: {
        requireAuth: true
      },
      children: [
        {
          path: '',
          name: 'Main',
          component: MainMenuPage
        },
        {
          path: menuConfig.menu_director.path,
          name: menuConfig.menu_director.name,
          component: MenuDirectorPage
        },
        {
          path: menuConfig.menu_marketing.path,
          name: menuConfig.menu_marketing.name,
          component: MenuMarketingPage
        },
        {
          path: menuConfig.menu_finance.path,
          name: menuConfig.menu_finance.name,
          component: MenuFinancePage
        },
        {
          path: menuConfig.menu_service.path,
          name: menuConfig.menu_service.name,
          component: MenuServicePage
        },
        {
          path: menuConfig.menu_inventory.path,
          name: menuConfig.menu_inventory.name,
          component: MenuInventoryPage
        },
      ]
    },
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: {
        requireAuth: true,
      },
      children: [
        {
          path: menuConfig.general.path,
          name: menuConfig.general.name,
          component: GeneralPage
        },
        {
          path: menuConfig.profile.path,
          name: menuConfig.profile.name,
          component: ProfilePage
        },
        {
          path: menuConfig.dashboard.path,
          name: menuConfig.dashboard.name,
          component: DashboardPage
        },
        {
          path: menuConfig.upload_data.path,
          name: menuConfig.upload_data.name,
          component: UploadDataPage
        },
        // Quotation
        {
          path: menuConfig.quotation.path,
          children: [
            {
              path: '',
              name: menuConfig.quotation.name,
              component: QuotationPage,
            },
            {
              path: menuConfig.quotation_add.path,
              name: menuConfig.quotation_add.name,
              component: QuotationAddPage,
              meta: {
                useBack: true,
              }
            },
            {
              path: menuConfig.quotation_edit.path,
              name: menuConfig.quotation_edit.name,
              component: QuotationEditPage,
              meta: {
                useBack: true,
              }
            },
            {
              path: menuConfig.quotation_review.path,
              name: menuConfig.quotation_review.name,
              component: QuotationReviewPage,
              meta: {
                useBack: true,
              }
            },
            {
              path: menuConfig.quotation_detail.path,
              name: menuConfig.quotation_detail.name,
              component: QuotationDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
            {
              path: menuConfig.quotation_review_detail.path,
              name: menuConfig.quotation_review_detail.name,
              component: QuotationReviewDetailPage,
              meta: {
                useBack: true
              }
            },
          ]
        },
        // Invoice
        {
          path: menuConfig.invoice.path,
          children: [
            {
              path: '',
              name: menuConfig.invoice.name,
              component: InvoicePage
            },
            {
              path: menuConfig.invoice_detail.path,
              name: menuConfig.invoice_detail.name,
              component: InvoiceDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
          ]
        },
        // Back Order
        {
          path: menuConfig.back_order.path,
          children: [
            {
              path: '',
              name: menuConfig.back_order.name,
              component: BackOrderPage
            },
            {
              path: menuConfig.back_order_detail.path,
              name: menuConfig.back_order_detail.name,
              component: BackOrderDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
          ]
        },
        // Purchase
        {
          path: menuConfig.purchase.path,
          children: [
            {
              path: '',
              name: menuConfig.purchase.name,
              component: PurchasePage
            },
            {
              path: menuConfig.purchase_add.path,
              name: menuConfig.purchase_add.name,
              component: PurchaseAddPage,
              meta: {
                useBack: true,
                useTrack: false
              }
            },
             {
              path: menuConfig.purchase_edit.path,
              name: menuConfig.purchase_edit.name,
              component: PurchaseEditPage,
              meta: {
                useBack: true,
                useTrack: false
              }
            },
            {
              path: menuConfig.purchase_review.path,
              name: menuConfig.purchase_review.name,
              component: PurchaseReviewPage,
              meta: {
                useBack: true,
                useTrack: false
              }
            },
            {
              path: menuConfig.purchase_detail.path,
              name: menuConfig.purchase_detail.name,
              component: PurchaseDetailPage,
              meta: {
                useBack: true,
                useTrack: false
              }
            },
            {
              path: menuConfig.purchase_review_detail.path,
              name: menuConfig.purchase_review_detail.name,
              component: PurchaseReviewDetailPage,
              meta: {
                useBack: true,
                useTrack: false
              }
            },
          ]
        },
        // Work Order
        {
          path: menuConfig.work_order.path,
          children: [
            {
              path: '',
              name: menuConfig.work_order.name,
              component: WorkOrderPage
            },
            {
              path: menuConfig.work_order_detail.path,
              name: menuConfig.work_order_detail.name,
              component: WorkOrderDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
            {
              path: menuConfig.work_order_add.path,
              name: menuConfig.work_order_add.name,
              component: WorkOrderAddPage
            },
          ]
        },
        // Spareparts
        {
          path: menuConfig.spareparts.path,
          children: [
            {
              path: '',
              name: menuConfig.spareparts.name,
              component: SparepartsPage
            },
            {
              path: menuConfig.spareparts_add.path,
              name: menuConfig.spareparts_add.name,
              component: SparepartsAddPage,
              meta: {
                useBack: true
              }
            },
            {
              path: menuConfig.spareparts_detail.path,
              name: menuConfig.spareparts_detail.name,
              component: SparepartsDetailPage,
              meta: {
                useBack: true
              }
            },
            {
              path: menuConfig.spareparts_edit.path,
              name: menuConfig.spareparts_edit.name,
              component: SparepartsEditPage,
              meta: {
                useBack: true
              }
            }
          ]
        },
        // Employee
        {
          path: menuConfig.employee.path,
          children: [
            {
              path: '',
              name: menuConfig.employee.name,
              component: EmployeePage
            },
            {
              path: menuConfig.employee_add.path,
              name: menuConfig.employee_add.name,
              component: EmployeeAddPage,
              meta: {
                useBack: true
              }
            },
            {
              path: menuConfig.employee_detail.path,
              name: menuConfig.employee_detail.name,
              component: EmployeeDetailPage,
              meta: {
                useBack: true
              }
            },
            {
              path: menuConfig.employee_edit.path,
              name: menuConfig.employee_edit.name,
              component: EmployeeEditPage,
              meta: {
                useBack: true
              }
            },
          ]
        },
        // Proforma Invoice
        {
          path: menuConfig.proforma_invoice.path,
          children: [
            {
              path: '',
              name: menuConfig.proforma_invoice.name,
              component: ProformaInvoicePage
            },
            {
              path: menuConfig.proforma_invoice_detail.path,
              name: menuConfig.proforma_invoice_detail.name,
              component: ProformaInvoiceDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
            {
              path: menuConfig.proforma_invoice_edit.path,
              name: menuConfig.proforma_invoice_edit.name,
              component: ProformaInvoiceEditPage,
              meta: {
                useBack: true
              }
            },
          ]
        },
        // Purchase Order
        {
          path: menuConfig.purchase_order.path,
          children: [
            {
              path: '',
              name: menuConfig.purchase_order.name,
              component: PurchaseOrderPage
            },
            {
              path: menuConfig.purchase_order_detail.path,
              name: menuConfig.purchase_order_detail.name,
              component: PurchaseOrderDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
            {
              path: menuConfig.purchase_order_return.path,
              name: menuConfig.purchase_order_return.name,
              component: PurchaseOrderReturnPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            }
          ]
        },
        // Return
        {
          path: menuConfig.return.path,
          children: [
            {
              path: '',
              name: menuConfig.return.name,
              component: ReturnPage
            },
            {
              path: menuConfig.return_detail.path,
              name: menuConfig.return_detail.name,
              component: ReturnDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            }
          ]
        },
        // Delivery Order
        {
          path: menuConfig.delivery_order.path,
          children: [
            {
              path: '',
              name: menuConfig.delivery_order.name,
              component: DeliveryOrderPage
            },
            {
              path: menuConfig.delivery_order_detail.path,
              name: menuConfig.delivery_order_detail.name,
              component: DeliveryOrderDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
            {
              path: menuConfig.delivery_order_add.path,
              name: menuConfig.delivery_order_add.name,
              component: DeliveryOrderAddPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            }
          ]
        }
      ]
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = getToken('token-bmj')

  if (token && !authStore.user) {
    await authStore.getUser()
  }

  if(to.meta.requireAuth){
    if(authStore.authenticated){
      next()
    }
    else {
      next('/login')
    }
  }
  else{
    if(to.meta.authPage){
      if(!authStore.authenticated) {
        next()
      }
      else{
        next(from)
      }
    }
    else{
      next()
    }
  }
})

export default router
