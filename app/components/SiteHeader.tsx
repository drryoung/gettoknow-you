const NAV_ITEMS = [
  { href: "/explore", label: "Explore" },
  { href: "/library", label: "Library" },
  { href: "/try", label: "Try" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="nav shell">
      <a className="brand" href="/" aria-label="GetToKnow.You home">
        GetToKnow.You
      </a>
      <nav aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            {...(current === item.href ? { "aria-current": "page" as const } : {})}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
