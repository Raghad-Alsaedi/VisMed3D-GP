import SideBar from "@/components/SideBar";

export default function RadioTechLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative overflow-hidden">
      <SideBar />
      {children}
    </main>
  );
}
