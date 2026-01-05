# Galabau Fortkamp - Technical Specification

## Project Overview

**Company:** Galabau Fortkamp (Garden and Landscape Construction)
**Location:** Ahaus, Germany
**Primary Goal:** Lead generation through calls and WhatsApp messages
**Target Audience:** Private homeowners, property management companies, and businesses
**USP:** Local, reliable, full-service including winter services

---

## 1. Site Architecture & Routing Structure

### 1.1 Page Hierarchy

```
/                           → Homepage
/leistungen/                → Services Overview
/leistungen/[slug]/         → Individual Service Detail
/projekte/                  → Projects Gallery
/projekte/[slug]/           → Individual Project Detail
/kontakt/                   → Contact Page
/ueber-uns/                 → About Us
/impressum/                 → Legal Notice (Impressum)
/datenschutz/               → Privacy Policy (Datenschutzerklärung)
/agb/                       → Terms & Conditions
```

### 1.2 Data Models

#### Service Model (`src/content/services/`)

```typescript
interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  heroImage: ImageAsset;
  gallery: ImageAsset[];
  features: string[];
  benefits: Benefit[];
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices: string[];
  seoMeta: SEOMeta;
  publishedAt: Date;
  updatedAt: Date;
}

interface Benefit {
  title: string;
  description: string;
  icon?: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

interface FAQ {
  question: string;
  answer: string;
}
```

#### Project Model (`src/content/projects/`)

```typescript
interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  clientType: 'private' | 'commercial' | 'property-management';
  location: string;
  completedAt: Date;
  duration: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  services: string[];
  images: ProjectImage[];
  testimonial?: Testimonial;
  featured: boolean;
  seoMeta: SEOMeta;
}

interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
  isBefore?: boolean;
  isAfter?: boolean;
}
```

#### Testimonial Model

```typescript
interface Testimonial {
  id: string;
  author: string;
  role?: string;
  company?: string;
  location: string;
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
  projectId?: string;
  serviceId?: string;
  avatar?: string;
  featured: boolean;
  publishedAt: Date;
}
```

#### Site Configuration (`src/data/config.json`)

```typescript
interface SiteConfig {
  company: {
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    founded: number;
    owner: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    email: string;
    address: Address;
  };
  hours: BusinessHours;
  social: SocialLinks;
  seo: GlobalSEO;
  features: FeatureFlags;
}

interface Address {
  street: string;
  city: string;
  zip: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  holidays: string;
  emergency: string;
}
```

### 1.3 API Endpoints (Edge Functions)

#### Contact Form Submission

```
POST /api/contact
Content-Type: application/json

Request Body:
{
  "name": string,
  "email": string,
  "phone": string,
  "service": string,
  "message": string,
  "consent": boolean,
  "turnstileToken": string
}

Response:
{
  "success": boolean,
  "message": string,
  "referenceId": string
}
```

#### Newsletter Subscription

```
POST /api/newsletter
Content-Type: application/json

Request Body:
{
  "email": string,
  "consent": boolean,
  "turnstileToken": string
}

Response:
{
  "success": boolean,
  "message": string,
  "requiresConfirmation": boolean
}
```

---

## 2. Component Library Specification

### 2.1 Layout Components

#### Header

```typescript
interface HeaderProps {
  variant: 'transparent' | 'solid';
  sticky: boolean;
}

States:
- Default (transparent on hero sections)
- Scrolled (solid background after 100px scroll)
- Mobile menu open
- Active navigation item highlight

Interactions:
- Scroll-triggered background transition (160ms)
- Mobile hamburger animation
- Dropdown menus on desktop (hover, 200ms delay)
- Skip-to-content link for accessibility
```

#### Footer

```typescript
interface FooterProps {
  showNewsletter: boolean;
  showMap: boolean;
}

Sections:
- Company info & contact
- Quick links (Services, Projects, Legal)
- Business hours
- Newsletter signup (optional)
- Social links
- Copyright & legal links
```

