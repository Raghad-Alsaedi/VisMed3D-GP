import SideBarTech from "@/components/SideBarTech";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="relative overflow-hidden">
          <SideBarTech />
          {children}
        </main>
      </body>
    </html>
  );
}
