import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">KaffeeKasse</h1>
      <p>Bitte wählen:</p>
      <div className="flex gap-4">
        <Link href="/kiosk" className="rounded bg-blue-600 px-4 py-3 text-white">Kiosk</Link>
        <Link href="/admin" className="rounded bg-slate-800 px-4 py-3 text-white">Admin</Link>
      </div>
    </div>
  );
}
