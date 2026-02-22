'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDate, formatEuro } from '@/lib/format';

type User = { id: string; name: string; photoUrl?: string | null };
type Drink = { id: string; name: string; priceCents: number; imageUrl?: string | null };

const DB_NAME = 'kaffeekasse';

async function queueOffline(item: any) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('queue', { keyPath: 'clientUuid' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('queue', 'readwrite');
    tx.objectStore('queue').put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export default function KioskPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'drinks'|'invoice'>('drinks');
  const [invoice, setInvoice] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  useEffect(() => { fetch('/api/kiosk/users').then((r)=>r.json()).then(setUsers); fetch('/api/kiosk/drinks').then((r)=>r.json()).then(setDrinks); }, []);
  useEffect(() => {
    if (!selectedUser) return;
    const timer = setTimeout(() => setSelectedUser(null), 30000);
    return () => clearTimeout(timer);
  }, [selectedUser, tab, selectedDrink]);

  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore('queue', { keyPath: 'clientUuid' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const all = await new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction('queue', 'readonly');
        const req = tx.objectStore('queue').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      for (const item of all) {
        await fetch('/api/kiosk/consume', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(item) });
      }
      const tx = db.transaction('queue', 'readwrite'); tx.objectStore('queue').clear();
    };
    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, []);

  const subtotal = useMemo(() => (selectedDrink ? selectedDrink.priceCents * qty : 0), [selectedDrink, qty]);

  if (!selectedUser) return <div><h1 className="mb-4 text-2xl font-bold">Benutzer wählen</h1><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{users.map((u)=><button key={u.id} className="rounded bg-white p-6 text-xl shadow" onClick={()=>setSelectedUser(u)}>{u.name}</button>)}</div></div>;

  async function book() {
    if (!selectedUser || !selectedDrink) return;
    const payload = { userId: selectedUser.id, drinkId: selectedDrink.id, qty, clientUuid: crypto.randomUUID() };
    if (navigator.onLine) await fetch('/api/kiosk/consume', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    else await queueOffline(payload);
    alert('Buchung erfolgreich');
    setSelectedDrink(null); setQty(1);
  }

  return <div className="space-y-4"><h1 className="text-2xl font-bold">{selectedUser.name}</h1><div className="flex gap-2"><button className="rounded bg-blue-700 px-3 py-2 text-white" onClick={()=>setTab('drinks')}>Getränke</button><button className="rounded bg-slate-700 px-3 py-2 text-white" onClick={async()=>{setTab('invoice');setInvoice(await (await fetch(`/api/kiosk/user/${selectedUser.id}/invoices`)).json());}}>Rechnung</button><button className="rounded bg-red-600 px-3 py-2 text-white ml-auto" onClick={()=>setSelectedUser(null)}>Beenden</button></div>
    {tab==='drinks' ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{drinks.map((d)=><button key={d.id} className="rounded bg-white p-4 shadow" onClick={()=>setSelectedDrink(d)} onContextMenu={async(e)=>{e.preventDefault(); const rec=await (await fetch(`/api/kiosk/drink/${d.id}/recent`)).json(); alert(rec.map((r:any)=>`${r.user.name} ${formatDate(new Date(r.createdAt))} x${r.qty}`).join('\n'));}}>{d.name}<div>{formatEuro(d.priceCents)}</div></button>)}</div> : <div className="rounded bg-white p-4">{invoice?.current ? <div>Aktuell: {formatEuro(invoice.current.totalCents)} ({invoice.current.paid ? 'bezahlt':'ausständig'})</div> : 'Keine Rechnung'}<ul>{invoice?.history?.map((h:any)=><li key={h.id}>{h.month}/{h.year}: {formatEuro(h.totalCents)}</li>)}</ul></div>}
    {selectedDrink && <div className="fixed inset-0 grid place-items-center bg-black/40"><div className="rounded bg-white p-6"><h2 className="text-xl font-bold">{selectedDrink.name}</h2><p>Einzelpreis: {formatEuro(selectedDrink.priceCents)}</p><div className="my-3 flex items-center gap-2"><button className="rounded bg-slate-200 px-3 py-1" onClick={()=>setQty(Math.max(1, qty-1))}>-</button><span>{qty}</span><button className="rounded bg-slate-200 px-3 py-1" onClick={()=>setQty(qty+1)}>+</button></div><p>Zwischensumme: {formatEuro(subtotal)}</p><div className="mt-4 flex gap-2"><button className="rounded bg-green-700 px-3 py-2 text-white" onClick={book}>Buchen</button><button className="rounded bg-slate-500 px-3 py-2 text-white" onClick={()=>setSelectedDrink(null)}>Abbrechen</button></div></div></div>}
  </div>;
}
