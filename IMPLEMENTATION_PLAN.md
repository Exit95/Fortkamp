# Galabau Fortkamp - Implementation Plan

## Quick Reference: Key Implementation Details

### 1. Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://galabau-fortkamp.de',
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE' }
      }
    })
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild'
    }
  }
});
```

### 2. Tailwind Configuration

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e2d0b8',
          300: '#d0b48e',
          400: '#bf9665',
          500: '#a67c4a',
          600: '#8b6340',
          700: '#6f4e35',
          800: '#5a402e',
          900: '#4a3628',
        }
      },
      fontFamily: {
        heading: ['Merriweather', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
```

### 3. Database Schema (Supabase Migration)

```sql
/*
  # Initial Schema for Galabau Fortkamp

  1. Tables
    - contact_submissions: Stores contact form submissions
    - newsletter_subscribers: Stores newsletter subscriptions
    - page_views: Analytics for page views (optional)

  2. Security
    - RLS enabled on all tables
    - Public can insert (with rate limiting via edge functions)
    - Only authenticated admin can read
*/

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  source_page text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  notes text
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on contact_submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin can read contact_submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  confirmed boolean NOT NULL DEFAULT false,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  source text DEFAULT 'website'
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on newsletter_subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin can manage newsletter_subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email
  ON newsletter_subscribers(email);
```

### 4. Core Component Examples

#### Base Layout Component

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
}

const {
  title,
  description,
  image = '/og-image.jpg',
  noIndex = false
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const fullTitle = `${title} | Galabau Fortkamp`;
---

<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {noIndex && <meta name="robots" content="noindex, nofollow" />}

  <link rel="canonical" href={canonicalURL} />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(image, Astro.site)} />
  <meta property="og:locale" content="de_DE" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={new URL(image, Astro.site)} />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />

  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Galabau Fortkamp",
    "description": "Professioneller Garten- und Landschaftsbau in Ahaus",
    "url": "https://galabau-fortkamp.de",
    "telephone": "+49-XXX-XXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ahaus",
      "postalCode": "48683",
      "addressCountry": "DE"
    },
    "areaServed": "Ahaus und Umgebung"
  })} />
</head>
<body class="font-body text-neutral-900 bg-white antialiased">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded">
    Zum Hauptinhalt springen
  </a>

  <slot name="header" />

  <main id="main-content">
    <slot />
  </main>

  <slot name="footer" />

  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  </script>
</body>
</html>
```

#### Header Component

```astro
---
// src/components/layout/Header.astro
import Navigation from './Navigation.astro';
import MobileMenu from './MobileMenu.astro';

interface Props {
  variant?: 'transparent' | 'solid';
}

const { variant = 'solid' } = Astro.props;
---

<header
  id="site-header"
  class:list={[
    'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
    variant === 'transparent' ? 'bg-transparent' : 'bg-white shadow-sm'
  ]}
  data-variant={variant}
>
  <div class="container mx-auto px-4 lg:px-8">
    <div class="flex items-center justify-between h-16 lg:h-20">
      <a href="/" class="flex items-center gap-3" aria-label="Galabau Fortkamp - Startseite">
        <img src="/logo.svg" alt="" class="h-10 w-auto" />
        <span class="font-heading font-bold text-lg hidden sm:block">
          Galabau Fortkamp
        </span>
      </a>

      <Navigation class="hidden lg:flex" />

      <div class="flex items-center gap-4">
        <a
          href="tel:+49XXXXXXXXX"
          class="hidden md:flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
          data-track="phone_click"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Anrufen</span>
        </a>

        <a
          href="https://wa.me/49XXXXXXXXX?text=Hallo,%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Leistungen."
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          data-track="whatsapp_click"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span class="hidden sm:inline">WhatsApp</span>
        </a>

        <button
          type="button"
          class="lg:hidden p-2 text-neutral-700 hover:text-neutral-900"
          aria-label="Menu öffnen"
          aria-expanded="false"
          aria-controls="mobile-menu"
          id="mobile-menu-toggle"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <MobileMenu />
</header>

