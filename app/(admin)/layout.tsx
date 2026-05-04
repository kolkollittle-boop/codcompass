/**
 * Admin console: CloudQuery-style dark shell (matches dashboard / docs marketing).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cq-marketing docs-scroll flex min-h-screen flex-col bg-docs-bg text-docs-body antialiased">
      {children}
    </div>
  );
}
