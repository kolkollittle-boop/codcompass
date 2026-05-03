/**
 * Shared marketing shell (CloudQuery-style dark base + green accents).
 * Visual references (in-repo assets / design):
 * - Fig. 1: Home hero / top promo
 * - Fig. 2: Pricing, About, etc.
 * - Fig. 3: Blog list (sidebar filters + search + card grid)
 * Fig. 4 (docs three-column + sidebar tree) lives in `app/(kb)/[locale]/kb/*` DocsLayout only—not this layout.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cq-marketing docs-scroll flex min-h-screen flex-col bg-docs-bg text-docs-body antialiased">
      {children}
    </div>
  );
}
