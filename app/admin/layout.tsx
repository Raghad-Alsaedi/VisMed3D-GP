import SideBar from "@/components/SideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SideBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}