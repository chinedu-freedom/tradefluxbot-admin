import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata = {
  title: "TradeFluxBot Admin Dashboard",
  description: "TradeFluxBot Dashboard Administration",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
