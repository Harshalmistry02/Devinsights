import { requireAuth } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/LogoutButton";
import { Shield, Bell, Key } from "lucide-react";
import Link from "next/link";

/**
 * Settings Page
 * Protected route - manages user settings
 */
export default async function SettingsPage() {
  const session = await requireAuth();
  const { user } = session;

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
              Settings
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <SettingsSection
            icon={<Shield />}
            title="Account Settings"
            description="Manage your account information and preferences"
          >
            <SettingItem
              label="Email Address"
              value={user.email || "Not provided"}
              description="Your email from GitHub"
            />
            <SettingItem
              label="GitHub Username"
              value={`@${user.username}` || "Not available"}
              description="Your GitHub username"
            />
            <SettingItem
              label="Display Name"
              value={user.name || "Not set"}
              description="Your display name"
            />
          </SettingsSection>

          {/* Security Settings */}
          <SettingsSection
            icon={<Key />}
            title="Security"
            description="Manage your security and authentication settings"
          >
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 font-medium mb-1">
                      Authentication Method
                    </h4>
                    <p className="text-sm text-slate-400">
                      You are signed in with GitHub OAuth
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 font-medium mb-1">Session</h4>
                    <p className="text-sm text-slate-400">
                      Your session is active and secure
                    </p>
                  </div>
                  <LogoutButton variant="minimal" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Notifications (Placeholder) */}
          <SettingsSection
            icon={<Bell />}
            title="Notifications"
            description="Configure how you receive notifications"
          >
            <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/20 text-center">
              <p className="text-slate-400">Notification settings coming soon</p>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span>⚠️</span> Danger Zone
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              These actions are irreversible. Please be careful.
            </p>
            <button
              disabled
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Section Component
function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-b border-slate-700/30 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-cyan-400">{icon}</div>
          <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
        </div>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Setting Item Component
function SettingItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/20 mb-4 last:mb-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-slate-300 font-medium mb-1">{label}</h4>
          {description && (
            <p className="text-sm text-slate-500 mb-2">{description}</p>
          )}
          <p className="text-slate-200">{value}</p>
        </div>
      </div>
    </div>
  );
}
