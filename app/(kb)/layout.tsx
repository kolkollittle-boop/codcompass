import SidebarTree from '@/components/SidebarTree';

export default function KbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarTree />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
