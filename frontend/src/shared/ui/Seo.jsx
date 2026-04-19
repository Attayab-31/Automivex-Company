import { useEffect } from "react";

function resolveCanonical(pathname, websiteUrl) {
  return pathname.startsWith("http")
    ? pathname
    : `${websiteUrl}${pathname}`;
}

function resolveImage(image, websiteUrl) {
  return image.startsWith("http") ? image : `${websiteUrl}${image}`;
}

function upsertMeta(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("link");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
}

export function Seo({
  title,
  description,
  pathname = "/",
  image,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  twitterImage,
  type = "website",
  noIndex = false,
  structuredData,
  siteConfig = {},
}) {
  const websiteUrl = siteConfig.websiteUrl || "https://automivex.com";
  const brand = siteConfig.brand || "Automivex";
  const ogImage = image || siteConfig.ogImage || `${websiteUrl}/og-image.png`;
  
  const canonical = resolveCanonical(pathname, websiteUrl);
  const resolvedImage = resolveImage(ogImage, websiteUrl);
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;
  const resolvedTwitterTitle = twitterTitle || resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription || resolvedOgDescription;
  const resolvedTwitterImage = resolveImage(twitterImage || ogImage, websiteUrl);

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex,nofollow" : "index,follow",
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: resolvedOgTitle,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: resolvedOgDescription,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: brand,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: resolvedImage,
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: `${brand} page preview`,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: resolvedTwitterTitle,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: resolvedTwitterDescription,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: resolvedTwitterImage,
    });

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonical,
    });

    let structuredDataNode = document.head.querySelector(
      'script[data-seo-structured="true"]'
    );

    if (structuredData) {
      if (!structuredDataNode) {
        structuredDataNode = document.createElement("script");
        structuredDataNode.type = "application/ld+json";
        structuredDataNode.dataset.seoStructured = "true";
        document.head.appendChild(structuredDataNode);
      }

      structuredDataNode.textContent = JSON.stringify(structuredData);
    } else if (structuredDataNode) {
      structuredDataNode.remove();
    }
  }, [
    canonical,
    description,
    noIndex,
    resolvedImage,
    resolvedOgDescription,
    resolvedOgTitle,
    resolvedTwitterDescription,
    resolvedTwitterImage,
    resolvedTwitterTitle,
    structuredData,
    title,
    type,
  ]);

  return null;
}
