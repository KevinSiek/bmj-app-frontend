import { createRouter, createWebHistory } from 'vue-router'
import { menuMapping as menuConfig } from '@/config'

const HomePage = () => import('@/views/HomePage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const MenuPage = () => import('@/views/MenuPage.vue')
const MainMenuPage = () => import('@/views/role/MainMenu.vue')
const MenuDirectorPage = () => import('@/views/role/DirectorMenu.vue')
const MenuSalesPage = () => import('@/views/role/SalesMenu.vue')
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
const PurchaseDetailPage = () => import('@/views/menu/PurchaseDetailPage.vue')
const ProformaInvoicePage = () => import('@/views/menu/ProformaInvoicePage.vue')
const ProformaInvoiceDetailPage = () => import('@/views/menu/ProformaInvoiceDetailPage.vue')
const PurchaseOrderPage = () => import('@/views/menu/PurchaseOrderPage.vue')
const PurchaseOrderDetailPage = () => import('@/views/menu/PurchaseOrderDetailPage.vue')
const WorkOrderPage = () => import('@/views/menu/WorkOrderPage.vue')
const WorkOrderDetailPage = () => import('@/views/menu/WorkOrderDetailPage.vue')
const SparepartsPage = () => import('@/views/menu/SparepartsPage.vue')
const SparepartsAddPage = () => import('@/views/menu/SparepartsAddPage.vue')
const SparepartsDetailPage = () => import('@/views/menu/SparepartsDetailPage.vue')
const EmployeePage = () => import('@/views/menu/EmployeePage.vue')
const EmployeeDetailPage = () => import('@/views/menu/EmployeeDetailPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "active",
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/menu',
      name: 'Menu',
      component: MenuPage,
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
          path: menuConfig.menu_sales.path,
          name: menuConfig.menu_sales.name,
          component: MenuSalesPage
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
      children: [
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
              path: menuConfig.purchase_detail.path,
              name: menuConfig.purchase_detail.name,
              component: PurchaseDetailPage,
              meta: {
                useBack: true,
                useTrack: true
              }
            },
          ]
        },
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
          ]
        },
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
            }
          ]
        },
        {
          path: menuConfig.employee.path,
          children: [
            {
              path: '',
              name: menuConfig.employee.name,
              component: EmployeePage
            },
            {
              path: menuConfig.employee_detail.path,
              name: menuConfig.employee_detail.name,
              component: EmployeeDetailPage,
              meta: {
                useBack: true
              }
            },
          ]
        },
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
          ]
        },
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
            }
          ]
        }
      ]
    }
  ],
})

export default router