<script>
  const header = document.getElementById('site-header');
  const variant = header?.dataset.variant;

  if (variant === 'transparent') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header?.classList.remove('bg-transparent');
        header?.classList.add('bg-white', 'shadow-sm');
      } else {
        header?.classList.add('bg-transparent');
        header?.classList.remove('bg-white', 'shadow-sm');
      }
    }, { passive: true });
  }
</script>
```

#### Hero Component

```astro
---
// src/components/sections/Hero.astro
import { Image } from 'astro:assets';

interface Props {
  headline: string;
  subheadline: string;
  backgroundImage: ImageMetadata;
  ctaPrimary: {
    label: string;
    href: string;
  };
  ctaSecondary?: {
    label: string;
    href: string;
  };
}

const { headline, subheadline, backgroundImage, ctaPrimary, ctaSecondary } = Astro.props;
---

<section class="relative min-h-[90vh] flex items-center">
  <div class="absolute inset-0 z-0">
    <Image
      src={backgroundImage}
      alt=""
      class="w-full h-full object-cover"
      widths={[640, 1024, 1280, 1920]}
      sizes="100vw"
      loading="eager"
      format="avif"
      quality={80}
    />
    <div class="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/60 to-transparent"></div>
  </div>

  <div class="container relative z-10 mx-auto px-4 lg:px-8 py-24 lg:py-32">
    <div class="max-w-2xl">
      <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
        {headline}
      </h1>

      <p class="text-lg md:text-xl text-neutral-200 mb-8 leading-relaxed">
        {subheadline}
      </p>

      <div class="flex flex-col sm:flex-row gap-4">
        <a
          href={ctaPrimary.href}
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          data-track="hero_cta_primary"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {ctaPrimary.label}
        </a>

        {ctaSecondary && (
          <a
            href={ctaSecondary.href}
            class="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-neutral-900 transition-colors"
            data-track="hero_cta_secondary"
          >
            {ctaSecondary.label}
          </a>
        )}
      </div>

      <div class="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/20">
        <div class="flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">15+ Jahre Erfahrung</span>
        </div>
        <div class="flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">100+ Zufriedene Kunden</span>
        </div>
        <div class="flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">Lokaler Service</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

#### Contact Form Component

