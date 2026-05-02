import SidebarTree from '@/components/SidebarTree';

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--codcompass-background))]">
      <SidebarTree />
      <main className="flex-1 bg-[hsl(var(--codcompass-background))] max-w-7xl w-full mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
