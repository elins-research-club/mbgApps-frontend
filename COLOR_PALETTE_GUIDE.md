# Professional Color Palette Guide

## Overview

MBG Apps uses a sophisticated warm earth tone palette designed to convey elegance, warmth, and professionalism. The color system is built around four core colors:

- **Deep Burgundy #452829** - Primary, elegant, sophisticated
- **Charcoal #57595B** - Secondary, professional, strong
- **Warm Beige #E8D1C5** - Accent, warm, inviting
- **Soft Cream #F3E8DF** - Background, gentle, comfortable

---

## Design Principles

### No Gradients
- All colors are solid, flat colors
- No gradient backgrounds
- Clean, professional appearance
- Better performance
- Easier maintenance

### Consistent Usage
- Same color for same purpose across all pages
- Professional, mature color choices
- Accessible contrast ratios

### Color Psychology

**Deep Burgundy #452829:**
- Represents: Elegance, sophistication, depth
- Used for: Primary buttons, important text, headers
- Psychology: Conveys luxury, refinement, and warmth

**Charcoal #57595B:**
- Represents: Professionalism, strength, stability
- Used for: Secondary buttons, text, navigation
- Psychology: Conveys reliability and professionalism

**Warm Beige #E8D1C5:**
- Represents: Warmth, comfort, approachability
- Used for: Accents, highlights, active states
- Psychology: Conveys warmth and welcoming feeling

**Soft Cream #F3E8DF:**
- Represents: Gentleness, comfort, neutrality
- Used for: Backgrounds, cards, surfaces
- Psychology: Creates a comfortable, inviting atmosphere

---

## Color Palette

### Deep Burgundy #452829 (Primary)

| Shade | Hex | Usage |
|-------|-----|-------|
| 900 | `#452829` | **Primary buttons, headers** |
| 800 | `#6C2D19` | Hover states |
| 700 | `#8B5656` | Active states |
| 600 | `#AA7F7F` | Secondary elements |
| 500 | `#E8D1C5` | Warm beige accent |

### Charcoal #57595B (Secondary)

| Shade | Hex | Usage |
|-------|-----|-------|
| 900 | `#17191B` | Darkest text |
| 800 | `#37393B` | Dark backgrounds |
| 700 | `#57595B` | **Secondary buttons** |
| 600 | `#77797B` | Body text |
| 500 | `#A3A5A7` | Muted text |

### Warm Beige #E8D1C5 (Accent)

| Shade | Hex | Usage |
|-------|-----|-------|
| 500 | `#E8D1C5` | **Active states, highlights** |
| 400 | `#C9A89A` | Hover accent |
| 300 | `#AA7F6F` | Borders |
| 200 | `#F5D9CE` | Light backgrounds |
| 100 | `#F9EBE4` | Subtle highlights |

### Soft Cream #F3E8DF (Accent Background)

| Shade | Hex | Usage |
|-------|-----|-------|
| 500 | `#F3E8DF` | Elevated surfaces, accents |
| 400 | `#E8D1C5` | Highlights, active states |
| 300 | `#D9C7B8` | Subtle depth |
| 200 | `#C9A89A` | Warm undertones |
| 100 | `#B9897A` | Dark accents |

**Main Background: Pure White #FFFFFF**

### Accent Colors (Teal)

| Shade | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| 50 | `#f0fdfa` | `oklch(0.982 0.014 180.62)` | Light backgrounds |
| 100 | `#ccfbf1` | `oklch(0.953 0.038 180.62)` | Success backgrounds |
| 200 | `#99f6e4` | `oklch(0.924 0.062 180.62)` | Success borders |
| 300 | `#5eead4` | `oklch(0.895 0.086 180.62)` | Success icons |
| 400 | `#2dd4bf` | `oklch(0.866 0.110 180.62)` | Success badges |
| **500** | **`#14b8a6`** | **`oklch(0.715 0.14 180.62)`** | **Accent buttons** |
| 600 | `#0d9488` | `oklch(0.646 0.126 180.62)` | Hover accent |
| 700 | `#0f766e` | `oklch(0.577 0.112 180.62)` | Active accent |
| 800 | `#115e59` | `oklch(0.508 0.098 180.62)` | Dark teal |
| 900 | `#134e4a` | `oklch(0.439 0.084 180.62)` | Darkest teal |

### Status Colors

#### Status Colors

##### Pending/Suspended (Blue)
- **Light:** `#dbeafe` - Backgrounds
- **Main:** `#2563eb` - Buttons, badges
- **Dark:** `#1e40af` - Text, borders

#### Success (Green)
- **Light:** `#dcfce7` - Backgrounds
- **Main:** `#16a34a` - Buttons, icons
- **Dark:** `#166534` - Text, borders

#### Error (Red)
- **Light:** `#fee2e2` - Backgrounds
- **Main:** `#dc2626` - Buttons, icons
- **Dark:** `#991b1b` - Text, borders

---

## Usage Guidelines

### Buttons

```jsx
// Primary Action - Warm Beige
<button className="bg-[#E8D1C5] hover:bg-[#C9A89A] text-[#6C2D19] font-medium px-4 py-2 rounded-lg">
  Save Changes
</button>

// Secondary Action
<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg">
  Cancel
</button>

// Accent Action - Teal
<button className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-2 rounded-lg">
  Get Started
</button>

// Danger Action
<button className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg">
  Delete
</button>
```

