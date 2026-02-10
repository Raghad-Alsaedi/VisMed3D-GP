import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";


export const metadata: Metadata = {
  title: "VisMed3D",
  description: "Interactive 3D Visualization of Medical Images Using WebGL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}