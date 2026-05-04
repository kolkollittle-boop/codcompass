/**
 * Dashboard area: same CloudQuery-style dark shell as marketing / KB top level.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cq-marketing docs-scroll flex min-h-screen flex-col bg-docs-bg text-docs-body antialiased">
      {children}
    </div>
  );
}
