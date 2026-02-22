'use client';

import { useEffect, useState } from 'react';
import { formatEuro } from '@/lib/format';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);

  async function refresh() {
    setOverview(await (await fetch('/api/admin/overview')).json());
    setUsers(await (await fetch('/api/admin/users')).json());
    setDrinks(await (await fetch('/api/admin/drinks')).json());
    setDebts(await (await fetch('/api/admin/debts')).json());
  }

  useEffect(() => { if (loggedIn) refresh(); }, [loggedIn]);

  if (!loggedIn) return <form className="mx-auto max-w-md space-y-3 rounded bg-white p-6" onSubmit={async(e)=>{e.preventDefault(); const f=new FormData(e.currentTarget); const r=await fetch('/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})}); if(r.ok) setLoggedIn(true); else alert('Login fehlgeschlagen');}}><h1 className="text-2xl font-bold">Admin Login</h1><input name="email" placeholder="E-Mail" className="w-full rounded border p-2"/><input name="password" type="password" placeholder="Passwort" className="w-full rounded border p-2"/><button className="rounded bg-blue-700 px-4 py-2 text-white">Einloggen</button></form>;

  return <div className="space-y-6"><h1 className="text-3xl font-bold">Dashboard</h1>
    <section className="rounded bg-white p-4"><h2 className="font-bold">Übersicht</h2><p>Offene Summe: {formatEuro(overview?.openTotalCents ?? 0)}</p><p>Buchungen heute: {overview?.bookingsToday ?? 0}</p><p>Letzte 7 Tage: {overview?.bookingsLast7Days ?? 0}</p></section>
    <section className="rounded bg-white p-4"><h2 className="font-bold">Benutzer</h2><ul>{users.map((u)=><li key={u.id}>{u.name} ({u.active ? 'aktiv':'inaktiv'})</li>)}</ul></section>
    <section className="rounded bg-white p-4"><h2 className="font-bold">Getränke</h2><ul>{drinks.map((d)=><li key={d.id}>{d.name} - {formatEuro(d.priceCents)}</li>)}</ul></section>
    <section className="rounded bg-white p-4"><h2 className="font-bold">Schuldenrangliste</h2><ol>{debts.map((d)=><li key={d.user.id}>#{d.rank} {d.user.name}: {formatEuro(d.openCents)} ({d.openMonths} Monate)</li>)}</ol></section>
  </div>;
}
