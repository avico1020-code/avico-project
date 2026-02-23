# Web App Commands

**Tech Stack:** Next.js 15 + React 19 + Clerk Auth + Convex Database + Tailwind CSS

> **Note:** This project uses **bun** instead of npm. Replace `npm` with `bun` in all commands.

## Install the dependencies needed to run the app
```bash
bun install
```

## Development (runs the app locally)
```bash
bun dev
```
Don't forget to open the app in your browser with the link shown in the terminal with ctrl/cmd + click on the link
That opens the app at `http://localhost:3000`

## Sync Convex Database
```bash
bunx convex dev
```
Updates database with functions in `/convex` folder. Run this when you modify Convex functions.

## Build for Production
```bash
bun build
```

## Run Production Build
```bash
bun start
```

## Code Quality Commands

### Lint Code (Check for linting issues only)
```bash
bun lint
```

### Format Code (Auto-format code)
```bash
bun format
```

### Check Code (Lint + Format check)
```bash
bun check
```

### Fix Issues (Auto-fix linting and formatting)
```bash
bun check:fix
```

## Common Issues

**Port already in use?**
- Stop other apps using port 3000, or the dev command will suggest an alternative port

**Environment variables missing?**
- Copy `.env.local` and add your Clerk and Convex keys
