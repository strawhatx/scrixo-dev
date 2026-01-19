import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scrixo | Uploader",
  description: "Upload your PDF document for free no signup required",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
