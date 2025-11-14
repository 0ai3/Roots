import type { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  contentClassName?: string;
};

export default function DashboardPageLayout({
  children,
  title,
  description,
  contentClassName,
}: Props) {
  const baseClass =
    "flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg text-white";
  const sectionClass = contentClassName
    ? `${baseClass} ${contentClassName}`
    : baseClass;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <DashboardSidebar />
        <section className={sectionClass}>
          {(title || description) && (
            <header className="mb-6 space-y-2">
              {title && (
                <h1 className="text-3xl font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-white/70">{description}</p>
              )}
            </header>
          )}
          {children}
        </section>
      </div>
    </main>
  );
}
