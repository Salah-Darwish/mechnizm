// src/types/seo.ts
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
}

export const pageSEO: Record<string, PageSEO> = {
  home: {
    title: "Home - Premium Mechanical Solutions",
    description:
      "MeKanizm offers top-quality mechanical products and services tailored to meet your needs. Discover our wide range of solutions.",
    keywords:
      "mechanical solutions, machinery, industrial equipment, mekanizm, premium products",
  },
  products: {
    title: "Products - Browse Our Catalog",
    description:
      "Explore our comprehensive catalog of high-quality mechanical products and equipment.",
    keywords:
      "mechanical products, industrial products, machinery catalog, equipment",
  },
  about: {
    title: "About Us - Our Story",
    description:
      "Learn about MeKanizm, your trusted partner in mechanical solutions and innovation with years of industry experience.",
    keywords:
      "about us, company info, mechanical solutions provider, industry experience",
  },
  faq: {
    title: "FAQ - Frequently Asked Questions",
    description:
      "Find answers to common questions about our products, services, shipping, and warranties.",
    keywords: "faq, questions, answers, help, support",
  },
  privacy: {
    title: "Terms & Privacy Policy",
    description:
      "Read our terms of service and privacy policy to understand how we protect your data and rights.",
    keywords: "privacy policy, terms of service, data protection, user rights",
  },
  contact: {
    title: "Contact Us - Get in Touch",
    description:
      "Contact MeKanizm for inquiries, support, or more information about our products and services.",
    keywords: "contact, get in touch, support, customer service, inquiries",
  },
  login: {
    title: "Login - Access Your Account",
    description:
      "Login to your MeKanizm account to manage orders, track shipments, and access exclusive features.",
    keywords: "login, sign in, account access, user account",
  },
  cart: {
    title: "Shopping Cart - Your Items",
    description: "Review your selected items and proceed to checkout.",
    keywords: "shopping cart, checkout, basket, order",
  },
};