### 2.2 Hero Components

#### Hero (Homepage)

```typescript
interface HeroProps {
  headline: string;
  subheadline: string;
  backgroundImage: ImageAsset;
  backgroundVideo?: VideoAsset;
  ctaPrimary: CTA;
  ctaSecondary?: CTA;
  trustIndicators?: TrustIndicator[];
}

interface CTA {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  icon?: 'phone' | 'whatsapp' | 'arrow';
}

Features:
- Full viewport height on desktop
- Parallax background (reduced-motion aware)
- Gradient overlay for text readability
- Animated trust indicators (reviews, years in business)
```

#### HeroService (Service Pages)

```typescript
interface HeroServiceProps {
  title: string;
  description: string;
  image: ImageAsset;
  breadcrumbs: Breadcrumb[];
}
```

### 2.3 Content Components

#### ServiceCard

```typescript
interface ServiceCardProps {
  service: Service;
  variant: 'default' | 'compact' | 'featured';
  showImage: boolean;
}

States:
- Default
- Hover (scale 1.02, shadow elevation)
- Focus (visible focus ring)

Interactions:
- Entire card clickable
- Image zoom on hover (1.05 scale, 300ms)
```

#### ServiceNav (Service Page Sidebar)

```typescript
interface ServiceNavProps {
  services: Service[];
  currentSlug: string;
  sticky: boolean;
}

Features:
- Sticky positioning on desktop
- Active state indication
- Smooth scroll to sections
- Collapsible on mobile
```

#### ProjectCard

```typescript
interface ProjectCardProps {
  project: Project;
  variant: 'default' | 'featured' | 'minimal';
  showServices: boolean;
}

Features:
- Before/after image toggle (if available)
- Service tags
- Location indicator
- Hover overlay with quick info
```

#### Gallery

```typescript
interface GalleryProps {
  images: ImageAsset[];
  variant: 'grid' | 'masonry' | 'carousel';
  columns: 2 | 3 | 4;
  lightbox: boolean;
}

Features:
- Lazy loading with blur-up placeholders
- Lightbox with keyboard navigation
- Touch gestures for mobile
- Image zoom capability
- Caption display
```

#### Steps (Process Visualization)

```typescript
interface StepsProps {
  steps: ProcessStep[];
  variant: 'horizontal' | 'vertical' | 'alternating';
  numbered: boolean;
  animated: boolean;
}

Features:
- Scroll-triggered reveal animation
- Connection lines between steps
- Icon or number indicators
- Responsive layout switching
```

#### TestimonialCard

```typescript
interface TestimonialCardProps {
  testimonial: Testimonial;
  variant: 'default' | 'featured' | 'minimal';
  showRating: boolean;
  showAvatar: boolean;
}

Features:
- Star rating display
- Quote styling
- Optional project link
- Google review styling option
```

#### ContactBlock

```typescript
interface ContactBlockProps {
  variant: 'full' | 'compact' | 'inline';
  showForm: boolean;
  showMap: boolean;
  showHours: boolean;
}

Features:
- Click-to-call phone link
- WhatsApp deep link
- Email with subject prefill
- Interactive map (optional)
- Business hours display
```

### 2.4 Form Components

#### Form

```typescript
interface FormProps {
  id: string;
  action: string;
  method: 'POST';
  fields: FormField[];
  submitLabel: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation: ValidationRule[];
  options?: SelectOption[];
}

Features:
- Client-side validation (real-time)
- Accessible error messages
- Loading state during submission
- Success/error feedback
- Turnstile integration
```

#### Toast

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

