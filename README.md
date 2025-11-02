# BMJ Business Management System - Frontend

> **Production-Ready Vue.js 3 Business Management Application**

A comprehensive business management system built with Vue.js 3, featuring real-time analytics, multi-module workflows, and role-based access control.

## 🎆 Features Overview

### 📊 Executive Dashboard
- **Real-time Analytics**: Revenue tracking, pipeline metrics, conversion rates
- **Multi-Branch Support**: Jakarta and Semarang operations
- **KPI Monitoring**: Quote-to-PO conversion, cash collection, profit margins
- **Operations Overview**: Pending quotations, purchase orders, inventory alerts

### 🏢 Business Modules

#### 💼 Sales & Marketing
- **Quotation System**: Create, manage, and track quotations with customer details
- **Purchase Orders**: Convert quotations to purchase orders with workflow tracking
- **Customer Management**: Complete customer information and history

#### 📦 Inventory Management
- **Spareparts Tracking**: Multi-location inventory with low stock alerts
- **Purchase Management**: Procurement workflows with supplier management
- **Back Order System**: Supply chain management and order tracking

#### 💰 Financial Management
- **Invoice System**: Standard and proforma invoice generation
- **Payment Tracking**: DP payments, full payments, receivables aging
- **Revenue Analytics**: Branch-wise revenue and profit analysis

#### 🔧 Service Operations
- **Work Order Management**: Service request tracking and progress monitoring
- **Delivery Orders**: Shipment tracking and logistics management

#### 👥 Administration
- **Employee Management**: User roles and branch assignments
- **Data Import**: Excel file upload for price lists and bulk data
- **System Settings**: Currency, discount rates, VAT configuration

### 🔐 Authentication & Security
- **Role-Based Access**: Director, Marketing, Finance, Inventory, Service roles
- **Branch Security**: Location-based data access control
- **Session Management**: Secure authentication with Laravel backend

### 🎨 Technical Architecture
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Bootstrap 5 + Tailwind CSS for responsive design
- **State Management**: Pinia for centralized state management
- **Charts**: Chart.js for data visualization
- **HTTP Client**: Axios for API communication
- **File Processing**: PDF generation and Excel export capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Laravel backend running on `http://localhost:8000`

### Installation

```bash
# Clone the repository
git clone https://github.com/KevinSiek/bmj-app-frontend.git
cd bmj-app-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

Ensure your API base URL is configured correctly in your Axios configuration to connect to the Laravel backend at `http://localhost:8000`.

## 💻 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── components/     # Reusable Vue components
├── views/          # Page components
├── stores/         # Pinia stores
├── router/         # Vue Router configuration
├── assets/         # Static assets
└── utils/          # Utility functions
```

## 🎯 User Roles & Permissions

| Role | Dashboard | Quotation | Purchase | Inventory | Finance | Service | Admin |
|------|-----------|-----------|----------|-----------|---------|---------|-------|
| **Director** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Marketing** | × | ✓ | ✓ | × | × | × | × |
| **Finance** | × | ✓ | ✓ | × | ✓ | × | × |
| **Inventory** | × | × | ✓ | ✓ | × | × | × |
| **Service** | × | × | ✓ | × | × | ✓ | × |

## 🌍 Branch Operations

- **Jakarta Branch**: Independent operations and inventory
- **Semarang Branch**: Separate business unit with local data
- **Multi-Branch**: Director role can access cross-branch analytics

## 📈 Analytics & Reporting

- **Revenue Tracking**: Real-time revenue and pipeline analysis
- **Conversion Metrics**: Quote-to-PO conversion rates
- **Inventory Alerts**: Low stock notifications across branches
- **Team Performance**: Sales leaderboards and performance metrics
- **Financial Reports**: Receivables aging and cash flow analysis

## 🔗 API Integration

This frontend integrates with the Laravel backend API:
- **Base URL**: `http://localhost:8000`
- **Authentication**: Token-based authentication
- **Real-time Data**: Live dashboard updates
- **File Upload**: Excel import functionality

## 🛠️ Technology Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Bootstrap 5** - CSS framework for responsive design
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - Vue.js state management
- **Vue Router 4** - Official router for Vue.js
- **Axios** - HTTP client for API requests
- **Chart.js** - Chart and graph library
- **PDFMake** - PDF generation
- **XLSX** - Excel file processing

## 🏆 Production Ready

This application is production-ready with:
- ✅ Real-time business analytics
- ✅ Multi-user role management
- ✅ Multi-branch operations
- ✅ Complete business workflows
- ✅ Professional UI/UX
- ✅ Full backend integration

## 👥 Demo Credentials

```
Email: director.jkt@bmj.com
Password: password
Role: Director (Full Access)
```

## 🔗 Related Repositories

- **Backend API**: https://github.com/KevinSiek/bmj-app-backend
- **Documentation**: https://linear.app/b-kawan/project/bmj-project-8d0e08f45db9

## 📄 License

Private - BMJ Business Management System

---

**Built with ♥️ using Vue.js 3 + Laravel**