import { SkipLink } from "@/app/skip-link";

export const metadata = { title: "Dashboard | AI Chatbot by Bleviq" };

// Wraps every /dashboard route. The `dash-root` class scopes the "form controls
// render at 16px" rule in globals.css so iOS Safari never zooms when an input is
// focused. The element uses display:contents (set in globals.css) so it adds no
// layout box of its own. SkipLink is the first focusable element for keyboard
// users (WCAG 2.4.1), jumping to each page's <main id="main-content">.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-root">
      <SkipLink />
      {children}
    </div>
  );
}