Features:
- Auto-dismiss with progress indicator
- Stack multiple toasts
- Swipe to dismiss on mobile
- Screen reader announcements
```

---

## 3. Design System Implementation

### 3.1 Grid System

```css
:root {
  --grid-columns: 12;
  --grid-gutter: 24px;
  --grid-margin-mobile: 16px;
  --grid-margin-tablet: 32px;
  --grid-margin-desktop: 48px;
  --container-max: 1280px;
}

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px - 1280px
- Wide: > 1280px
```

### 3.2 Spacing Scale (8px Base)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### 3.3 Typography

```css
:root {
  /* Font Families */
  --font-heading: 'Merriweather', Georgia, 'Times New Roman', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}

Typography Scale:
- Display: Merriweather Bold, 48-60px, leading-tight
- H1: Merriweather Bold, 36-48px, leading-tight
- H2: Merriweather SemiBold, 30-36px, leading-snug
- H3: Merriweather SemiBold, 24-30px, leading-snug
- H4: Inter SemiBold, 20-24px, leading-snug
- Body Large: Inter Regular, 18px, leading-relaxed
- Body: Inter Regular, 16px, leading-normal
- Body Small: Inter Regular, 14px, leading-normal
- Caption: Inter Medium, 12px, leading-normal
```

### 3.4 Color Tokens

```css
:root {
  /* Brand Greens */
  --green-50: #f0fdf4;
  --green-100: #dcfce7;
  --green-200: #bbf7d0;
  --green-300: #86efac;
  --green-400: #4ade80;
  --green-500: #22c55e;
  --green-600: #16a34a;
  --green-700: #15803d;
  --green-800: #166534;
  --green-900: #14532d;
  --green-950: #052e16;

  /* Earth Tones (Secondary) */
  --earth-50: #faf6f1;
  --earth-100: #f0e6d8;
  --earth-200: #e2d0b8;
  --earth-300: #d0b48e;
  --earth-400: #bf9665;
  --earth-500: #a67c4a;
  --earth-600: #8b6340;
  --earth-700: #6f4e35;
  --earth-800: #5a402e;
  --earth-900: #4a3628;

  /* Neutrals */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
  --neutral-950: #0a0a0a;

  /* Semantic Colors */
  --color-primary: var(--green-600);
  --color-primary-hover: var(--green-700);
  --color-primary-light: var(--green-50);
  --color-secondary: var(--earth-600);
  --color-secondary-hover: var(--earth-700);

  /* Text Colors */
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-600);
  --text-muted: var(--neutral-500);
  --text-inverted: var(--neutral-50);

  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: var(--neutral-50);
  --bg-tertiary: var(--neutral-100);
  --bg-dark: var(--neutral-900);

  /* Border Colors */
  --border-light: var(--neutral-200);
  --border-default: var(--neutral-300);
  --border-dark: var(--neutral-400);

  /* Status Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### 3.5 Animation Guidelines

```css
:root {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 160ms;
  --duration-slow: 240ms;
  --duration-slower: 320ms;

  /* Easing */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

Animation Usage:
- Micro-interactions: 100-160ms, ease-out
- Page transitions: 200-240ms, ease-in-out
- Hover states: 160ms, ease-out
- Modal/drawer: 240ms, ease-out
- Scroll reveals: 320ms, ease-out (staggered)
```

### 3.6 Shadows & Elevation

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

---

## 4. Content Strategy & SEO

### 4.1 Content Structure

#### Homepage Content Blocks

```yaml
Hero:
  headline: "Ihr Garten- und Landschaftsbauer in Ahaus"
  subheadline: "Professionelle Gartenpflege, Landschaftsbau und Winterdienst - zuverlässig und kompetent"
  cta_primary: "Jetzt anrufen"
  cta_secondary: "WhatsApp schreiben"

Trust_Section:
  items:
    - "Beispiel erfahrung Jahre"
    - "Beispiel zufriedene Kunden"
    - "Schnelle Reaktionszeiten"
    - "Faire Preise"

Services_Overview:
  headline: "Unsere Leistungen"
  subheadline: "Vom ersten Entwurf bis zur dauerhaften Pflege"
  services: [list of 6 main services]

