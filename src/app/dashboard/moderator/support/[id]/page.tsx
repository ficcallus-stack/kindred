import { db } from "@/db";
import { tickets, ticketMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateTicketStatus } from "../actions";

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
    with: {
      user: {
        with: {
          nannyProfile: true, // For photos
        }
      }
    }
  });

  if (!ticket) {
    notFound();
  }

  const messages = await db.query.ticketMessages.findMany({
    where: eq(ticketMessages.ticketId, id),
    orderBy: [desc(ticketMessages.createdAt)],
    with: {
      sender: true,
    }
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/dashboard/moderator/support" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary mb-6 transition-colors">
        <MaterialIcon name="arrow_back" className="text-xl" /> Back to Queue
      </Link>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm mb-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-container relative overflow-hidden flex items-center justify-center text-primary/30 shadow-sm">
              {ticket.user?.nannyProfile?.photos?.[0] ? (
                <Image src={ticket.user.nannyProfile.photos[0]} alt="Avatar" fill className="object-cover" />
              ) : (
                <MaterialIcon name="person" className="text-5xl" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-headline text-3xl font-extrabold text-primary">{ticket.title}</h1>
              </div>
               <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                 <span>Reported by {ticket.user?.fullName}</span>
                 <span>•</span>
                 <span className="uppercase tracking-widest text-[10px]">{ticket.user?.role}</span>
               </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-widest">
              {ticket.status.replace("_", " ")}
            </span>
            <span className="text-xs font-bold text-slate-400">{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-surface-container/30 rounded-2xl p-6 text-on-surface-variant mb-8 border border-outline-variant/10">
          <h3 className="font-bold text-primary mb-2 text-sm uppercase tracking-wider">Description</h3>
          <p className="leading-relaxed">{ticket.description || "No further details provided."}</p>
        </div>

        <div className="flex gap-4 border-t border-outline-variant/10 pt-6">
          <form action={async () => {
             "use server";
             await updateTicketStatus(id, "in_progress");
          }}>
            <button className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all">Mark In-Progress</button>
          </form>
          <form action={async () => {
             "use server";
             await updateTicketStatus(id, "resolved");
          }}>
            <button className="px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all">Resolve Ticket</button>
          </form>
        </div>
      </div>

      {/* Basic discussion view */}
      <div className="space-y-6">
        <h3 className="font-headline text-xl font-bold text-primary px-2">Discussion Logs</h3>
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
               {msg.sender?.fullName?.charAt(0) || "U"}
             </div>
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <h4 className="font-bold text-sm text-primary">{msg.sender?.fullName}</h4>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(msg.createdAt).toLocaleString()}</span>
               </div>
               <p className="text-sm text-on-surface-variant">{msg.content}</p>
             </div>
          </div>
        )) : (
          <p className="text-sm text-slate-400 italic px-2">No messages logged for this ticket yet.</p>
        )}
      </div>
    </div>
  );
}
