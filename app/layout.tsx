import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LUMA — Curated Products",
  description: "A minimalist product storefront."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}