import type { Metadata } from "next";
import { SEOToolPage } from "@/components/SEOToolPage";

export const metadata: Metadata = {
  title: "Sign PDF No Account - Free Online Signature Tool | Scrixo",
  description: "Sign PDF no account required. Add your signature to PDF documents instantly without creating an account or logging in. 100% free, no signup needed.",
  keywords: "sign pdf no account, sign pdf without account, sign pdf no login, sign pdf no signup, add signature pdf free no account, electronic signature no registration",
  openGraph: {
    title: "Sign PDF No Account - Free Online Signature Tool",
    description: "Sign PDF no account required. Add your signature to PDF documents instantly without creating an account or logging in.",
    url: "https://scrixo.com/sign-pdf-no-account",
    siteName: "Scrixo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF No Account - Free Online Signature Tool",
    description: "Sign PDF no account required. Add your signature to PDF documents instantly without creating an account or logging in.",
  },
};

export default function SignPDFNoAccountPage() {
  return (
    <SEOToolPage
      mainKeyword="Sign PDF No Account"
      h2Keywords={[
        "Sign PDF Without Account",
        "Sign PDF No Login Required",
        "Add Signature PDF Free No Account",
        "Electronic Signature No Registration",
        "Sign PDF Instantly No Signup",
      ]}
      description="Sign PDF documents instantly without creating an account. No login, no signup, no email required. Just upload and sign - completely free."
      tool="sign"
      features={[
        "No account or registration required",
        "No login needed - start signing immediately",
        "100% free with no hidden costs",
        "No watermarks on your documents",
        "Works instantly in your browser",
        "Secure - all processing happens locally on your device",
      ]}
    />
  );
}