### Status Badges

```jsx
// Active/Success
<span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
  Active
</span>

// Pending/Warning (Changed to Blue)
<span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
  Pending
</span>

// Rejected/Error
<span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">
  Rejected
</span>

// Suspended (Changed to Blue)
<span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
  Suspended
</span>
```

### Cards & Surfaces

```jsx
// Standard Card
<div className="bg-white border border-[#E8D1C5] rounded-xl shadow-sm p-6">
  {/* Content */}
</div>

// Elevated Card
<div className="bg-white border border-[#E8D1C5] rounded-xl shadow-md p-6">
  {/* Content */}
</div>

// Interactive Card
<div className="bg-white border border-[#E8D1C5] rounded-xl shadow-sm p-6 hover:border-[#C9A89A] hover:shadow-md transition-all">
  {/* Content */}
</div>
```

### Navigation

```jsx
// Active Nav Item
<button className="bg-[#F5D9CE] text-[#6C2D19] px-4 py-2 rounded-lg font-medium">
  Dashboard
</button>

// Inactive Nav Item
<button className="text-gray-600 hover:bg-[#F9EBE4] hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
  Settings
</button>
```

### Input Fields

```jsx
<input 
  className="border border-[#E8D1C5] focus:border-[#C9A89A] focus:ring-2 focus:ring-[#E8D1C5] rounded-lg px-4 py-2 w-full"
  placeholder="Enter your email"
/>
```

### Notifications

```jsx
// Success
<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
  ✓ Operation successful!
</div>

// Error
<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
  ✗ Something went wrong
</div>

// Warning
<div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
  ⚠ Please review carefully
</div>

// Info
<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
  ℹ Additional information
</div>
```

---

## Accessibility

### Contrast Ratios

All color combinations meet **WCAG AA** standards:

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text:** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

### Color Blindness

The palette is designed to be distinguishable by users with:
- **Protanopia** (red-blind)
- **Deuteranopia** (green-blind)
- **Tritanopia** (blue-blind)

**Best Practices:**
- Never use color alone to convey information
- Always include icons or text labels
- Test with color blindness simulators

---

## Dark Mode (Future)

When implementing dark mode, use these inverted values:

```css
.dark {
  --background: oklch(0.145 0.02 263.04);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0.02 263.04);
  --primary: oklch(0.715 0.14 180.62);
  /* ... */
}
```

---

## Implementation

### CSS Variables

All colors are available as CSS custom properties:

```css
.button {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--border);
}
```

### Tailwind Classes

Use the predefined Tailwind classes:

```jsx
import { tailwindColors } from '@/lib/colors';

<button className={tailwindColors.buttonPrimary}>
  Click Me
</button>
```

### JavaScript/React

Import the colors object:

```jsx
import colors from '@/lib/colors';

<div style={{ backgroundColor: colors.primary[500] }}>
  Content
</div>
```

---

## Examples

### Admin Dashboard Header

```jsx
<header className="bg-[#F3E8DF] border-b border-[#E8D1C5] sticky top-0 z-40 shadow-sm">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <h1 className="text-xl font-semibold text-[#452829]">
        Organization Management
      </h1>
      <button className="bg-[#E8D1C5] hover:bg-[#C9A89A] text-[#452829] px-4 py-2 rounded-lg">
        Logout
      </button>
    </div>
  </div>
</header>
```

### Organization Card

```jsx
<div className="bg-[#F3E8DF] border border-[#E8D1C5] rounded-xl shadow-sm p-6 hover:border-[#C9A89A] hover:shadow-md transition-all">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-lg font-semibold text-[#452829]">
      {org.name}
    </h3>
    <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
      Active
    </span>
  </div>
  <p className="text-[#57595B] text-sm mb-4">
    {org.description}
  </p>
  <div className="flex gap-2">
    <button className="bg-[#452829] hover:bg-[#6C2D19] text-[#F3E8DF] px-4 py-2 rounded-lg text-sm font-medium">
      View Details
    </button>
    <button className="bg-[#57595B] hover:bg-[#37393B] text-[#F3E8DF] px-4 py-2 rounded-lg text-sm font-medium">
      Edit
    </button>
  </div>
</div>
```

### Approval Status Table

```jsx
<table className="w-full">
  <thead>
    <tr className="bg-slate-50 border-b border-slate-200">
      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
        Organization
      </th>
      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
        Status
      </th>
      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-200">
    {orgs.map((org) => (
      <tr key={org.id} className="hover:bg-slate-50">
        <td className="px-6 py-4 text-sm text-slate-900">{org.name}</td>
        <td className="px-6 py-4">
          <StatusBadge status={org.status} />
        </td>
        <td className="px-6 py-4 text-right">
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Approve
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Files

- **Color Definitions:** `src/lib/colors.js`
- **Global Styles:** `src/styles/globals.css`
- **Components:** Use consistent color classes across all components

---

## Maintenance

When adding new colors:
1. Add to `colors.js` with proper naming
2. Add to `globals.css` as CSS variables
3. Update this documentation
4. Test accessibility with contrast checker
5. Test with color blindness simulator

---

**Last Updated:** 2026-03-31
**Version:** 1.0.0
