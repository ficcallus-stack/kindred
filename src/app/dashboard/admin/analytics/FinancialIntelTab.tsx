"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function FinancialIntelTab({ data }: { data: any }) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline">Financial Intelligence</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Real-time ledger overview and liability tracking.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold text-on-surface">
            <MaterialIcon name="calendar_today" className="text-sm" />
            Last 30 Days
            <MaterialIcon name="expand_more" className="text-sm" />
          </div>
          <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
            <MaterialIcon name="file_download" className="text-lg" />
            Export Ledger
          </button>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-6">
        {/* GMV */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant opacity-70">Gross Marketplace Volume</p>
                <h3 className="text-5xl font-extrabold text-primary mt-2">
                  ${data.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-green-600 font-bold">
                  <MaterialIcon name="trending_up" className="text-sm" />
                  <span>+14.2% vs prev. month</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold">LIVE</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 w-full flex items-end gap-1 mt-8">
            <div className="flex-1 bg-primary/10 rounded-t-lg h-[40%]"></div>
            <div className="flex-1 bg-primary/10 rounded-t-lg h-[45%]"></div>
            <div className="flex-1 bg-primary/10 rounded-t-lg h-[42%]"></div>
            <div className="flex-1 bg-primary/20 rounded-t-lg h-[55%]"></div>
            <div className="flex-1 bg-primary/20 rounded-t-lg h-[60%]"></div>
            <div className="flex-1 bg-primary/30 rounded-t-lg h-[50%]"></div>
            <div className="flex-1 bg-primary/40 rounded-t-lg h-[65%]"></div>
            <div className="flex-1 bg-primary/50 rounded-t-lg h-[75%]"></div>
            <div className="flex-1 bg-primary/60 rounded-t-lg h-[70%]"></div>
            <div className="flex-1 bg-primary/70 rounded-t-lg h-[85%]"></div>
            <div className="flex-1 bg-secondary-container rounded-t-lg h-[100%] shadow-lg shadow-secondary-container/20"></div>
          </div>
        </div>

        {/* Escrow & Wallet Liabilities */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-primary text-white p-8 rounded-[1.5rem] flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Escrow Liability</p>
              <h4 className="text-3xl font-extrabold mt-2">
                ${data.escrowLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <MaterialIcon name="account_balance_wallet" className="text-[10rem]" />
            </div>
            <div className="mt-8 relative z-10">
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                <div className="bg-secondary-container h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-white/60 text-xs">70% of peak historical capacity</p>
            </div>
          </div>

          <div className="bg-secondary-fixed text-on-secondary-fixed p-8 rounded-[1.5rem] flex flex-col justify-between h-full">
            <div>
              <p className="text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-widest">Current Wallet Liability</p>
              <h4 className="text-3xl font-extrabold mt-2">
                ${data.walletLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold">12,401 Wallets Active</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-low p-8 rounded-[1.5rem] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold font-headline">Commission Breakdown</h4>
            <MaterialIcon name="info" className="text-slate-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <MaterialIcon name="child_care" />
                </div>
                <div>
                  <p className="font-bold text-sm">Nanny Bookings (15%)</p>
                  <p className="text-xs text-on-surface-variant">Core service revenue</p>
                </div>
              </div>
              <span className="font-extrabold text-lg">${data.commissions.nannyBookings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm">
                  <MaterialIcon name="verified" />
                </div>
                <div>
                  <p className="font-bold text-sm">Premium Background Checks</p>
                  <p className="text-xs text-on-surface-variant">One-time processing fees</p>
                </div>
              </div>
              <span className="font-extrabold text-lg">${data.commissions.bgChecks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ARR & ABV */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm flex flex-col justify-between border-t-4 border-primary">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-70">Premium ARR</p>
            <h4 className="text-3xl font-extrabold text-primary mt-2">
              ${(data.premiumArr / 1000000).toFixed(1)}M
            </h4>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm flex flex-col justify-between border-t-4 border-secondary-container">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-70">Avg. Booking Value</p>
            <h4 className="text-3xl font-extrabold text-primary mt-2">
              ${data.avgBookingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
      </div>

      <section className="mt-16 bg-white rounded-[2rem] p-10 relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-extrabold text-primary font-headline">Recent Ledger Events</h3>
          <span className="text-sm font-bold text-primary-container cursor-pointer hover:underline">View Transaction Explorer</span>
        </div>
        <div className="divide-y divide-slate-100">
          {data.recentLedger.map((tx: any) => (
            <div key={tx.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-xs font-bold text-slate-400 w-20">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize">{tx.status} Payment</p>
                  <p className="text-xs text-on-surface-variant">Intent ID: {tx.stripePaymentIntentId || tx.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-primary">${(tx.amount/100).toFixed(2)}</p>
                <p className="text-[10px] uppercase font-bold text-green-600">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
