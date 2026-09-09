export type FeedbackCategory =
  | "Bug"
  | "Feature request"
  | "Pain/friction"
  | "Positive"
  | "Question"
  | "Unclassified";

type Rule = { category: FeedbackCategory; weight: number; pattern: RegExp };

const RULES: Rule[] = [
  { category: "Bug", weight: 3, pattern: /\b(bug|broken|crash(?:ed|es|ing)?|error|fail(?:ed|s|ing)?|frozen|stuck|blank|glitch)\b/i },
  { category: "Bug", weight: 3, pattern: /\b(isn['’]?t|is not|doesn['’]?t|does not|won['’]?t|will not|can['’]?t|cannot)\s+(work|load|save|sign|download|open|submit)/i },
  { category: "Bug", weight: 2, pattern: /\bnot working\b|\bnothing happens\b|\bdoesn['’]?t work\b/i },
  { category: "Feature request", weight: 4, pattern: /\bi wish\b|\bwish (i|it|you|there)\b|\bwould be nice\b|\bnice if\b/i },
  { category: "Feature request", weight: 3, pattern: /\b(please add|could you add|can you add|add (a|an|the)|support for|ability to|option to)\b/i },
  { category: "Feature request", weight: 3, pattern: /\bsend (this |it |the (pdf|file|document) )?to someone\b|\bsomeone else to sign\b|\brequest (a )?sign/i },
  { category: "Pain/friction", weight: 3, pattern: /\bhad to\b|\bended up\b|\bworkaround\b|\btoo many steps\b|\btook (me|too)\b/i },
  { category: "Pain/friction", weight: 2, pattern: /\b(annoying|frustrating|painful|confusing|hassle)\b/i },
  { category: "Positive", weight: 3, pattern: /\b(love|loved|awesome|amazing|perfect|excellent)\b/i },
  { category: "Positive", weight: 2, pattern: /\b(thank you|thanks|great|worked (well|perfectly)|so much (easier|faster))\b/i },
  { category: "Question", weight: 3, pattern: /^(how (do|can|to)|where (is|do|can)|what (does|is)|why (does|is|can['’]?t)|can i)\b/i },
  { category: "Question", weight: 2, pattern: /\bhow do i\b|\bwhere do i\b|\bwhat does\b|\bam i supposed to\b/i },
];

export function classifyFeedback(message: string): FeedbackCategory {
  const text = message.trim();
  if (!text) return "Unclassified";

  const scores = new Map<FeedbackCategory, number>();
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
    }
  }

  let best: FeedbackCategory = "Unclassified";
  let bestScore = 0;
  for (const [category, score] of scores) {
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : "Unclassified";
}
