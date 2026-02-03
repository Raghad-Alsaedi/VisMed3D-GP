import SideBarTech from "@/components/SideBarTech";

export default function RadioTechLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
        <main className="relative overflow-hidden">
          <SideBarTech />
          {children}
        </main>
     
  );
}
