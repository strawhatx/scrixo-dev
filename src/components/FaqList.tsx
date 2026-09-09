import type { FAQItem } from "@/lib/seo-content";
import { LinkedCopy } from "@/components/LinkedCopy";

/** Always-visible Q&A so crawlers count the answers (accordions often hide them). */
export function FaqList({ faqs, className }: { faqs: FAQItem[]; className?: string }) {
  return (
    <dl className={className}>
      {faqs.map((faq) => (
        <div key={faq.question} className="border-b border-border py-5 first:pt-0 last:border-b-0">
          <dt className="text-base sm:text-lg font-semibold text-foreground">{faq.question}</dt>
          <dd className="mt-2 text-muted-foreground leading-relaxed">
            <LinkedCopy text={faq.answer} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
