import type { Place } from '@/lib/types';

const BASE_URL = 'https://mongolia-reso.vercel.app/';
const ORG_NAME = 'Монгол Нутаг';

// ── Organization / Website schema (root page-д) ───────────────────────────────
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: ORG_NAME,
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/icon-512.png`,
        },
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: ORG_NAME,
        description: 'Монголын хамгийн том амралтын платформ',
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: 'mn',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/places?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

// ── Place / LodgingBusiness schema (place detail page-д) ──────────────────────
export function buildPlaceSchema(place: Place) {
  const placeUrl = `${BASE_URL}/places/${place.id}`;
  const isResort = place.type === 'resort';

  // Resort → LodgingBusiness, байгалийн газар → TouristAttraction
  const schemaType = isResort ? 'LodgingBusiness' : 'TouristAttraction';

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': placeUrl,
    name: place.name,
    description: place.description ?? place.short_desc ?? '',
    url: placeUrl,
    inLanguage: 'mn',
    image: place.cover_image ? [place.cover_image, ...(place.images ?? [])] : place.images ?? [],
    touristType: 'Монгол аялагч',
  };

  // Байршил
  if (place.province) {
    base.address = {
      '@type': 'PostalAddress',
      addressLocality: place.district ?? place.province,
      addressRegion: place.province,
      addressCountry: 'MN',
    };
  }

  // GPS координат
  if (place.latitude && place.longitude) {
    base.geo = {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
    };
    base.hasMap = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
  }

  // Үнэ (resort л байна)
  if (isResort && place.price_per_night) {
    base.priceRange = `₮${place.price_per_night.toLocaleString()} / шөнө`;
    base.offers = {
      '@type': 'Offer',
      price: place.price_per_night,
      priceCurrency: 'MNT',
      availability: 'https://schema.org/InStock',
      url: placeUrl,
    };
  }

  // Үнэлгээ
  if (place.rating_count > 0) {
    base.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: place.rating_avg.toFixed(1),
      reviewCount: place.rating_count,
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Холбоо барих
  if (place.phone) base.telephone = place.phone;
  if (place.email) base.email = place.email;
  if (place.website) base.sameAs = [place.website];

  return base;
}

// ── BreadcrumbList schema ─────────────────────────────────────────────────────
export function buildBreadcrumbSchema(place: Place) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Нүүр',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: place.type === 'resort' ? 'Амралтын газрууд' : 'Байгалийн газрууд',
        item: `${BASE_URL}/places?type=${place.type}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: place.name,
        item: `${BASE_URL}/places/${place.id}`,
      },
    ],
  };
}

// ── generateMetadata helper — place detail-д хэрэглэнэ ───────────────────────
export function buildPlaceMetadata(place: Place) {
  const placeUrl = `${BASE_URL}/places/${place.id}`;
  const isResort = place.type === 'resort';
  const typeLabel = isResort ? 'Амралтын газар' : 'Байгалийн үзэсгэлэнт газар';
  const locationLabel = place.province
    ? `${place.district ? place.district + ', ' : ''}${place.province}`
    : 'Монгол улс';

  const title = `${place.name} — ${typeLabel} | ${locationLabel}`;
  const description = place.short_desc
    ? `${place.short_desc}${place.price_per_night ? ` Үнэ: ₮${place.price_per_night.toLocaleString()} / шөнө.` : ''} ${locationLabel}-д байрладаг.`
    : `${place.name} — ${typeLabel}. ${locationLabel}-д байрласан Монголын гайхамшигт газар.`;

  return {
    title,
    description,
    alternates: { canonical: placeUrl },
    openGraph: {
      type: 'website' as const,
      url: placeUrl,
      title,
      description,
      locale: 'mn_MN',
      images: place.cover_image
        ? [{ url: place.cover_image, width: 1200, height: 630, alt: place.name }]
        : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: place.cover_image ? [place.cover_image] : [],
    },
    keywords: [
      place.name,
      typeLabel,
      locationLabel,
      place.province ?? '',
      isResort ? 'амралтын газар захиалах' : 'байгалийн аялал',
      'монгол',
    ].filter(Boolean),
  };
}
