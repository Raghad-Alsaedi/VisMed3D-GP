import type { Metadata } from "next";
import "./globals.css";
import SideBarDoctor from "@/components/SideBarDoctor";
import { LOG_IN } from "@/constant";
import Login from "@/components/Login";



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
      
      <body >
        <main >
           {children}
        </main>
        
      </body>
    </html>
  );
}
