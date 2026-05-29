# Animations Guide

This document explains how to use smooth animations throughout the RelayTrace web app.

## Quick Start

### 1. Wrap your app with `AnimationsProvider`

In `src/app/layout.tsx`:

```tsx
import { AnimationsProvider } from '@/providers/animations-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnimationsProvider>
          {children}
        </AnimationsProvider>
      </body>
    </html>
  );
}
```

### 2. Use animated components

```tsx
import { 
  AnimatedPage,
  AnimatedCard,
  AnimatedButton,
  AnimatedSection,
} from '@/components/ui/animated';

export default function Dashboard() {
  return (
    <AnimatedPage>
      <h1>Dashboard</h1>
      
      <AnimatedSection>
        <AnimatedCard delay={0}>
          <h2>Trip Statistics</h2>
        </AnimatedCard>
        
        <AnimatedCard delay={0.1}>
          <h2>Recent Activities</h2>
        </AnimatedCard>
      </AnimatedSection>

      <AnimatedButton onClick={() => {}}>
        Create Trip
      </AnimatedButton>
    </AnimatedPage>
  );
}
```

## Available Components

### `AnimatedPage`
- **Use for**: Full page transitions when routes change
- **Props**: `children`, `className`
- **Animation**: Fade in from bottom (300ms)

```tsx
<AnimatedPage>
  <YourPageContent />
</AnimatedPage>
```

### `AnimatedSection`
- **Use for**: Groups of related content (staggered children)
- **Props**: `children`, `className`
- **Animation**: Staggered fade-in (100ms between items)

```tsx
<AnimatedSection>
  <AnimatedCard>Item 1</AnimatedCard>
  <AnimatedCard>Item 2</AnimatedCard>
  <AnimatedCard>Item 3</AnimatedCard>
</AnimatedSection>
```

### `AnimatedCard`
- **Use for**: Individual content cards
- **Props**: `children`, `className`, `delay` (optional)
- **Animation**: Slide up + fade in (300ms), with optional delay
- **Hover effect**: Lifts with shadow

```tsx
<AnimatedCard delay={0.2}>
  <h3>Card Title</h3>
  <p>Card content</p>
</AnimatedCard>
```

### `AnimatedModal`
- **Use for**: Dialogs, modals, and overlays
- **Props**: `children`, `className`, `onClose` (optional)
- **Animation**: Scale in + fade (200ms)

```tsx
<AnimatedModal>
  <div className="bg-white rounded-lg p-6">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</AnimatedModal>
```

### `AnimatedButton`
- **Use for**: All interactive buttons
- **Props**: Standard button props + `variant` (primary, secondary, ghost)
- **Animation**: Scale on hover (1.05x) and tap (0.95x)

```tsx
<AnimatedButton onClick={handleClick}>
  Click me
</AnimatedButton>
```

### `AnimatedContainer`
- **Use for**: Custom transitions with flexibility
- **Props**: `children`, `className`, `type` ('fade' | 'slide-up' | 'scale' | 'slide-down'), `delay`

```tsx
<AnimatedContainer type="slide-up" delay={0.1}>
  <p>This slides up from bottom</p>
</AnimatedContainer>
```

### `AnimatedListItem`
- **Use for**: Items in lists with stagger effect
- **Props**: `children`, `className`
- **Animation**: Works with parent `AnimatedSection` for stagger

```tsx
<AnimatedSection>
  <ul>
    {items.map((item) => (
      <AnimatedListItem key={item.id}>
        {item.name}
      </AnimatedListItem>
    ))}
  </ul>
</AnimatedSection>
```

## Tailwind Animation Classes

For quick styling without wrapping in components:

```tsx
// Fade in
<div className="animate-fade-in">Fades in</div>

// Slide from bottom
<div className="animate-slide-in-up">Slides up</div>

// Slide from top
<div className="animate-slide-in-down">Slides down</div>

// Slide from left
<div className="animate-slide-in-left">Slides from left</div>

// Slide from right
<div className="animate-slide-in-right">Slides from right</div>

// Scale in
<div className="animate-scale-in">Scales in</div>

// Bounce in
<div className="animate-bounce-in">Bounces in</div>

// Soft pulse
<div className="animate-pulse-soft">Pulses softly</div>
```

## Button Transitions

All buttons automatically get smooth transitions:

```tsx
// Tailwind-based (manual)
<button className="transition-all duration-200 ease-out hover:scale-105 active:scale-95">
  Click me
</button>

// Component-based (recommended)
<AnimatedButton>
  Click me
</AnimatedButton>
```

## Global Transition Classes

Use these Tailwind classes for consistent transitions:

```tsx
// Cards
<div className="transition-all duration-300 ease-out hover:shadow-lg">
  Card content
</div>

// Links
<a href="#" className="transition-colors duration-200 ease-out hover:text-blue-600">
  Link
</a>

// Sections
<section className="transition-all duration-300 ease-out">
  Section content
</section>
```

## Best Practices

1. **Delay for staggered effects**
   ```tsx
   <AnimatedCard delay={0}>Item 1</AnimatedCard>
   <AnimatedCard delay={0.1}>Item 2</AnimatedCard>
   <AnimatedCard delay={0.2}>Item 3</AnimatedCard>
   ```

2. **Use `AnimatedSection` for lists**
   ```tsx
   <AnimatedSection>
     {items.map((item) => (
       <AnimatedCard key={item.id}>{item.name}</AnimatedCard>
     ))}
   </AnimatedSection>
   ```

3. **Keep animations fast**
   - Page transitions: 200-300ms
   - Hover effects: 150-200ms
   - List stagger: 75-150ms between items

4. **Use spring physics for interactive elements**
   - Buttons, toggles, and clickable items benefit from spring animations
   - See `AnimatedButton` for an example

5. **Avoid animation overload**
   - Not everything needs to animate
   - Use animations to guide user attention
   - Keep micro-interactions subtle

## Performance

- Framer Motion is optimized for performance
- Uses GPU acceleration when available
- Respects `prefers-reduced-motion` media query automatically
- Safe for mobile devices

## Customization

To customize animations globally, edit:
- `src/lib/animations.ts` — Framer Motion presets
- `tailwind.config.ts` — Tailwind animations & transitions

Example: Change page transition duration:

```ts
// src/lib/animations.ts
page: {
  transition: { duration: 0.5, ease: 'easeOut' }, // Changed from 0.3
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Respects `prefers-reduced-motion` for accessibility
- Gracefully degrades in older browsers
