import SidebarTree from '@/components/SidebarTree';

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarTree />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
