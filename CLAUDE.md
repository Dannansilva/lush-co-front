# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 frontend application using React 19, TypeScript, and Tailwind CSS v4. The project follows Next.js App Router architecture.

## Development Guidelines

### Package Manager
- **Use Bun** for all package management and script execution (not npm/yarn/pnpm)

### Responsive Design Requirements

**IMPORTANT: Use the `useScreenSize` hook in EVERY component that needs responsive design.**

This is the PRIMARY and REQUIRED approach for all responsive layouts in this project.

#### The Standard Approach (Similar to Flutter's MediaQuery)

**CRITICAL: DO NOT REPEAT RESPONSIVE CALCULATIONS IN EVERY COMPONENT!**

**Use `getResponsiveValues()` instead of manual calculations.**

**Every component must:**
1. Import and use `useScreenSize` hook to measure actual screen dimensions
2. **Use `getResponsiveValues(width, height)` to get all common responsive values at once** (DO NOT manually calculate font sizes, padding, margins, etc.)
3. Only calculate component-specific values if needed
4. Apply values using inline `style` props
5. **NEVER** use Tailwind breakpoints (`sm:`, `md:`, `lg:`, etc.)

**✅ CORRECT - Use getResponsiveValues:**
```tsx
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';

export default function MyComponent() {
  // 1. Measure screen
  const { width, height } = useScreenSize();

  // 2. Get ALL common responsive values from the hook (DO THIS!)
  const responsive = getResponsiveValues(width, height);

  // 3. Only calculate component-specific values if needed
  const customSpacing = Math.max(10, Math.min(width * 0.025, 20));

  // 4. Apply with inline styles using responsive object
  return (
    <div style={{
      padding: `${responsive.padding.vertical}px ${responsive.padding.horizontal}px`,
      fontSize: `${responsive.fontSize.body}px`,
      gap: `${responsive.spacing.gap}px`
    }}>
      <h1 style={{ fontSize: `${responsive.fontSize.heading}px` }}>Title</h1>
      <p style={{ fontSize: `${responsive.fontSize.body}px` }}>Body text</p>
    </div>
  );
}
```

**❌ WRONG - Don't manually calculate common values:**
```tsx
// ❌ DON'T DO THIS - Wasteful and repetitive!
const headingSize = getResponsiveFontSize(width, 24, 32);
const bodySize = getResponsiveFontSize(width, 14, 16);
const smallSize = getResponsiveFontSize(width, 12, 14);
const padding = getResponsivePadding(width, height);
// ... etc
```

#### Available Helper Functions

Import from `@/app/hooks/useScreenSize`:

**Core Hook:**
- `useScreenSize()` - Returns `{ width, height }` of current screen
  - Updates automatically on window resize
  - Returns actual pixel values

**PRIMARY Function (USE THIS!):**
- `getResponsiveValues(width, height)` - **Returns ALL common responsive values at once**
  - **ALWAYS use this instead of calculating individual values**
  - Returns an object with:
    - `padding: { horizontal, vertical }` - Screen-percentage based padding
    - `fontSize: { heading, subheading, body, label, small, caption }` - All font sizes
    - `card: { padding, borderRadius, maxWidth }` - Card/container values
    - `spacing: { vertical, horizontal, gap }` - All spacing values
    - `margin: { bottom, top, sides }` - All margin values
    - `device: { type, isMobile, isTablet, isDesktop, columns }` - Device info

**Individual Helper Functions (Only use for custom/special cases):**
- `getResponsiveFontSize(width, minSize, maxSize)` - Calculate custom font size
  - Scales smoothly between min and max based on screen width
  - Example: `getResponsiveFontSize(width, 14, 24)` → 14px on mobile, 24px on desktop

- `getResponsivePadding(width, height)` - Calculate padding as % of screen
  - Returns `{ horizontal, vertical }` (5% of width/height)
  - Example: `getResponsivePadding(1920, 1080)` → `{ horizontal: 96, vertical: 54 }`

- `getResponsiveSize(width, baseSize, scaleFactor)` - Calculate any size with scaling
  - Example: `getResponsiveSize(width, 40, 1.5)` - scales base size by factor

**Common Patterns:**

```tsx
// ✅ USE getResponsiveValues for common values
const { width, height } = useScreenSize();
const responsive = getResponsiveValues(width, height);

// Use responsive object for all standard values
<div style={{
  padding: `${responsive.padding.vertical}px ${responsive.padding.horizontal}px`,
  fontSize: `${responsive.fontSize.body}px`,
  gap: `${responsive.spacing.gap}px`,
  margin: `${responsive.margin.top}px ${responsive.margin.sides}px`
}}>
  <h1 style={{ fontSize: `${responsive.fontSize.heading}px` }}>Title</h1>
  <h2 style={{ fontSize: `${responsive.fontSize.subheading}px` }}>Subtitle</h2>
  <p style={{ fontSize: `${responsive.fontSize.body}px` }}>Body text</p>
  <small style={{ fontSize: `${responsive.fontSize.small}px` }}>Caption</small>
</div>

// Conditional Layout
const columns = responsive.device.columns; // Automatically 1, 2, or 3
const gridCols = width > 768 ? 'repeat(3, 1fr)' : width > 480 ? 'repeat(2, 1fr)' : '1fr';

// Component Visibility
const showSidebar = responsive.device.isDesktop;
const isMobile = responsive.device.isMobile;

// Only calculate custom values when needed
const customSpacing = Math.max(10, Math.min(width * 0.025, 20));
```

#### Rules
- ✅ **ALWAYS** use `useScreenSize()` in components
- ✅ **ALWAYS** use `getResponsiveValues(width, height)` for common values (font sizes, padding, margins, spacing)
- ✅ **ALWAYS** apply values with inline `style` props
- ✅ **ALWAYS** use real measurements for conditionals
- ✅ **ONLY** calculate custom values when the standard responsive values don't fit your needs
- ❌ **NEVER** manually calculate common values like font sizes, padding, margins if they exist in `getResponsiveValues`
- ❌ **NEVER** use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- ❌ **NEVER** use arbitrary breakpoints: `min-[640px]:`, `max-[1024px]:`
- ❌ **NEVER** use viewport units in CSS: `vw`, `vh`, `clamp()`
- ❌ **NEVER** repeat responsive calculations across components

#### Why This Approach?
1. **Precise Control**: Exact pixel measurements like Flutter
2. **Programmatic Logic**: Use JavaScript calculations and conditionals
3. **True Responsiveness**: Adapts to ANY screen size, not just predefined breakpoints
4. **Consistent**: Same pattern across entire codebase
5. **Maintainable**: Easy to understand and modify calculations

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

### **IMPORTANT: Code Validation Workflow**

**After making ANY code changes, ALWAYS run these commands before finishing:**

1. **`bun run build`** - Verify the code builds without errors
2. **`bun run lint`** - Check for linting issues

**This is REQUIRED for every code change. Do not consider the task complete until both commands run successfully.**

Example workflow:
```bash
# 1. Make code changes
# 2. Verify build
bun run build

# 3. Check linting
bun run lint

# 4. Only then is the task complete
```

If either command fails, fix the errors before proceeding.

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
