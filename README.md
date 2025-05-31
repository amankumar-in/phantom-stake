# 🚀 Phantom Stake

**A Next.js Crypto Staking MLM Platform with Dual Wallet System**

Phantom Stake is a comprehensive crypto staking MLM (Multi-Level Marketing) platform built with modern web technologies. The platform features a sophisticated dual-wallet system, advanced team building mechanics, and comprehensive MLM reward structures.

## ✨ Features

### 🏦 **Dual Wallet System**
- **Principal Wallet**: Locked for 6 months with automatic unlock mechanism
- **Income Wallet**: Immediate access for withdrawals
- **Real-time Balance Tracking**: Live updates with transaction history
- **Smart Fee Calculation**: 5% withdrawal fees with transparent breakdown

### 💰 **Investment & ROI Management**
- **Daily ROI**: 0.75% - 1.0% based on qualification
- **Multiple Investment Programs**: Program I-IV with progressive benefits
- **Auto-compounding Options**: Smart reinvestment capabilities
- **Lock Period Management**: Automated principal unlock after 6 months

### 👥 **MLM & Team Building**
- **Binary Team Structure**: Left/Right team volume tracking
- **Referral Commission**: 10% direct referral rewards
- **Matching Bonus System**: Volume-based team rewards
- **Rank Progression**: Bronze → Silver → Gold → Diamond → Ruby
- **Milestone Rewards**: Progressive rewards with luxury prizes

### 🎯 **Advanced Features**
- **Smart Dashboard**: Real-time analytics and projections
- **Transaction History**: Comprehensive audit trail
- **Mobile-Responsive**: Optimized for all devices
- **Testing Tools**: Dummy deposit/withdrawal for development
- **Security First**: JWT authentication, bcrypt encryption

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Magic UI**: Premium component library

### **Backend**
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: ODM for MongoDB
- **JWT**: Secure authentication
- **bcrypt**: Password hashing

### **Security & Performance**
- **Rate Limiting**: API protection
- **CORS**: Cross-origin security
- **Helmet**: Security headers
- **Input Validation**: Data sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/phantom-stake.git
cd phantom-stake
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend server
npm run dev
```

### 4. Environment Configuration

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5100/api
```

#### Backend (.env)
```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=phantomstake

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server
PORT=5100
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
phantom-stake/
├── 📂 backend/                 # Backend API
│   ├── 📂 src/
│   │   ├── 📂 controllers/     # Route controllers
│   │   ├── 📂 middleware/      # Custom middleware
│   │   ├── 📂 models/         # Database models
│   │   ├── 📂 routes/         # API routes
│   │   └── server.js          # Server entry point
│   └── package.json
│
├── 📂 src/                     # Frontend source
│   ├── 📂 app/                # Next.js app directory
│   │   ├── 📂 dashboard/      # Dashboard pages
│   │   ├── 📂 login/          # Authentication
│   │   └── layout.tsx         # Root layout
│   ├── 📂 components/         # React components
│   │   └── 📂 ui/            # UI components
│   ├── 📂 contexts/           # React contexts
│   └── 📂 lib/               # Utilities
│
├── 📂 public/                  # Static assets
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify-token` - Verify JWT token

### **Dashboard**
- `GET /api/dashboard` - Dashboard overview
- `POST /api/dashboard/invest` - Create investment
- `POST /api/dashboard/withdraw` - Process withdrawal

### **Wallet Management**
- `GET /api/wallet/overview` - Wallet balances
- `GET /api/wallet/stats` - Detailed statistics
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/dummy-deposit` - Test deposit (dev)
- `POST /api/wallet/dummy-income` - Test income (dev)
- `POST /api/wallet/withdraw-income` - Income withdrawal
- `POST /api/wallet/withdraw-principal` - Principal withdrawal

## 💎 Core Features Deep Dive

### **Dual Wallet System**
The platform implements a sophisticated dual-wallet architecture:

- **Principal Wallet**: Stores initial deposits, locked for 6 months to ensure program stability
- **Income Wallet**: Accumulates daily ROI and referral commissions, immediately withdrawable
- **Smart Lock Management**: Automatic unlock after 6-month period with seamless user experience

### **MLM Reward Structure**
Comprehensive multi-level marketing system with:

- **Direct Referrals**: 10% commission on direct referral investments
- **Matching Bonus**: Binary team volume matching (5-10% based on rank)
- **Level Overrides**: Deep-level commissions for qualified leaders
- **Leadership Pools**: Monthly profit sharing for top performers
- **Milestone Rewards**: Progressive rewards including luxury items and cash bonuses

### **Team Building & Binary System**
Advanced binary tree structure with:

- **Left/Right Volume Tracking**: Real-time team volume calculations
- **Pair Generation**: Automatic pair counting for bonus qualification
- **Volume Balancing**: Encourages balanced team development
- **30-Day Volume Windows**: Fresh volume tracking for active engagement

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: bcrypt with salt rounds
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Cross-origin request security
- **Environment Isolation**: Secure environment variable management

## 🧪 Testing & Development

### **Testing Tools Built-in**
- **Dummy Deposits**: Test principal wallet funding
- **Dummy Income**: Simulate ROI earnings
- **Transaction Simulation**: Test withdrawal flows
- **Real-time Balance Updates**: Live data synchronization

### **Development Commands**
```bash
# Frontend development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Code linting

# Backend development
cd backend
npm run dev          # Start with nodemon
npm start           # Production start
```

## 📊 Database Schema

### **User Model Features**
- **Comprehensive Profile**: Full user information with KYC fields
- **Dual Wallet Structure**: Separate principal/income tracking
- **Transaction History**: Complete audit trail
- **MLM Hierarchy**: Referral trees and team structures
- **Rank Progression**: Automated rank calculations
- **Security Fields**: Encrypted passwords, session management

### **Transaction Tracking**
- **Type Classification**: Deposits, withdrawals, commissions, bonuses
- **Wallet Association**: Principal vs income wallet transactions
- **Status Management**: Pending, completed, failed states
- **Metadata Storage**: Descriptions, related users, blockchain hashes

## 🌟 Future Enhancements

### **Phase II - Blockchain Integration**
- **Smart Contract Deployment**: Ethereum/BSC integration
- **Real Crypto Transactions**: Replace dummy operations
- **Staking Pools**: Actual cryptocurrency staking
- **DeFi Integration**: Yield farming opportunities

### **Phase III - Advanced Features**
- **Multi-Currency Support**: Bitcoin, Ethereum, USDT
- **Advanced Analytics**: AI-powered insights
- **Mobile Applications**: Native iOS/Android apps
- **API Marketplace**: Third-party integrations

### **Phase IV - Global Expansion**
- **Multi-Language Support**: Internationalization
- **Regional Compliance**: KYC/AML integration
- **Payment Gateways**: Fiat on/off ramps
- **Institutional Features**: White-label solutions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/phantom-stake/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/phantom-stake/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/phantom-stake/discussions)

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Magic UI**: For beautiful component library
- **MongoDB**: For robust database solutions
- **Vercel**: For hosting and deployment platform

---

<div align="center">

**Built with ❤️ for the future of decentralized finance**

[⭐ Star this repo](https://github.com/yourusername/phantom-stake) • [🐛 Report Bug](https://github.com/yourusername/phantom-stake/issues) • [💡 Request Feature](https://github.com/yourusername/phantom-stake/issues)

</div>
