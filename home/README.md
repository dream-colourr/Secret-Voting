# 🎨 Secret Voting - Frontend

> **Privacy-First Voting Interface** | Seamlessly interact with encrypted blockchain votes

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Modern • Fast • Type-Safe**

</div>

---

## 🎯 What's Inside

This is the **web interface** for Secret Voting - a sleek, responsive React application that lets users create proposals, cast encrypted votes, and view results—all while maintaining complete privacy through Zama's FHE technology.

### ✨ Key Features

🔐 **Wallet-First Design** - Connect with MetaMask, Rainbow, Coinbase, and more  
🎭 **Zero-Knowledge Voting** - Cast votes that remain encrypted forever  
📊 **Real-Time Updates** - Watch proposals and participation live  
📱 **Mobile Ready** - Full functionality on any device  
⚡ **Lightning Fast** - Powered by Vite's instant HMR  
🎨 **Clean UI** - Intuitive interface, no blockchain complexity exposed

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 20+
NPM 7+
```

### Installation

```bash
# From project root, navigate to frontend
cd home

# Install dependencies
npm install

# Start development server
npm run dev
```

🎉 Open [http://localhost:5173](http://localhost:5173) in your browser!

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```
home/
│
├── public/                    # Static Assets
│   └── vite.svg              # Vite logo
│
├── src/                       # Source Code
│   ├── App.tsx               # 🎯 Main application component
│   ├── main.tsx              # 🚀 Application entry point
│   ├── index.css             # 🎨 Global styles
│   └── vite-env.d.ts         # TypeScript definitions for Vite
│
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies & scripts
├── package-lock.json          # Dependency lock file
├── README.md                  # This file
├── tsconfig.app.json          # TypeScript config (app)
├── tsconfig.json              # Base TypeScript config
├── tsconfig.node.json         # TypeScript config (Node/Vite)
└── vite.config.ts             # ⚙️ Vite configuration
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td width="33%" align="center">

### ⚛️ **React 19**
Latest React with:
- Server Components
- Actions
- Enhanced Hooks
- Automatic Batching

</td>
<td width="33%" align="center">

### 📘 **TypeScript**
Type-safe development:
- Strict mode enabled
- Full IDE support
- Catch errors early
- Better refactoring

</td>
<td width="33%" align="center">

### ⚡ **Vite 6**
Next-gen tooling:
- Instant HMR
- Lightning builds
- Optimized bundling
- Native ESM

</td>
</tr>
</table>

### Additional Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| **RainbowKit** | Beautiful wallet connection UI | Latest |
| **Wagmi** | React hooks for Ethereum | Latest |
| **Viem** | TypeScript Ethereum client | Latest |
| **Zama fhEVM SDK** | Client-side FHE encryption | Latest |
| **Ethers.js** | Ethereum interactions | 6.x |

---

## 🎮 Available Scripts

### Development

```bash
# Start dev server with hot reload
npm run dev

# Type check without building
npm run type-check
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build and preview
npm run build && npm run preview
```

### Code Quality

```bash
# Lint all files
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format with Prettier
npm run format

# Format check only
npm run format:check
```

---

## ⚙️ Configuration Deep Dive

### Vite Configuration

**`vite.config.ts`** - Optimized for React + TypeScript

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

**Key Features:**
- 🔥 Hot Module Replacement (HMR) via `@vitejs/plugin-react`
- 📦 Optimized chunking and code splitting
- 🗺️ Source maps for debugging
- ⚡ Fast Refresh for instant updates

### TypeScript Configuration

**Three-tier TypeScript setup:**

1. **`tsconfig.json`** - Base configuration
2. **`tsconfig.app.json`** - Application code settings
3. **`tsconfig.node.json`** - Build tools (Vite) settings

**Strict mode enabled** for maximum type safety:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### ESLint Configuration

**`eslint.config.js`** - Modern flat config format

**Current Setup:**
- ✅ TypeScript support
- ✅ React hooks rules
- ✅ Import sorting
- ✅ Unused variable detection

**Want stricter rules?** Enable type-aware linting:

```javascript
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 🔥 Recommended for production apps
      tseslint.configs.recommendedTypeChecked,
      
      // 🚀 Even stricter rules
      // tseslint.configs.strictTypeChecked,
      
      // 🎨 Stylistic consistency
      // tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
```

**Add React-specific rules:**

```bash
npm install -D eslint-plugin-react-x eslint-plugin-react-dom
```

```javascript
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
  },
]
```

---

## 🎨 Styling Approach

### CSS Architecture

