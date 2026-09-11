import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy | Scrixo",
  description:
    "How Scrixo handles data: guest PDFs stay in your browser. Waitlist, feedback, and analytics are separate.",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 10, 2026">
      <p>
        Guest signing is built so the PDF never leaves your device. That is the important part.
        We still collect a little data when you choose to give it to us, or when the site is
        loaded. This page explains the difference.
      </p>

      <h2>Guest PDFs stay in your browser</h2>
      <p>
        When you drop a PDF into the signer without creating an account, the file is processed in
        your browser and downloaded from your browser. Scrixo’s servers do not receive the
        document contents in that flow. If you close the tab before downloading, we do not have a
        copy to give back.
      </p>

      <h2>What we do collect</h2>
      <ul>
        <li>
          <strong className="text-foreground">Waitlist email</strong> — if you join the waitlist,
          we store the email and a source tag (for example footer or post-download) in a
          spreadsheet we control.
        </li>
        <li>
          <strong className="text-foreground">Feedback</strong> — if you send feedback, we store
          the message, optional reply email, the page you were on, and your browser user agent.
        </li>
        <li>
          <strong className="text-foreground">Analytics</strong> — the site uses Google Analytics
          to see aggregate traffic (pages viewed, device type, approximate location). That is
          separate from your PDF.
        </li>
      </ul>
      <p>
        We do not sell this information. We use it to run the waitlist, fix the product, and
        understand whether the site is useful.
      </p>

      <h2>Cookies</h2>
      <p>
        Analytics may set cookies in your browser. The signing tool itself does not need an
        account cookie. Saved guest signatures, if you choose to keep one, are stored in your
        browser’s local storage on that device.
      </p>

      <h2>Processors</h2>
      <p>
        Waitlist and feedback rows are sent to Google Sheets via a webhook we configure. Analytics
        is processed by Google. Your guest PDF is not sent to those services.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Waitlist and feedback stay until we no longer need them for that purpose, or until you
        ask us to delete them. Analytics is retained according to our Google Analytics settings.
        Guest PDFs are not retained by us.
      </p>

      <h2>Your requests</h2>
      <p>
        To ask what we have, or to ask us to delete a waitlist or feedback email, use Feedback
        in the header and mention privacy.
      </p>

      <h2>Children</h2>
      <p>
        The site is a general-purpose tool. We do not knowingly collect waitlist or feedback
        information from children under 13. A parent or guardian may use the signer for a school
        form; that PDF still stays in the browser.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The “Last updated” date at the top will change when we do.
        Related rules for using the signer are in the <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
