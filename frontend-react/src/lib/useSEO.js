import { useEffect } from 'react';

/**
 * useSEO — sets document.title, meta description, and canonical URL
 * for each page to enable unique SEO metadata per route.
 *
 * @param {string} title - Full page title (shown in browser tab / Google results)
 * @param {string} description - Meta description (shown in Google snippets)
 * @param {string} [canonicalUrl] - Canonical URL for the page (optional)
 */
export function useSEO(title, description, canonicalUrl) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Set canonical link
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Set Open Graph tags
    const setOgTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', title);
    setOgTag('og:description', description);
    if (canonicalUrl) setOgTag('og:url', canonicalUrl);

    // Cleanup: restore original title on unmount
    const originalTitle = 'NutriScan AI - Free Food Scanner & Nutrition Analyzer';
    return () => {
      document.title = originalTitle;
    };
  }, [title, description, canonicalUrl]);
}
