// Signature hero element: a phone showing the business actually working —
// an Instagram DM sale closing, then the commission landing on WhatsApp.
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[330px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-slate-200 via-white to-emerald-50 blur-xl" aria-hidden="true" />
      <div className="relative rounded-[2.5rem] border-8 border-slate-900 bg-slate-50 shadow-2xl shadow-slate-300">
        {/* Phone header */}
        <div className="flex items-center gap-3 rounded-t-[2rem] border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-sm font-bold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">yourstore.pk</p>
            <p className="text-xs text-emerald-500">Active now</p>
          </div>
        </div>

        {/* Chat */}
        <div className="space-y-3 px-4 py-5 text-sm">
          <div className="bubble max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-slate-700 shadow-sm" style={{ animationDelay: "0.3s" }}>
            Is this watch available? 🙌
          </div>
          <div className="bubble ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-2.5 text-white shadow-sm" style={{ animationDelay: "0.9s" }}>
            Yes! Cash on delivery, anywhere in Pakistan 📦
          </div>
          <div className="bubble max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-slate-700 shadow-sm" style={{ animationDelay: "1.5s" }}>
            Order confirmed ✅
          </div>
          <div className="bubble mx-auto mt-2 w-fit rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700" style={{ animationDelay: "2.2s" }}>
            Order delivered by our team
          </div>
          <div className="bubble ml-auto max-w-[85%] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm" style={{ animationDelay: "2.9s" }}>
            <p className="text-xs font-medium text-emerald-600">Commission received</p>
            <p className="font-display text-lg font-bold text-emerald-700">+ Rs. 2,400</p>
          </div>
        </div>
      </div>
    </div>
  );
}
