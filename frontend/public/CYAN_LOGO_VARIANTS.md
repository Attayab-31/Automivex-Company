# 🎨 Automivex Cyan Logo Variants

Modern cyan-colored logo system for Automivex brand with multiple variations for different use cases.

## 📦 Logo Files

### 1. **logo-cyan-primary.svg**
- **Style**: Modern gradient (Cyan → Blue)
- **Best for**: Hero sections, marketing materials, social media
- **Colors**: `#59d8ff` → `#0b74f5`
- **Use cases**: Website hero, presentations, promotional content

### 2. **logo-cyan-solid.svg**
- **Style**: Solid cyan color
- **Best for**: Social media profiles, favicons, consistent branding
- **Color**: `#59d8ff` (Pure cyan)
- **Use cases**: Twitter/LinkedIn profile, app icons, badges

### 3. **logo-cyan-dark-bg.svg**
- **Style**: Bright gradient with glow effect
- **Best for**: Dark backgrounds, header use, night mode
- **Colors**: `#61ddff` → `#00c9ff` with glow
- **Use cases**: Dark themed sections, dark landing pages, dark mode hero

### 4. **logo-cyan-white-bg.svg**
- **Style**: Deep blue gradient (Blue → Teal)
- **Best for**: Light backgrounds, white pages
- **Colors**: `#0b74f5` → `#00a8e8`
- **Use cases**: Light themed pages, white backgrounds, print materials

---

## 🎯 Usage Guide

| Variant | Background | Context | Recommendation |
|---------|-----------|---------|-----------------|
| **Primary Gradient** | Any | Marketing, Hero, Social | ✅ Primary choice |
| **Solid Cyan** | Dark/Blue | Favicon, Icons, Badges | ✅ For tight spaces |
| **Dark BG (Bright)** | Dark/Black | Night mode, Dark hero | ✅ Maximum visibility |
| **White BG (Deep Blue)** | Light/White | Light pages, Print | ✅ Professional look |

---

## 💡 Implementation Examples

### In HTML
```html
<!-- Hero Section (Dark) -->
<img src="/logo-cyan-dark-bg.svg" alt="Automivex">

<!-- Light Section -->
<img src="/logo-cyan-white-bg.svg" alt="Automivex">

<!-- Social Media -->
<img src="/logo-cyan-solid.svg" alt="Automivex">

<!-- Marketing -->
<img src="/logo-cyan-primary.svg" alt="Automivex">
```

### In React
```jsx
// Dynamic logo selection based on theme
import logoCyanDark from '@/public/logo-cyan-dark-bg.svg';
import logoCyanLight from '@/public/logo-cyan-white-bg.svg';

<img 
  src={isDarkMode ? logoCyanDark : logoCyanLight} 
  alt="Automivex" 
/>
```

---

## 🎨 Color Palette Reference

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Bright Cyan** | Cyan | `#59d8ff` | Primary logo, solid variant |
| **Bright Cyan (Alt)** | Cyan | `#61ddff` | Dark background variant |
| **Brand Blue** | Blue | `#0b74f5` | Light background, gradient |
| **Teal** | Teal | `#00a8e8` | Gradient transition |
| **Teal (Alt)** | Teal | `#00c9ff` | Dark background highlight |

---

## 📱 Responsive Usage

- **Mobile**: Use solid variant for better visibility on small screens
- **Desktop**: Use gradient variants for visual impact
- **Header**: Use dark-bg variant for maximum contrast
- **Footer**: Use solid variant for consistent branding

---

## ✨ Key Features

✅ **Modern gradient design**  
✅ **4 variations for different contexts**  
✅ **Optimized for all backgrounds**  
✅ **Professional look and feel**  
✅ **SVG format (scalable, lightweight)**  
✅ **Glow effects on dark backgrounds**  
✅ **Perfect contrast ratios**  

---

## 🚀 Next Steps

1. **Choose primary variant** based on your main use case
2. **Test variants** on your website sections
3. **Optimize favicon** using `logo-cyan-solid.svg`
4. **Update social media** with solid variant
5. **Use gradients** in hero/marketing sections

---

**Created**: April 2026  
**Brand**: Automivex  
**Format**: SVG (Scalable Vector Graphics)  
**Variants**: 4 (Gradient, Solid, Dark BG, Light BG)
