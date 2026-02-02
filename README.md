# 🌟 StellarAid  
A blockchain-based crowdfunding platform built on the **Stellar Network** for transparent, borderless, and secure fundraising.

StellarAid enables project creators to raise funds in **XLM** or any Stellar-based asset (USDC, NGNT, custom tokens), while donors can contribute with full on-chain transparency.

# Folder structure 
```bash
/src
  /app
    /auth
    /dashboard
    /projects
    /admin
  /components
  /services
    api.ts
    stellar.ts
  /hooks
  /utils
  /types
  /store
```
## 📌 Features

### 🎯 For Donors
- Discover global fundraising campaigns  
- Donate in XLM or Stellar assets  
- Wallet integration (Freighter, Albedo, Lobstr)  
- On-chain transparency: verify all transactions  

### 🎯 For Creators
- Create social impact projects  
- Accept multi-asset contributions  
- Real-time donation tracking  
- Withdraw funds directly on-chain  

### 🎯 For Admins
- Campaign approval workflow  
- User & KYC management  
- Analytics dashboard  

## 🏗️ Architecture Overview

StellarAid Frontend is built with: 
- Next.js 14  
- TailwindCSS  
- Stellar JavaScript SDK  
- Zustand (state management)
  
# 📌 How to Contribute

### 1. Fork the Repository
Click the **“Fork”** button in the top‑right of the GitHub repo and clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/stellaraid.git
cd stellaraid
````
### 2. Create a Branch
````bash
git checkout -b feature/add-donation-flow
````

### 3. Commit Messages
Use conventional commits:
````bash
feat: add wallet connection modal
fix: resolve donation API error
docs: update project README
refactor: clean up project creation form
````
### 4. Submitting a Pull Request (PR)
Push your branch:
```bash
git push origin feature/add-donation-flow
```
Open a Pull Request from your fork back to the main branch.

# 📜 License
MIT License — free to use, modify, and distribute.
