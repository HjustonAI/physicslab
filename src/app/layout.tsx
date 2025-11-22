import type { Metadata } from "next";
import { Cinzel, Roboto_Mono } from "next/font/google";
import "./globals.css";
import InstrumentPanel from "@/components/ui/InstrumentPanel";
import { ThemeProvider } from "@/context/ThemeContext";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcane Physics Lab",
  description: "Interactive physics simulations in a Hextech environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${robotoMono.variable}`}>
        <ThemeProvider>
          <InstrumentPanel />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
