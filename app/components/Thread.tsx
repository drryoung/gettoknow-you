export function Thread({ className = "" }: { className?: string }) {
  return (
    <svg className={`thread ${className}`} viewBox="0 0 1200 360" aria-hidden="true">
      <path className="thread-path--soup" d="M20 80 C220 10, 300 220, 500 145 S780 40, 1180 130" />
      <path className="thread-path--rice" d="M40 240 C260 320, 350 100, 560 215 S850 330, 1160 210" />
      <path className="thread-path--stew" d="M420 145 C520 160, 600 90, 705 120" />
      <path className="thread-path--dessert" d="M560 215 C650 230, 730 170, 840 185" />
      <path className="thread-path--fruit" d="M180 120 C320 80, 480 200, 640 160 S920 280, 1100 200" />
    </svg>
  );
}
