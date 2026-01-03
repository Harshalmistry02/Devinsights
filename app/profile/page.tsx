import { requireAuth } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/LogoutButton";
import { Mail, Github, Calendar, Shield } from "lucide-react";
import Link from "next/link";

/**
 * Profile Page
 * Protected route - displays user profile information
 */
export default async function ProfilePage() {
  const session = await requireAuth();
  const { user } = session;

  // Format the creation date if available
  const joinedDate = user.email
    ? new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/30 p-8">
            <div className="flex items-center gap-6">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-32 h-32 rounded-full border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Github className="w-16 h-16 text-cyan-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-200 mb-2">
                  {user.name || user.username || "Anonymous User"}
                </h2>
                {user.username && (
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-lg"
                  >
                    <Github className="w-5 h-5" />
                    <span>@{user.username}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Account Information
              </h3>
              <div className="space-y-4">
                <InfoRow icon={<Mail />} label="Email" value={user.email || "Not provided"} />
                <InfoRow icon={<Github />} label="GitHub Username" value={user.username || "N/A"} />
                <InfoRow icon={<Calendar />} label="Account Created" value={joinedDate} />
              </div>
            </div>

            {/* Account Status */}
            <div className="border-t border-slate-700/30 pt-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">
                Account Status
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Active & Authenticated
                </span>
                <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub OAuth
                </span>
              </div>
            </div>

            {/* User ID (for development/debugging) */}
            {process.env.NODE_ENV === "development" && (
              <div className="border-t border-slate-700/30 pt-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">
                  Developer Info
                </h3>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-sm">
                    <span className="text-slate-500">User ID:</span>
                    <span className="text-slate-300 ml-2 font-mono">{user.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/settings"
            className="px-6 py-3 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-300 text-slate-300 hover:text-cyan-400"
          >
            Manage Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
      <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-700/30 text-cyan-400">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 mb-1">{label}</p>
        <p className="text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  );
}
