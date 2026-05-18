# Wagxa [2.0] - Deployment Guide

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (or `npm install`)

### 3. Deploy

Click "Deploy" and wait for the build to complete!

## Important Files Added for Vercel

- ✅ `index.html` - Main HTML entry point
- ✅ `src/main.tsx` - React app entry point
- ✅ `vercel.json` - SPA routing configuration
- ✅ Updated `package.json` - Added proper scripts and dependencies

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Common Issues & Fixes

### Issue: Build fails with "Cannot find module 'react'"
**Fix**: Make sure React is in dependencies (not peerDependencies)

### Issue: Routes not working (404 on refresh)
**Fix**: `vercel.json` handles SPA routing - it's already configured

### Issue: Styles not loading
**Fix**: Check that `src/styles/index.css` exists and is imported in `main.tsx`

## Project Structure

```
wagxa/
├── index.html          # Entry HTML file
├── vercel.json         # Vercel SPA config
├── package.json        # Dependencies & scripts
├── vite.config.ts      # Vite configuration
├── src/
│   ├── main.tsx        # React entry point
│   ├── app/
│   │   ├── App.tsx     # Main App component
│   │   ├── routes.tsx  # React Router config
│   │   └── ...
│   └── styles/
│       └── index.css   # Global styles
└── ...
```

## Environment Variables (Optional)

If you need environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add variables like:
   - `VITE_API_URL=https://api.example.com`
3. Redeploy

Access in code: `import.meta.env.VITE_API_URL`

## Support

For Vercel deployment issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