```astro
---
// src/components/forms/ContactForm.astro
interface Props {
  services: string[];
}

const { services } = Astro.props;
---

<form
  id="contact-form"
  class="space-y-6"
  novalidate
>
  <div class="grid gap-6 md:grid-cols-2">
    <div>
      <label for="name" class="block text-sm font-medium text-neutral-700 mb-2">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        minlength="2"
        maxlength="100"
        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
        placeholder="Ihr Name"
      />
      <p class="mt-1 text-sm text-red-600 hidden" data-error="name"></p>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
        E-Mail <span class="text-red-500">*</span>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
        placeholder="ihre@email.de"
      />
      <p class="mt-1 text-sm text-red-600 hidden" data-error="email"></p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <div>
      <label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
        Telefon
      </label>
      <input
        type="tel"
        id="phone"
        name="phone"
        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
        placeholder="+49 XXX XXXXXXX"
      />
      <p class="mt-1 text-sm text-red-600 hidden" data-error="phone"></p>
    </div>

    <div>
      <label for="service" class="block text-sm font-medium text-neutral-700 mb-2">
        Leistung
      </label>
      <select
        id="service"
        name="service"
        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
      >
        <option value="">Bitte auswählen</option>
        {services.map(service => (
          <option value={service}>{service}</option>
        ))}
      </select>
    </div>
  </div>

  <div>
    <label for="message" class="block text-sm font-medium text-neutral-700 mb-2">
      Nachricht <span class="text-red-500">*</span>
    </label>
    <textarea
      id="message"
      name="message"
      required
      minlength="10"
      maxlength="5000"
      rows="5"
      class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-y"
      placeholder="Beschreiben Sie Ihr Anliegen..."
    ></textarea>
    <p class="mt-1 text-sm text-red-600 hidden" data-error="message"></p>
  </div>

  <div class="flex items-start gap-3">
    <input
      type="checkbox"
      id="consent"
      name="consent"
      required
      class="mt-1 w-4 h-4 text-green-600 border-neutral-300 rounded focus:ring-green-500"
    />
    <label for="consent" class="text-sm text-neutral-600">
      Ich habe die <a href="/datenschutz" class="text-green-600 hover:underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu. <span class="text-red-500">*</span>
    </label>
  </div>
  <p class="text-sm text-red-600 hidden" data-error="consent"></p>

  <div class="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}></div>

  <button
    type="submit"
    class="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span class="flex items-center justify-center gap-2">
      <span data-label>Nachricht senden</span>
      <svg class="w-5 h-5 animate-spin hidden" data-spinner viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
  </button>
</form>

<div id="form-success" class="hidden p-6 bg-green-50 border border-green-200 rounded-lg">
  <div class="flex items-start gap-4">
    <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <h3 class="font-semibold text-green-800">Vielen Dank für Ihre Nachricht!</h3>
      <p class="mt-1 text-green-700">Wir werden uns schnellstmöglich bei Ihnen melden.</p>
    </div>
  </div>
</div>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const successMessage = document.getElementById('form-success');

  const validators = {
    name: (value: string) => {
      if (!value.trim()) return 'Bitte geben Sie Ihren Namen ein';
      if (value.length < 2) return 'Name muss mindestens 2 Zeichen haben';
      if (!/^[a-zA-ZäöüÄÖÜß\s\-']+$/.test(value)) return 'Ungültiger Name';
      return '';
    },
    email: (value: string) => {
      if (!value.trim()) return 'Bitte geben Sie Ihre E-Mail-Adresse ein';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ungültige E-Mail-Adresse';
      return '';
    },
    phone: (value: string) => {
      if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return 'Ungültige Telefonnummer';
      return '';
    },
    message: (value: string) => {
      if (!value.trim()) return 'Bitte geben Sie eine Nachricht ein';
      if (value.length < 10) return 'Nachricht muss mindestens 10 Zeichen haben';
      return '';
    },
    consent: (checked: boolean) => {
      if (!checked) return 'Bitte stimmen Sie der Datenschutzerklärung zu';
      return '';
    }
  };

  function showError(field: string, message: string) {
    const errorEl = document.querySelector(`[data-error="${field}"]`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function clearError(field: string) {
    const errorEl = document.querySelector(`[data-error="${field}"]`);
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      message: formData.get('message') as string,
      consent: formData.has('consent'),
      turnstileToken: formData.get('cf-turnstile-response') as string
    };

    let hasErrors = false;

    for (const [field, validator] of Object.entries(validators)) {
      const value = field === 'consent' ? data.consent : (data as any)[field];
      const error = validator(value);
      if (error) {
        showError(field, error);
        hasErrors = true;
      } else {
        clearError(field);
      }
    }

    if (hasErrors) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const label = submitBtn?.querySelector('[data-label]');
    const spinner = submitBtn?.querySelector('[data-spinner]');

    submitBtn?.setAttribute('disabled', 'true');
    label?.classList.add('hidden');
    spinner?.classList.remove('hidden');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        form.classList.add('hidden');
        successMessage?.classList.remove('hidden');

        if (typeof gtag === 'function') {
          gtag('event', 'contact_form_success', {
            event_category: 'Lead',
            event_label: data.service || 'general'
          });
        }
      } else {
        throw new Error(result.message || 'Fehler beim Senden');
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns telefonisch.');
    } finally {
      submitBtn?.removeAttribute('disabled');
      label?.classList.remove('hidden');
      spinner?.classList.add('hidden');
    }
  });
</script>
```

### 5. Edge Function: Contact Handler

```typescript
// supabase/functions/contact/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  consent: boolean;
  turnstileToken: string;
}

function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GF-${timestamp}-${random}`;
}

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: Deno.env.get("TURNSTILE_SECRET_KEY"),
          response: token,
        }),
      }
    );
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