About_Preview:
  headline: "Galabau Fortkamp - Ihr Partner vor Ort"
  content: Brief company introduction
  image: Team or owner photo

Projects_Showcase:
  headline: "Unsere Referenzen"
  subheadline: "Überzeugen Sie sich selbst"
  projects: [3-4 featured projects]

Testimonials:
  headline: "Das sagen unsere Kunden"
  testimonials: [3 featured testimonials]

CTA_Section:
  headline: "Bereit für Ihren Traumgarten?"
  subheadline: "Kontaktieren Sie uns für ein unverbindliches Angebot"
  cta_primary: "Kostenloses Angebot anfordern"
```

#### Service Page Content Template

```yaml
Hero:
  title: Service name
  description: 2-3 sentence overview
  image: Service hero image

Introduction:
  content: Detailed service description (200-300 words)

Benefits:
  headline: "Ihre Vorteile"
  items: [4-6 benefits with icons]

Process:
  headline: "So arbeiten wir"
  steps: [4-6 process steps]

Gallery:
  images: [6-12 project images]

FAQ:
  headline: "Häufige Fragen"
  items: [5-8 FAQs]

Related_Services:
  headline: "Ergänzende Leistungen"
  services: [2-3 related services]

CTA:
  headline: Service-specific CTA
```

### 4.2 SEO Implementation

#### Meta Tags Structure

```html
<!-- Primary Meta Tags -->
<title>{pageTitle} | Galabau Fortkamp - Garten- und Landschaftsbau Ahaus</title>
<meta name="description" content="{pageDescription}">
<meta name="keywords" content="{keywords}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="{canonicalUrl}">
<meta property="og:title" content="{pageTitle}">
<meta property="og:description" content="{pageDescription}">
<meta property="og:image" content="{ogImage}">
<meta property="og:locale" content="de_DE">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{pageTitle}">
<meta name="twitter:description" content="{pageDescription}">
<meta name="twitter:image" content="{ogImage}">

<!-- Canonical -->
<link rel="canonical" href="{canonicalUrl}">

<!-- Language -->
<html lang="de">
<link rel="alternate" hreflang="de" href="{canonicalUrl}">
```

#### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://galabau-fortkamp.de/#organization",
  "name": "Galabau Fortkamp",
  "alternateName": "Garten- und Landschaftsbau Fortkamp",
  "description": "Professioneller Garten- und Landschaftsbau in Ahaus und Umgebung",
  "url": "https://galabau-fortkamp.de",
  "logo": "https://galabau-fortkamp.de/logo.png",
  "image": "https://galabau-fortkamp.de/og-image.jpg",
  "telephone": "+49-XXX-XXXXXXX",
  "email": "info@galabau-fortkamp.de",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Straße XX",
    "addressLocality": "Ahaus",
    "postalCode": "48683",
    "addressRegion": "Nordrhein-Westfalen",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "52.0766",
    "longitude": "7.0127"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "52.0766",
      "longitude": "7.0127"
    },
    "geoRadius": "30000"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Garten- und Landschaftsbau Leistungen",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Gartenpflege"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Landschaftsbau"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Winterdienst"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47"
  }
}
```

#### Sitemap Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://galabau-fortkamp.de/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://galabau-fortkamp.de/leistungen/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Dynamic service pages -->
  <!-- Dynamic project pages -->
  <url>
    <loc>https://galabau-fortkamp.de/kontakt/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 4.3 Accessibility Compliance (WCAG 2.1 AA)

```markdown
Checklist:
- [ ] Color contrast ratio minimum 4.5:1 for text, 3:1 for large text
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip-to-content link as first focusable element
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for all images
- [ ] ARIA labels for interactive components
- [ ] Keyboard navigation for all functionality
- [ ] Form labels associated with inputs
- [ ] Error messages linked to form fields
- [ ] Reduced motion media query support
- [ ] Touch targets minimum 44x44px
- [ ] Language attribute on html element
- [ ] Page titles unique and descriptive
```

