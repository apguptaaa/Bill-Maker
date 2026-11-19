# RCBGWL Tools

This repository contains the RCBGWL web tools. Each tool is an independent application in `apps/` and can be deployed on its own.

## Structure

```text
RCBGWL-tools/
└── apps/
    ├── bill-maker/
    │   ├── src/
    │   ├── public/
    │   └── package.json
    ├── cake-price-calculator/
    │   ├── src/
    │   ├── public/
    │   └── package.json
    └── review-game/
        ├── src/
        ├── public/
        └── package.json
```

## Local development

```bash
npm install
npm run dev:bill-maker
```

## Build

```bash
npm run build:bill-maker
npm run lint:bill-maker
```

## Deploy an individual tool

Each application can be deployed as a separate project from the same repository.

### Vercel

Set the Vercel project **Root Directory** to `apps/bill-maker`.

### Netlify

Set the Netlify project **Base directory** to `apps/bill-maker`.

The existing `apps/bill-maker/netlify.toml` provides the build command and publish directory.