function validateRequest(data: ContactRequest): string | null {
  if (!data.name || data.name.trim().length < 2) {
    return "Name ist erforderlich (mindestens 2 Zeichen)";
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Gültige E-Mail-Adresse ist erforderlich";
  }
  if (!data.message || data.message.trim().length < 10) {
    return "Nachricht ist erforderlich (mindestens 10 Zeichen)";
  }
  if (!data.consent) {
    return "Datenschutz-Zustimmung ist erforderlich";
  }
  if (!data.turnstileToken) {
    return "Captcha-Verifizierung ist erforderlich";
  }
  return null;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, message: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: ContactRequest = await req.json();

    const validationError = validateRequest(data);
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, message: validationError }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isValidToken = await verifyTurnstile(data.turnstileToken);
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Captcha-Verifizierung fehlgeschlagen" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const referenceId = generateReferenceId();

    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        reference_id: referenceId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        service: data.service || null,
        message: data.message.trim(),
        consent: data.consent,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
        source_page: req.headers.get("referer"),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ success: false, message: "Fehler beim Speichern" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Nachricht erfolgreich gesendet",
        referenceId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Ein unerwarteter Fehler ist aufgetreten" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### 6. Content Collections Configuration

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    shortDescription: z.string(),
    icon: z.string(),
    heroImage: z.string(),
    order: z.number(),
    features: z.array(z.string()),
    benefits: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })),
    process: z.array(z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
      duration: z.string().optional(),
    })),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
    relatedServices: z.array(z.string()).optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string(),
      keywords: z.array(z.string()).optional(),
    }),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    clientType: z.enum(['private', 'commercial', 'property-management']),
    location: z.string(),
    completedAt: z.date(),
    duration: z.string(),
    summary: z.string(),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    results: z.string().optional(),
    services: z.array(z.string()),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      isBefore: z.boolean().optional(),
      isAfter: z.boolean().optional(),
    })),
    testimonial: z.object({
      content: z.string(),
      author: z.string(),
      rating: z.number().min(1).max(5),
    }).optional(),
    featured: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string(),
    }),
  }),
});

export const collections = {
  services: servicesCollection,
  projects: projectsCollection,
};
```

### 7. Global CSS Setup

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: theme('colors.green.600');
    --color-primary-hover: theme('colors.green.700');
  }

  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  body {
    @apply text-neutral-900 bg-white;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 {
    @apply font-heading font-bold;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }
}

@layer components {
  .container {
    @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .btn {
    @apply inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-160;
  }

  .btn-primary {
    @apply btn bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/50;
  }

  .btn-secondary {
    @apply btn bg-earth-600 text-white hover:bg-earth-700 focus:ring-4 focus:ring-earth-500/50;
  }

  .btn-outline {
    @apply btn border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white;
  }

  .section {
    @apply py-16 md:py-24 lg:py-32;
  }

  .section-heading {
    @apply text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-neutral-900 mb-4;
  }

  .section-subheading {
    @apply text-lg md:text-xl text-neutral-600 max-w-2xl;
  }

  .card {
    @apply bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-200 hover:shadow-lg;
  }

  .form-input {
    @apply w-full px-4 py-3 border border-neutral-300 rounded-lg;
    @apply focus:ring-2 focus:ring-green-500 focus:border-transparent;
    @apply transition-shadow duration-160;
  }

  .form-label {
    @apply block text-sm font-medium text-neutral-700 mb-2;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

---

## Testing Commands

```bash
# Development
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview

# Lighthouse CI (install globally first)
npx lighthouse https://localhost:4321 --view

# Check bundle size
npx astro build && du -sh dist/
```

---

## Deployment Checklist

1. [ ] Environment variables configured in Vercel
2. [ ] Supabase database tables created
3. [ ] Edge functions deployed
4. [ ] Turnstile site key configured
5. [ ] Domain DNS configured
6. [ ] SSL certificate active
7. [ ] robots.txt verified
8. [ ] sitemap.xml accessible
9. [ ] Google Search Console verified
10. [ ] Analytics tracking confirmed
11. [ ] All forms tested
12. [ ] Phone/WhatsApp links tested
13. [ ] Performance audit passed (>90 score)
14. [ ] Accessibility audit passed
15. [ ] Legal pages reviewed (Impressum, Datenschutz)
