import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisMed3D",
  description: "Interactive 3D Visualization of Medical Images Using WebGL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