**Custom CSS** - No framework dependencies for maximum control

```
src/
├── index.css              # Global styles & CSS variables
├── components/
│   ├── Button.css        # Component-specific styles
│   ├── Card.css
│   └── Modal.css
```

**Design System Features:**
- 🎨 CSS custom properties (variables)
- 📱 Mobile-first responsive design
- 🌓 Dark mode support (planned)
- ♿ Accessibility-first approach

**Want to use a framework?** Easy to add:

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Styled Components
npm install styled-components

# Material-UI
npm install @mui/material @emotion/react @emotion/styled
```

---

## 🔌 Blockchain Integration

### Wallet Connection

**RainbowKit** provides beautiful, customizable wallet UI:

```typescript
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiConfig } from 'wagmi'

// Supports: MetaMask, Rainbow, Coinbase, WalletConnect, and more
```

### Smart Contract Interaction

**Wagmi hooks** for type-safe contract calls:

```typescript
import { useContractWrite, useContractRead } from 'wagmi'

// Cast an encrypted vote
const { write: castVote } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'vote',
})

// Read proposal data
const { data: proposal } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'getProposal',
  args: [proposalId],
})
```

### FHE Encryption

**Zama SDK** handles client-side encryption:

```typescript
import { createInstance } from 'fhevmjs'

// Encrypt vote before sending
const encryptedVote = await encryptData(voteChoice)
await castVote(proposalId, encryptedVote)
```

---

## 🧪 Testing (Coming Soon)

### Unit Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm run test
```

### E2E Tests

```bash
npm install -D playwright
npm run test:e2e
```

---

## 🚀 Deployment

### Build & Deploy

```bash
# Build production bundle
npm run build

# Output: dist/ folder ready for deployment
```

### Hosting Options

**Static Hosting** (Recommended):
- 🟢 **Vercel** - `vercel deploy` (automatic)
- 🔵 **Netlify** - Drag & drop `dist/`
- 🟠 **Cloudflare Pages** - Git integration
- ⚫ **IPFS** - Decentralized hosting

**Environment Variables:**

Create `.env.local`:
```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
VITE_INFURA_KEY=your_key_here
```

---

## 🎯 Development Workflow

### 1. Start Development

```bash
npm run dev
```

**HMR Active** - Changes reflect instantly!

### 2. Make Changes

Edit `src/App.tsx` or any component - see updates immediately

### 3. Check Types

```bash
npm run type-check
```

### 4. Lint & Format

```bash
npm run lint:fix
npm run format
```

### 5. Build & Preview

```bash
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server (in VS Code)
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Build Failures

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

---

## 📚 Resources

### Official Documentation
- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)

### Zama FHE Resources
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [fhEVM.js SDK](https://github.com/zama-ai/fhevmjs)
- [Zama Discord](https://discord.fhe.org)

### Learning Resources
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite Awesome](https://github.com/vitejs/awesome-vite)
- [Web3 Frontend Guide](https://ethereum.org/en/developers/docs/apis/frontend/)

---

## 🤝 Contributing

Found a bug? Want to add a feature? Contributions welcome!

### Frontend-Specific Guidelines

1. **Follow the existing structure** - Keep components organized
2. **Write TypeScript** - No `any` types allowed
3. **Style consistency** - Use existing CSS patterns
4. **Test your changes** - Ensure HMR works correctly
5. **Document new features** - Update README if needed

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/your-username/SecretVote.git
cd SecretVote/home

# Create feature branch
git checkout -b feature/new-ui-component

# Make changes and test
npm run dev

# Lint and format
npm run lint:fix
npm run format

# Commit and push
git commit -m "Add new UI component"
git push origin feature/new-ui-component
```

---

## 📞 Support

**Questions?** Reach out:
- 🐦 Twitter/X: [@dreamcolourr05](https://x.com/dreamcolourr05)
- 💬 Discord: [Zama Community](https://discord.fhe.org)
- 📧 Email: support@zama.ai

**Found a bug?** [Open an issue](https://github.com/your-username/SecretVote/issues)

---

## 📄 License

BSD 3-Clause Clear License - See [LICENSE](../LICENSE) for details

---

<div align="center">

**Built with 💜 by [@dreamcolourr05](https://x.com/dreamcolourr05)**

**Powered by [Zama FHE](https://www.zama.ai/) • [React](https://react.dev/) • [Vite](https://vitejs.dev/)**

[🏠 Back to Main README](../README.md)

</div>

---

*Frontend Version 1.0.0 • Last Updated: October 2025*
