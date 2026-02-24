import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

const SEO = ({
  title,
  description,
  keywords = "mechanical solutions, products, mekanizm",
  ogImage = "/og-image.jpg",
  ogType = "website",
  canonical,
}: SEOProps) => {
  const location = useLocation();
  const baseUrl = window.location.origin;
  const currentUrl = canonical || `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = `${title} | MeKanizm`;

    // Update meta tags
    updateMetaTag("name", "description", description);
    updateMetaTag("name", "keywords", keywords);

    // Open Graph tags
    updateMetaTag("property", "og:title", title);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:image", `${baseUrl}${ogImage}`);
    updateMetaTag("property", "og:url", currentUrl);
    updateMetaTag("property", "og:type", ogType);
    updateMetaTag("property", "og:site_name", "MeKanizm");

    // Twitter Card tags
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", title);
    updateMetaTag("name", "twitter:description", description);
    updateMetaTag("name", "twitter:image", `${baseUrl}${ogImage}`);

    // Canonical link
    updateCanonicalLink(currentUrl);
  }, [title, description, keywords, ogImage, ogType, currentUrl, baseUrl]);

  return null;
};

function updateMetaTag(attribute: string, key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

export default SEO;
