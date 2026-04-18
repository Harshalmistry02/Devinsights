import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { ProfileContent } from "./ProfileContent";
import { ProfileSkeleton } from "./ProfileSkeleton";

/**
 * Profile Page
 */
export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent session={session} />
      </Suspense>
    </main>
  );
}
