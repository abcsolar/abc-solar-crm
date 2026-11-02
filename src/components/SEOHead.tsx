import { Helmet } from 'react-helmet-async';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
  includeDefaultSchemas?: boolean;
}

const SITE_URL = 'https://abcsolar.in';
const DEFAULT_TITLE = 'ABC Solar | Top Solar Rooftop Installer & Subsidy Partner in UP';
const DEFAULT_DESCRIPTION =
  'Slash electricity bills by up to 90% with ABC Solar. Turnkey rooftop solar installations, PM Surya Ghar Muft Bijli Yojana & UPNEDA subsidy assistance across Lucknow, Barabanki, Ayodhya, Kanpur & UP.';
const DEFAULT_KEYWORDS =
  'solar panel installation Uttar Pradesh, PM Surya Ghar Muft Bijli Yojana UP, UPNEDA solar subsidy Barabanki Lucknow, commercial solar EPC contractor MVVNL, rooftop solar net metering UP, solar plant for cold storage, solar for rice mill, solar company Barabanki, solar installer Lucknow';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = `${SITE_URL}/`,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  schemas = [],
  includeDefaultSchemas = true,
}: SEOHeadProps) {
  // Ensure strict trailing slash consistency for root, clean for pathnames
  const normalizedCanonical = canonical.startsWith('http')
    ? canonical
    : `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`;

  // ── Schema.org LocalBusiness & SolarInstallationService ─────────────────
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: 'ABC Solar',
    alternateName: [
      'Avadh Boring Company - Solar Division',
      'ABC Solar Solution',
      'M/S Avadh Boring Company',
    ],
    description:
      'Premier residential and commercial solar EPC contractor in Uttar Pradesh. UPNEDA Empanelled Vendor (Vendor Code: BBK2508133242) and Authorized Loom Solar Dealer (Cert: 24483/UP/08/2028). Specializing in turnkey on-grid rooftop solar plants, net metering liaison with MVVNL, PVVNL, DVVNL & PuVVNL, and PM Surya Ghar subsidy execution.',
    url: SITE_URL,
    telephone: ['+91-9278442418', '+91-9450942418'],
    email: 'abc.solar7575@gmail.com',
    logo: `${SITE_URL}/logo.jpg`,
    image: `${SITE_URL}/og-image.jpg`,
    priceRange: '₹₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, Cheque, UPI',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'AN-25, Lauta Bagh, Azad Nagar, Nawabganj',
      addressLocality: 'Barabanki',
      addressRegion: 'Uttar Pradesh',
      postalCode: '225001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9272,
      longitude: 81.1834,
    },
    areaServed: [
      { '@type': 'City', name: 'Barabanki' },
      { '@type': 'City', name: 'Lucknow' },
      { '@type': 'City', name: 'Ayodhya' },
      { '@type': 'City', name: 'Kanpur' },
      { '@type': 'City', name: 'Varanasi' },
      { '@type': 'City', name: 'Gorakhpur' },
      { '@type': 'City', name: 'Sitapur' },
      { '@type': 'City', name: 'Sultanpur' },
      { '@type': 'City', name: 'Lakhimpur Kheri' },
      { '@type': 'AdministrativeArea', name: 'Uttar Pradesh' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '185',
      bestRating: '5',
      worstRating: '1',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Rooftop Solar Solutions and Subsidy Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Residential Rooftop Solar Installation (PM Surya Ghar)',
            description:
              'Turnkey on-grid rooftop solar plant with up to ₹1,08,000 combined central and state government subsidy.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Commercial & Industrial Solar EPC (MVVNL / PuVVNL Net Metering)',
            description:
              'High-yield solar plants for agro cold storages, rice mills, factories, and commercial buildings with 40% accelerated depreciation.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Solar Feasibility Survey & DISCOM Liaison',
            description:
              'Free on-site roof survey, DISCOM load feasibility assessment, bi-directional net-meter documentation, and UPNEDA compliance.',
          },
        },
      ],
    },
  };

  // ── Schema.org Organization ─────────────────────────────────────────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'ABC Solar',
    legalName: 'M/S Avadh Boring Company (Solar Division)',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-9278442418',
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['Hindi', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+91-9450942418',
        contactType: 'sales',
        areaServed: 'IN',
        availableLanguage: ['Hindi', 'English'],
      },
    ],
  };

  // ── Schema.org FAQPage ──────────────────────────────────────────────────
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much subsidy is available for rooftop solar under PM Surya Ghar Muft Bijli Yojana in Uttar Pradesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Under PM Surya Ghar Muft Bijli Yojana, residential consumers in Uttar Pradesh receive up to ₹78,000 as Central Govt DBT subsidy (₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW or higher) plus additional UPNEDA state subsidy of up to ₹30,000, delivering a total government subsidy benefit of up to ₹1,08,000 for a 3kW system.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the timeline for solar net-metering approval under MVVNL, PVVNL, DVVNL & PuVVNL?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As an empanelled UPNEDA vendor (Vendor Code: BBK2508133242), ABC Solar handles complete end-to-end liaison with your respective DISCOM. Feasibility approval is typically obtained in 7-10 days, followed by installation, joint plant inspection, bi-directional net meter installation, and commissioning within 15-25 working days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the typical return on investment (ROI) and payback period for a rooftop solar plant in UP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A residential solar system has a payback period of approximately 2.5 to 3.5 years after subsidies. For commercial establishments, factories, cold storages, and rice mills with high daytime power consumption, accelerated depreciation (40% under Section 32 of IT Act) and power bill savings reduce the payback period to just 2 to 3 years, with tier-1 panels backed by a 25-year performance warranty.',
        },
      },
      {
        '@type': 'Question',
        name: 'What documents are required to apply for PM Surya Ghar subsidy in Uttar Pradesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The essential documents include: 1) Latest 1-2 months electricity bill with Consumer Account (CA) number, 2) Aadhaar Card of the electricity bill holder for portal KYC, 3) Bank passbook or cancelled cheque linked with Aadhaar for direct DBT transfer, and 4) Clear rooftop photograph showing shadow-free installation space.',
        },
      },
    ],
  };

  const defaultSchemas =
    includeDefaultSchemas && !noindex
      ? [localBusinessSchema, organizationSchema, faqPageSchema]
      : [];

  const combinedSchemas = [...defaultSchemas, ...schemas];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={normalizedCanonical} />

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow, noarchive" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Geographic / Local SEO Meta Tags */}
      <meta name="geo.region" content="IN-UP" />
      <meta name="geo.placename" content="Barabanki, Uttar Pradesh" />
      <meta name="geo.position" content="26.9272;81.1834" />
      <meta name="ICBM" content="26.9272, 81.1834" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="ABC Solar" />
      <meta property="og:url" content={normalizedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="ABC Solar - Avadh Boring Company Rooftop Solar EPC in UP" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={normalizedCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data JSON-LD */}
      {combinedSchemas.map((schemaObj, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
}

