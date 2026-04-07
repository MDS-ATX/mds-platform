import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import projectData from "@/data/project.json";
import { Footer } from "@/components/footer";
import { FUBPixel } from "@/lib/crm/pixel";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const poppinsHeading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: projectData.meta.title,
  description: projectData.meta.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${poppinsHeading.variable}`}>
      <body className="font-sans antialiased">
        <main>{children}</main>
        <Footer />
        <FUBPixel />
      </body>
    </html>
  );
}
