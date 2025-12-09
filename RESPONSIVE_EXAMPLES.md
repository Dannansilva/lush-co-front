# Responsive Design Examples

This document shows how to use the `useScreenSize` hook throughout the project.

## Table of Contents
1. [Basic Component](#basic-component)
2. [Card/Container Component](#cardcontainer-component)
3. [Grid Layout](#grid-layout)
4. [Navigation Component](#navigation-component)
5. [Button Component](#button-component)
6. [Modal/Dialog Component](#modaldialog-component)

---

## Basic Component

```tsx
'use client';

import { useScreenSize, getResponsiveFontSize, getResponsivePadding } from '@/app/hooks/useScreenSize';

export default function BasicComponent() {
  const { width, height } = useScreenSize();

  // Calculate responsive values
  const padding = getResponsivePadding(width, height);
  const fontSize = getResponsiveFontSize(width, 14, 18);

  return (
    <div style={{
      padding: `${padding.vertical}px ${padding.horizontal}px`,
      fontSize: `${fontSize}px`
    }}>
      <h1>Responsive Content</h1>
    </div>
  );
}
```

---

## Card/Container Component

```tsx
'use client';

import { useScreenSize, getResponsiveFontSize, getResponsiveGap, getResponsiveBorderRadius } from '@/app/hooks/useScreenSize';

export default function Card({ children }: { children: React.ReactNode }) {
  const { width, height } = useScreenSize();

  // Calculate card dimensions
  const cardPadding = Math.max(16, Math.min(width * 0.04, 32));
  const borderRadius = getResponsiveBorderRadius(width, 8, 16);
  const gap = getResponsiveGap(width, 8, 24);
  const headingSize = getResponsiveFontSize(width, 18, 24);

  return (
    <div style={{
      padding: `${cardPadding}px`,
      borderRadius: `${borderRadius}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`
    }}>
      <h2 style={{ fontSize: `${headingSize}px` }}>Card Title</h2>
      {children}
    </div>
  );
}
```

---

## Grid Layout

```tsx
'use client';

import { useScreenSize, getGridColumns, getResponsiveGap } from '@/app/hooks/useScreenSize';

export default function GridLayout({ items }: { items: any[] }) {
  const { width } = useScreenSize();

  // Get number of columns based on screen width
  const columns = getGridColumns(width, 1, 2, 4); // mobile: 1, tablet: 2, desktop: 4
  const gap = getResponsiveGap(width, 12, 24);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`
    }}>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
}
```

---

## Navigation Component

```tsx
'use client';

import { useScreenSize, getDeviceType } from '@/app/hooks/useScreenSize';

export default function Navigation() {
  const { width, height } = useScreenSize();

  const deviceType = getDeviceType(width);
  const isMobile = deviceType === 'mobile';

  // Calculate navigation height
  const navHeight = isMobile ? 56 : 72;
  const fontSize = isMobile ? 14 : 16;
  const padding = width * 0.04;

  return (
    <nav style={{
      height: `${navHeight}px`,
      padding: `0 ${padding}px`,
      fontSize: `${fontSize}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>Logo</div>
      {!isMobile ? (
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      ) : (
        <button>☰</button>
      )}
    </nav>
  );
}
```

---

## Button Component

```tsx
'use client';

import { useScreenSize, getResponsiveFontSize } from '@/app/hooks/useScreenSize';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export default function Button({ children, variant = 'primary', fullWidth = false }: ButtonProps) {
  const { width } = useScreenSize();

  // Calculate button dimensions
  const fontSize = getResponsiveFontSize(width, 14, 16);
  const paddingVertical = Math.max(10, Math.min(width * 0.012, 14));
  const paddingHorizontal = Math.max(16, Math.min(width * 0.025, 32));
  const borderRadius = Math.max(6, Math.min(width * 0.008, 12));

  return (
    <button style={{
      fontSize: `${fontSize}px`,
      padding: `${paddingVertical}px ${paddingHorizontal}px`,
      borderRadius: `${borderRadius}px`,
      width: fullWidth ? '100%' : 'auto',
      backgroundColor: variant === 'primary' ? '#fbbf24' : 'transparent',
      color: variant === 'primary' ? '#000' : '#fff',
      border: variant === 'secondary' ? '1px solid #fff' : 'none',
      cursor: 'pointer'
    }}>
      {children}
    </button>
  );
}
```

---

## Modal/Dialog Component

```tsx
'use client';

import { useScreenSize, getResponsiveWidth, getResponsiveHeight } from '@/app/hooks/useScreenSize';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const { width, height } = useScreenSize();

  if (!isOpen) return null;

  // Calculate modal dimensions
  const modalWidth = getResponsiveWidth(width, 90, 600); // 90% of screen, max 600px
  const modalHeight = getResponsiveHeight(height, 80, 700); // 80% of screen, max 700px
  const padding = Math.max(20, Math.min(width * 0.04, 40));
  const borderRadius = Math.max(12, Math.min(width * 0.015, 24));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: `${modalWidth}px`,
        maxHeight: `${modalHeight}px`,
        backgroundColor: '#fff',
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        overflow: 'auto'
      }}>
        <button onClick={onClose} style={{ float: 'right' }}>✕</button>
        {children}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Responsive Image Container
```tsx
const { width } = useScreenSize();
const imageSize = Math.max(100, Math.min(width * 0.3, 400));

<div style={{
  width: `${imageSize}px`,
  height: `${imageSize}px`,
  borderRadius: '50%',
  overflow: 'hidden'
}}>
  <Image src="/image.jpg" alt="Profile" fill />
</div>
```

### Responsive Sidebar
```tsx
const { width } = useScreenSize();
const showSidebar = width > 1024;
const sidebarWidth = Math.max(200, Math.min(width * 0.25, 320));

{showSidebar && (
  <aside style={{ width: `${sidebarWidth}px` }}>
    {/* Sidebar content */}
  </aside>
)}
```

### Responsive Typography Scale
```tsx
const { width } = useScreenSize();
const h1Size = getResponsiveFontSize(width, 32, 56);
const h2Size = getResponsiveFontSize(width, 24, 40);
const h3Size = getResponsiveFontSize(width, 20, 32);
const bodySize = getResponsiveFontSize(width, 14, 16);
const captionSize = getResponsiveFontSize(width, 12, 14);
```

---

## Key Principles

1. **Always measure first**: Start every component with `const { width, height } = useScreenSize();`
2. **Calculate, don't hardcode**: Use helper functions to calculate responsive values
3. **Use Math.max/Math.min**: Set boundaries for your calculations
4. **Apply with inline styles**: Use the `style` prop, not Tailwind classes
5. **Think in percentages**: Base calculations on screen dimensions (e.g., `width * 0.05`)

---

## Available Helper Functions

Import from `@/app/hooks/useScreenSize`:

- `useScreenSize()` - Get screen dimensions
- `getResponsiveFontSize(width, min, max)` - Calculate font sizes
- `getResponsivePadding(width, height)` - Calculate padding
- `getResponsiveMargin(width, height, percentage)` - Calculate margins
- `getResponsiveGap(width, min, max)` - Calculate spacing/gaps
- `getResponsiveWidth(width, percentage, max)` - Calculate widths
- `getResponsiveHeight(height, percentage, max)` - Calculate heights
- `getDeviceType(width)` - Get device type ('mobile' | 'tablet' | 'desktop')
- `getGridColumns(width, mobile, tablet, desktop)` - Get column count
- `getResponsiveBorderRadius(width, min, max)` - Calculate border radius
- `getResponsiveSize(width, base, scale)` - Calculate any size with scaling
