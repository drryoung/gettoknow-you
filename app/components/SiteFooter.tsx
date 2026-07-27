export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="footer shell">
      <div>
        <b>GetToKnow.You</b>
        <p>A public commons for meaningful conversation and relationship.</p>
      </div>
      <nav className="footer-nav" aria-label="Footer">
        <a href="/start-here">Start Here</a>
        <a href="/explore">Explore</a>
        <a href="/themes">Themes</a>
        <a href="/library">Library</a>
        <a href="/try">Try</a>
        <a href="/meet">Meet</a>
        <a href="/about">About</a>
        <a href="/charter">Community Charter</a>
        <a href="https://www.mandarinos.app/" rel="noopener noreferrer">
          MandarinOS.app
        </a>
      </nav>
      {note ? <small>{note}</small> : null}
    </footer>
  );
}
