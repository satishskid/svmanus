# 🚀 Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/satishskid/svmanus.git
cd svmanus
```

### 2️⃣ Install Dependencies

```bash
pnpm install
```

### 3️⃣ Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** in your browser! 🎉

---

## 📦 Build for Production

```bash
pnpm build
pnpm preview
```

---

## 🌐 Deploy

### Netlify
```bash
netlify deploy --prod
```

### Vercel
```bash
vercel --prod
```

---

## 🔧 Common Tasks

### Run Tests
```bash
pnpm test
```

### Check Types
```bash
pnpm type-check
```

### Format Code
```bash
pnpm format
```

### Lint Code
```bash
pnpm lint:fix
```

---

## 📚 Documentation

- Full documentation: See [README.md](./README.md)
- Deployment guide: See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)

---

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm dev -- --port 3001
```

### Dependencies not installing?
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build failing?
```bash
# Check TypeScript errors
pnpm type-check

# Check for linting issues
pnpm lint
```

---

**Happy Coding! 🎨**
