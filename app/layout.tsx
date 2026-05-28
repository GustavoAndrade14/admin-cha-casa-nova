import type { Metadata } from "next";
import { Inter, Lato, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner"; // Importar Sonner
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato"
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Admin - Chá de Casa Nova",
  description: "Painel administrativo da lista de casamento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${lato.variable} ${playfair.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              color: '#fff',
            },
            className: 'font-sans',
          }}
        />
      </body>
    </html>
  );
}