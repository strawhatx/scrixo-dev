import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string;
}

export function SEOHead({ 
  title = "PDFOtter - Edit & Sign PDFs Online Free | No Signup Required",
  description = "Edit PDF text and sign documents online for free. No downloads, no accounts needed. Unlimited text edits, 1 free signature. Fast, secure, and easy to use.",
  canonicalUrl,
  keywords = "edit pdf online, sign pdf free, pdf editor, electronic signature, modify pdf text, free pdf tool"
}: SEOHeadProps) {
  const fullTitle = title.includes("PDFOtter") ? title : `${title} | PDFOtter`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PDFOtter" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "PDFOtter",
          "description": description,
          "url": "https://pdfotter.com",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Edit PDF text online",
            "Sign PDF documents",
            "Download edited PDFs",
            "No registration required"
          ]
        })}
      </script>
    </Helmet>
  );
}
