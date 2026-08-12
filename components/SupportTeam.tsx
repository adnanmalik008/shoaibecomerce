import { getContent, type TeamMember } from "@/lib/content";
import { localWaHref } from "@/lib/wa";
import { Icon } from "./icons";

// Deterministic avatar colors cycled by index
const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-cyan-600",
];

const memberWaLink = (member: TeamMember) =>
  localWaHref(
    member.phone,
    `Hi ${member.name}! I have a question about the 30-day Instagram eCommerce training.`
  );

export async function SupportTeam() {
  const { supportTeam } = await getContent();
  const managers = supportTeam.filter((m) => m.role === "Manager");
  const team = supportTeam.filter((m) => m.role !== "Manager");

  return (
    <div className="space-y-8">
      {managers.length > 0 && (
        <div>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Managers
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {managers.map((member, i) => (
              <a
                key={member.phone}
                href={memberWaLink(member)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-md transition-all hover:border-whatsapp hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  aria-hidden="true"
                >
                  {member.name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {member.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                      Manager
                    </span>
                  </span>
                  <span className="block text-sm text-slate-400">{member.phone}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
                  <Icon name="whatsapp" className="h-5 w-5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {team.length > 0 && (
        <div>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Support team
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <a
                key={member.phone}
                href={memberWaLink(member)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-whatsapp hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white ${AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length]}`}
                  aria-hidden="true"
                >
                  {member.name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">
                    {member.name}
                  </span>
                  <span className="block text-sm text-slate-500">{member.phone}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp-dark">
                  <Icon name="whatsapp" className="h-5 w-5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
