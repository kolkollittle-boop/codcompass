import SidebarTree from '@/components/SidebarTree';

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--codcompass-background))] justify-center px-4 sm:px-6">
      <div className="flex w-full max-w-site min-h-screen">
        <SidebarTree />
        <main className="min-w-0 flex-1 bg-[hsl(var(--codcompass-background))] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