---

## 5. Performance & Analytics

### 5.1 Image Optimization Strategy

```typescript
interface ImageOptimization {
  formats: ['avif', 'webp', 'jpg'];
  quality: {
    avif: 80,
    webp: 82,
    jpg: 85
  };
  sizes: {
    thumbnail: { width: 400, height: 300 },
    card: { width: 600, height: 400 },
    hero: { width: 1920, height: 1080 },
    full: { width: 2400, height: 1600 }
  };
  responsive: [
    { breakpoint: 640, size: '100vw' },
    { breakpoint: 1024, size: '50vw' },
    { breakpoint: 1280, size: '33vw' }
  ];
  lazyLoading: {
    threshold: '200px',
    placeholder: 'blur' | 'color'
  };
}
```

#### Implementation with Astro Image

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="Gartengestaltung Projekt in Ahaus"
  widths={[400, 800, 1200, 1600]}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  format="avif"
  fallbackFormat="jpg"
  loading="lazy"
  decoding="async"
/>
```

### 5.2 Code Splitting & Lazy Loading

```typescript
// Component lazy loading pattern
const Gallery = await import('../components/Gallery.astro');

// Route-based code splitting (automatic in Astro)
// Each page generates its own bundle

// Third-party script loading
<script async src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>

// Intersection Observer for animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '50px' }
);
```

### 5.3 Performance Budget

```yaml
Metrics:
  LCP: < 2.5s (target: < 1.8s)
  FID: < 100ms (target: < 50ms)
  CLS: < 0.1 (target: < 0.05)
  INP: < 200ms (target: < 100ms)
  TTFB: < 600ms (target: < 200ms)

Bundle Size:
  HTML: < 50KB (gzipped)
  CSS: < 30KB (gzipped)
  JavaScript: < 50KB (gzipped)
  Total Page Weight: < 500KB (initial load)

Image Budgets:
  Hero: < 200KB
  Card images: < 50KB each
  Thumbnails: < 15KB each
```

### 5.4 Analytics Events

```typescript
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

// Lead Generation Events
const trackEvents = {
  // Form Submissions
  contact_form_start: { category: 'Lead', action: 'form_start' },
  contact_form_submit: { category: 'Lead', action: 'form_submit' },
  contact_form_success: { category: 'Lead', action: 'form_success' },
  contact_form_error: { category: 'Lead', action: 'form_error' },

  // Direct Contact
  phone_click: { category: 'Lead', action: 'phone_click' },
  whatsapp_click: { category: 'Lead', action: 'whatsapp_click' },
  email_click: { category: 'Lead', action: 'email_click' },

  // Engagement
  service_view: { category: 'Engagement', action: 'service_view' },
  project_view: { category: 'Engagement', action: 'project_view' },
  gallery_open: { category: 'Engagement', action: 'gallery_open' },

  // Newsletter
  newsletter_subscribe: { category: 'Newsletter', action: 'subscribe' },
  newsletter_confirm: { category: 'Newsletter', action: 'confirm' }
};
```

### 5.5 Performance Monitoring

```typescript
// Web Vitals tracking
import { onLCP, onFID, onCLS, onINP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname
  });

  navigator.sendBeacon('/api/vitals', body);
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## 6. Quality Assurance Framework

### 6.1 Testing Checklist

#### Visual Testing

```markdown
- [ ] All pages render correctly at breakpoints: 320px, 640px, 768px, 1024px, 1280px, 1536px
- [ ] Images display with correct aspect ratios
- [ ] Typography hierarchy is consistent
- [ ] Color contrast passes WCAG AA
- [ ] Dark/light mode consistency (if applicable)
- [ ] Print stylesheet renders correctly
- [ ] Favicon displays in all browsers
- [ ] OG images display correctly on social platforms
```

