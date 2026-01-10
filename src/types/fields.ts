export const FIELD_KINDS = ["signature", "text", "checkbox", "radio", "select", "date", "list"] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];


