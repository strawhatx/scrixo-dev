import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scrixo | Editor",
  description: "Edit your PDF document for free no signup required",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
