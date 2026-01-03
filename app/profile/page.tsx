import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { ProfileContent } from "./ProfileContent";
import { ProfileSkeleton } from "./ProfileSkeleton";

/**
 * Profile Page
 * Protected route - displays user profile information
 * 
 * Features:
 * - User identity display (name, username, avatar, email)
 * - GitHub connection status with last sync time
 * - Account actions (update profile, reconnect GitHub, logout)
 * - Loading states with skeleton UI
 * - Error handling with helpful messages
 * - Responsive and accessible design
 * - Route protection (authenticated users only)
 */
export default async function ProfilePage() {
  // Require authentication - redirects to login if not authenticated
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent session={session} />
      </Suspense>
    </div>
  );
}
