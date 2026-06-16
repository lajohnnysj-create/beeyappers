// Wraps every /dashboard route. The only purpose is the `dash-root` class,
// which scopes the "form controls render at 16px" rule in globals.css so iOS
// Safari never zooms when an input is focused. The element uses display:contents
// (set in globals.css) so it adds no layout box of its own.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dash-root">{children}</div>;
}
