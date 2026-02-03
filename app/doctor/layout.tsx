import SideBarDoctor from "@/components/SideBarDoctor";

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div className="flex min-h-screen">
      <SideBarDoctor />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
