import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";
import { ProfileContent } from "./ProfileContent";
import { ProfileSkeleton } from "./ProfileSkeleton";

/**
 * Profile Page
 */
export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <>
      <SpaceBackground variant="app" />

      <PageShell width="narrow">
        <main id="main-content" role="main" aria-label="Profile">
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileContent session={session} />
          </Suspense>
        </main>
      </PageShell>
    </>
  );
}