#### Functional Testing

```markdown
- [ ] All navigation links work correctly
- [ ] Contact form validates and submits
- [ ] Phone links open dialer on mobile
- [ ] WhatsApp links open WhatsApp with prefilled message
- [ ] Email links open mail client
- [ ] Gallery lightbox opens and navigates
- [ ] Scroll animations trigger correctly
- [ ] Sticky header behavior works
- [ ] Mobile menu opens/closes
- [ ] 404 page displays for invalid routes
```

#### Accessibility Testing

```markdown
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces content correctly
- [ ] Focus management in modals/dialogs
- [ ] Skip links function properly
- [ ] Form errors are announced
- [ ] Color is not the only indicator
- [ ] Animations respect reduced-motion
- [ ] Touch targets are minimum 44x44px
```

#### Performance Testing

```markdown
- [ ] Lighthouse score > 90 for all categories
- [ ] LCP < 2.5s on 3G connection
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Images lazy load correctly
- [ ] No render-blocking resources
- [ ] CSS/JS properly minified
- [ ] Gzip/Brotli compression enabled
```

#### SEO Testing

```markdown
- [ ] All pages have unique titles
- [ ] Meta descriptions present and appropriate length
- [ ] Structured data validates in Google Rich Results Test
- [ ] Sitemap.xml is valid and accessible
- [ ] Robots.txt allows appropriate crawling
- [ ] Canonical URLs set correctly
- [ ] Hreflang tags correct (if multilingual)
- [ ] No broken internal/external links
```

### 6.2 Form Validation

#### Client-Side Validation

```typescript
interface ValidationRules {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZäöüÄÖÜß\s\-']+$/,
    message: 'Bitte geben Sie einen gültigen Namen ein'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
  },
  phone: {
    required: false,
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 6,
    message: 'Bitte geben Sie eine gültige Telefonnummer ein'
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 5000,
    message: 'Bitte beschreiben Sie Ihr Anliegen (min. 10 Zeichen)'
  },
  consent: {
    required: true,
    message: 'Bitte stimmen Sie der Datenschutzerklärung zu'
  }
}
```

#### Server-Side Validation (Edge Function)

```typescript
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name muss mindestens 2 Zeichen haben')
    .max(100, 'Name darf maximal 100 Zeichen haben')
    .regex(/^[a-zA-ZäöüÄÖÜß\s\-']+$/, 'Ungültiger Name'),
  email: z.string()
    .email('Ungültige E-Mail-Adresse'),
  phone: z.string()
    .optional()
    .refine(val => !val || /^[\d\s\-\+\(\)]+$/.test(val), 'Ungültige Telefonnummer'),
  service: z.string()
    .optional(),
  message: z.string()
    .min(10, 'Nachricht muss mindestens 10 Zeichen haben')
    .max(5000, 'Nachricht darf maximal 5000 Zeichen haben'),
  consent: z.boolean()
    .refine(val => val === true, 'Datenschutz-Zustimmung erforderlich'),
  turnstileToken: z.string()
    .min(1, 'Captcha-Verifizierung erforderlich')
});
```

### 6.3 Turnstile Spam Protection

```typescript
// Turnstile verification in Edge Function
async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: Deno.env.get('TURNSTILE_SECRET_KEY'),
        response: token
      })
    }
  );

  const result = await response.json();
  return result.success === true;
}
```

### 6.4 Email Handling

```typescript
interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'smtp';
  templates: {
    contactNotification: string;
    contactConfirmation: string;
    newsletterWelcome: string;
    newsletterDoubleOptIn: string;
  };
  doubleOptIn: {
    enabled: boolean;
    tokenExpiry: 24 * 60 * 60 * 1000; // 24 hours
  };
}

// Contact form notification email
interface ContactNotificationEmail {
  to: 'info@galabau-fortkamp.de';
  subject: `Neue Kontaktanfrage: ${name}`;
  body: {
    name: string;
    email: string;
    phone?: string;
    service?: string;
    message: string;
    submittedAt: Date;
    referenceId: string;
  };
}
```

