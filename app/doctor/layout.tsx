import SideBar from "@/components/SideBar";

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
