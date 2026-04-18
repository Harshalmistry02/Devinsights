import { requireAuth } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/LogoutButton";
import { Shield, Bell, Key, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Settings Page — SpaceX-inspired, minimal achromatic design
 */
export default async function SettingsPage() {
  const session = await requireAuth();
  const { user } = session;

  return (
    <div className="app-canvas">
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px clamp(16px, 4vw, 48px)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "20px",
              opacity: 0.4,
              transition: "opacity 0.2s ease",
            }}
            className="text-micro"
            
            
          >
            <ArrowLeft size={11} />
            Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="text-micro" style={{ marginBottom: "8px", opacity: 0.4 }}>Account</p>
              <h1 className="text-section-head">Settings</h1>
            </div>
            <LogoutButton />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(240,240,250,0.06)", borderRadius: "var(--radius-sharp)", overflow: "hidden" }}>
          {/* Account Settings */}
          <SettingsSection
            icon={<Shield size={14} />}
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
            icon={<Key size={14} />}
            title="Security"
            description="Manage your security and authentication settings"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(240,240,250,0.05)", borderRadius: "var(--radius-sharp)", overflow: "hidden" }}>
              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p className="text-caption-bold" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>
                    Authentication Method
                  </p>
                  <p className="text-micro" style={{ opacity: 0.35 }}>
                    You are signed in with GitHub OAuth
                  </p>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    background: "rgba(134,239,172,0.06)",
                    border: "1px solid rgba(134,239,172,0.15)",
                    borderRadius: "2px",
                  }}
                  className="text-micro"
                >
                  Active
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p className="text-caption-bold" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Session</p>
                  <p className="text-micro" style={{ opacity: 0.35 }}>
                    Your session is active and secure
                  </p>
                </div>
                <LogoutButton variant="minimal" />
              </div>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            icon={<Bell size={14} />}
            title="Notifications"
            description="Configure how you receive notifications"
          >
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                opacity: 0.3,
              }}
            >
              <p className="text-caption">Notification settings coming soon</p>
            </div>
          </SettingsSection>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            background: "rgba(252,165,165,0.03)",
            border: "1px solid rgba(252,165,165,0.1)",
            borderRadius: "var(--radius-sharp)",
          }}
        >
          <p
            className="text-caption-bold"
            style={{ color: "rgba(252,165,165,0.6)", marginBottom: "8px" }}
          >
            Danger Zone
          </p>
          <p className="text-micro" style={{ opacity: 0.3, marginBottom: "16px" }}>
            These actions are irreversible. Please be careful.
          </p>
          <button
            disabled
            style={{
              padding: "10px 20px",
              background: "rgba(252,165,165,0.04)",
              border: "1px solid rgba(252,165,165,0.12)",
              borderRadius: "2px",
              color: "rgba(252,165,165,0.4)",
              cursor: "not-allowed",
              opacity: 0.5,
            }}
            className="text-caption"
          >
            Delete Account (Coming Soon)
          </button>
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
    <div style={{ background: "rgba(0,0,0,0.6)" }}>
      {/* Section header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(240,240,250,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ opacity: 0.3 }}>{icon}</span>
        <div>
          <p className="text-caption-bold" style={{ fontSize: "0.813rem" }}>{title}</p>
          <p className="text-micro" style={{ opacity: 0.3, marginTop: "2px" }}>{description}</p>
        </div>
      </div>
      {/* Section content */}
      <div style={{ padding: "20px" }}>{children}</div>
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
    <div
      style={{
        padding: "14px 16px",
        background: "rgba(240,240,250,0.02)",
        border: "1px solid rgba(240,240,250,0.05)",
        borderRadius: "var(--radius-sharp)",
        marginBottom: "8px",
      }}
      className="last-mb-0"
    >
      <style>{`.last-mb-0:last-child { margin-bottom: 0; }`}</style>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p className="text-micro" style={{ opacity: 0.35, marginBottom: "4px" }}>{label}</p>
          {description && (
            <p className="text-micro" style={{ opacity: 0.2, marginBottom: "4px" }}>{description}</p>
          )}
          <p className="text-caption" style={{ opacity: 0.7 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
