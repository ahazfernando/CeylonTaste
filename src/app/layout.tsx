import { Providers } from "./providers";
import "./globals.css";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Ceylon Taste",
  description: "Authentic Sri Lankan Food & Beverages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}