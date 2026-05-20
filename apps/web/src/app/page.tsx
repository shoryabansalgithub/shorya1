'use client';

export default function Home() {
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard';
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to DukaanAI</h1>
        <p className="text-muted-foreground mb-8">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
