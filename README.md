# Garage Inventory Management System

A comprehensive web application for managing automotive garage inventory, parts tracking, supplier management, and work orders.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Staff)
  - Secure password hashing with bcrypt

- **Inventory Management**
  - CRUD operations for parts
  - Stock level tracking with min/max thresholds
  - Low stock alerts
  - Inventory value calculation

- **Supplier Management**
  - Supplier CRUD operations
  - Supplier ratings
  - Contact information management

- **Category Management**
  - Hierarchical categories
  - Part categorization

- **Transaction Tracking**
  - Purchase, sale, return, adjustment, and transfer transactions
  - Complete audit trail
  - User attribution for all changes

- **Work Order Management**
  - Create and manage work orders
  - Track parts used in work orders
  - Status tracking (pending, in-progress, completed, cancelled)
  - Priority management

- **Reporting**
  - Dashboard with key metrics
  - Low stock alerts
  - Inventory value summary

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Vanilla JavaScript with ES Modules
- **CSS**: Custom CSS with responsive design
- **API Integration**: Fetch API

### Database Schema
The database includes:
- Users management
- Parts inventory
- Suppliers
- Categories (hierarchical)
- Inventory transactions (audit trail)
- Work orders
- Work order parts

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/garage-inventory-system.git
cd garage-inventory-system