---

## 7. Project Directory Structure

```
src/
├── assets/
│   ├── fonts/
│   ├── images/
│   │   ├── hero/
│   │   ├── services/
│   │   ├── projects/
│   │   └── team/
│   └── icons/
├── components/
│   ├── common/
│   │   ├── Button.astro
│   │   ├── Icon.astro
│   │   ├── Image.astro
│   │   └── Link.astro
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   └── MobileMenu.astro
│   ├── sections/
│   │   ├── Hero.astro
│   │   ├── HeroService.astro
│   │   ├── Services.astro
│   │   ├── Projects.astro
│   │   ├── Testimonials.astro
│   │   ├── Contact.astro
│   │   ├── About.astro
│   │   └── CTA.astro
│   ├── cards/
│   │   ├── ServiceCard.astro
│   │   ├── ProjectCard.astro
│   │   └── TestimonialCard.astro
│   ├── ui/
│   │   ├── Gallery.astro
│   │   ├── Steps.astro
│   │   ├── Accordion.astro
│   │   ├── Toast.astro
│   │   └── Modal.astro
│   └── forms/
│       ├── ContactForm.astro
│       ├── NewsletterForm.astro
│       ├── FormField.astro
│       └── Turnstile.astro
├── content/
│   ├── services/
│   │   ├── gartenpflege.md
│   │   ├── landschaftsbau.md
│   │   ├── winterdienst.md
│   │   └── ...
│   └── projects/
│       ├── projekt-1.md
│       └── ...
├── data/
│   ├── config.json
│   ├── navigation.json
│   └── testimonials.json
├── layouts/
│   ├── BaseLayout.astro
│   ├── PageLayout.astro
│   └── ServiceLayout.astro
├── pages/
│   ├── index.astro
│   ├── leistungen/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── projekte/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── kontakt.astro
│   ├── ueber-uns.astro
│   ├── impressum.astro
│   ├── datenschutz.astro
│   └── 404.astro
├── styles/
│   ├── global.css
│   ├── variables.css
│   ├── typography.css
│   └── utilities.css
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── analytics.ts
└── types/
    └── index.ts

public/
├── favicon.ico
├── favicon.svg
├── apple-touch-icon.png
├── robots.txt
├── sitemap.xml
└── manifest.json

supabase/
└── functions/
    ├── contact/
    │   └── index.ts
    └── newsletter/
        └── index.ts
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- Project setup with Astro, TypeScript, Tailwind
- Design system implementation (colors, typography, spacing)
- Base layout components (Header, Footer, Navigation)
- Database schema setup in Supabase

### Phase 2: Core Pages (Week 2)
- Homepage implementation
- Services overview page
- Service detail page template
- Contact page with form

### Phase 3: Content & Features (Week 3)
- Projects gallery page
- Project detail page template
- Testimonials integration
- Edge functions for form handling

### Phase 4: Polish & Optimization (Week 4)
- Image optimization pipeline
- Performance optimization
- SEO implementation
- Accessibility audit and fixes

### Phase 5: Testing & Launch (Week 5)
- Cross-browser testing
- Mobile testing
- Performance testing
- Analytics setup
- Deployment to Vercel

---

## 9. Dependencies

```json
{
  "dependencies": {
    "astro": "^5.2.5",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/sitemap": "^3.1.0",
    "tailwindcss": "^3.4.0",
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "prettier": "^3.1.0",
    "prettier-plugin-astro": "^0.12.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

---

## 10. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Turnstile (Cloudflare)
VITE_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email Service (Edge Functions)
RESEND_API_KEY=your-resend-key
```

---

This specification provides a complete roadmap for implementing the Galabau Fortkamp website with all required features, optimizations, and best practices for a modern German B2B landscaping business website.
