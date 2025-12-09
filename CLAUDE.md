# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend application using React 19, TypeScript, and Tailwind CSS v4. The project follows Next.js App Router architecture.

## Development Guidelines

### Package Manager
- **Use Bun** for all package management and script execution (not npm/yarn/pnpm)

### Responsive Design Requirements
- **Use dynamic, viewport-based sizing** that automatically adapts to any screen size
- **Avoid fixed breakpoints** - components should fluidly adapt to available space
- **Preferred approaches:**
  - ✅ Viewport units: `vh` (viewport height), `vw` (viewport width), `dvh` (dynamic viewport height)
  - ✅ Percentage-based sizing: `w-[90%]`, `h-[80vh]`, etc.
  - ✅ Fluid typography with `clamp()`: `text-[clamp(1rem,2vw,1.5rem)]`
  - ✅ Flexible spacing: `p-[2vw]`, `gap-[1.5vh]`, `m-[3%]`
  - ✅ Dynamic calculations: `w-[calc(100vw-2rem)]`
  - ❌ Avoid: Fixed breakpoints like `sm:`, `md:`, `lg:`, `min-[640px]:`, etc.
- **Example:** Instead of `text-sm md:text-base lg:text-lg`, use `text-[clamp(0.875rem,1.5vw,1.125rem)]`
- This ensures components automatically adapt to the actual available screen dimensions

### Component Architecture
- **Always create reusable components** - avoid duplicating code
- Extract repeated UI patterns into shared components
- Components should accept props to customize behavior and appearance
- Keep components modular and composable

### Styling
- **Use Tailwind CSS exclusively** for styling
- Leverage Tailwind's utility classes for responsive design
- Use the custom theme variables defined in `globals.css`

## Development Commands

### Running the Application
- `bun dev` - Start development server at http://localhost:3000
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run lint` - Run ESLint
- `bun install` - Install dependencies

## Architecture

### Next.js App Router Structure
- Uses the `app/` directory for routing (not `pages/`)
- `app/layout.tsx` - Root layout with Geist fonts (sans and mono variants)
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind CSS v4 theme configuration

### Styling Approach
- **Tailwind CSS v4**: Uses the new `@tailwindcss/postcss` plugin (no separate config file)
- **CSS Theme System**: Custom properties defined in `globals.css` using `@theme inline` directive
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`

### TypeScript Configuration
- Path alias: `@/*` maps to project root (e.g., `@/app/page.tsx`)
- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (React 19's new transform)

### ESLint Configuration
- Uses Next.js recommended configs (core-web-vitals + TypeScript)
- Configured via `eslint.config.mjs` (new flat config format)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Technology Versions
- Next.js 16.0.8 (latest)
- React 19.2.1 (latest with new JSX transform)
- Tailwind CSS v4 (major version with new architecture)
- TypeScript 5
