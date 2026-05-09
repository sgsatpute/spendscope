import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-paper)' }}>
      <div className="text-center px-6">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-3xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Audit not found</h1>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
          This audit may have expired or the link is incorrect.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
          style={{ background: 'var(--color-accent)', textDecoration: 'none' }}
        >
          Run a new audit →
        </Link>
      </div>
    </main>
  );
}
