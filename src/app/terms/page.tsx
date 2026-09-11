import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service | Scrixo",
  description:
    "Terms for using Scrixo’s browser PDF signer, including what an electronic signature is and is not.",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 10, 2026">
      <p>
        These terms govern your use of Scrixo (scrixo.com) and the signing tool in your browser. By
        using the site, you agree to them. This is not legal advice. If you need advice about a
        specific document, talk to a lawyer.
      </p>

      <h2>What Scrixo does</h2>
      <p>
        Scrixo is a browser tool for adding a drawn, typed, or uploaded signature image to a PDF,
        then downloading the file. Guest signing runs on your device. The PDF is not uploaded to
        Scrixo’s servers for that flow. See the <Link href="/privacy">Privacy Policy</Link> for
        what we do collect (waitlist, feedback, and analytics).
      </p>

      <h2>Electronic signatures</h2>
      <p>
        Scrixo produces a standard electronic signature — your mark associated with the PDF. In the
        United States, the ESIGN Act and similar state laws (including UETA) recognize electronic
        signatures on many everyday documents when the signer intends to sign and agrees to do
        business electronically. In the EU, that kind of mark is typically a Simple Electronic
        Signature (SES) under eIDAS. Leases, NDAs, freelance contracts, permission slips, and offer
        letters are the kinds of documents this is commonly used for.
      </p>
      <p>
        Scrixo does not issue a cryptographic certificate, verify your identity, collect consent
        logs, or record an audit trail (IP address, signer identity, or certified timestamps)
        beyond basic file metadata in the downloaded PDF. If a dispute later turns on who signed
        and when, a tool with a full audit trail may be a better fit.
      </p>

      <h2>Documents that usually cannot be e-signed here</h2>
      <p>Do not rely on Scrixo for documents that require a different process, including:</p>
      <ul>
        <li>Wills and testamentary trusts</li>
        <li>Divorce, adoption, and other family-court documents</li>
        <li>Court orders and official court filings</li>
        <li>Many eviction, foreclosure, or utility-termination notices</li>
        <li>Documents that require in-person notarization or a specific e-sign vendor</li>
      </ul>
      <p>
        If the sender requires wet ink, a notary, or a named vendor, follow those instructions. You
        are responsible for choosing an appropriate process for the document.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Only sign documents you have the right to sign.</li>
        <li>Confirm the other party will accept an electronic signature on that file.</li>
        <li>Keep a copy of the downloaded PDF. We do not store guest files.</li>
        <li>Do not use the tool for unlawful, fraudulent, or harmful purposes.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        The service is provided as-is, free, and without a warranty that a given signature will be
        accepted or legally sufficient for your situation. We are not a law firm and are not a
        party to the documents you sign.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The “Last updated” date at the top will change when we do. The
        current version lives at{" "}
        <Link href="/terms">scrixo.com/terms</Link>.
      </p>
    </LegalPage>
  );
}
