import type { Metadata } from "next";
import { signatureFontClassName } from "@/lib/signature-fonts";

export const metadata: Metadata = {
  title: "Scrixo | Editor",
  description: "Edit your PDF document for free no signup required",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={signatureFontClassName}>{children}</div>;
}
