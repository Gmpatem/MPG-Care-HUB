"use client";

import { useEffect, useState } from "react";
import { WorkspaceLoadingState } from "@/components/layout/workspace-loading-state";
import { SlowNetworkHint } from "@/components/feedback/slow-network-banner";

/**
 * HospitalWorkspaceLoading - Consistent loading state for all hospital workspaces
 * 
 * This uses the shared WorkspaceLoadingState component to ensure
 * all workspace pages have a consistent loading experience.
 * 
 * Features (Pack L2 - Low-bandwidth UX):
 * - Stable skeleton layout to prevent layout shift
 * - Slow network detection and hint after 3 seconds
 * - Maintains visual structure during loading
 */
export default function HospitalWorkspaceLoading() {
  const [loadingStartTime] = useState(Date.now());
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    // Show slow network hint after 3 seconds
    const timer = setTimeout(() => {
      setShowSlowHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadingDuration = Date.now() - loadingStartTime;

  return (
    <main className="space-y-4 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      {/* Main loading skeleton */}
      <WorkspaceLoadingState layout="dashboard" />
      
      {/* Slow network hint - appears after threshold */}
      {showSlowHint && (
        <div className="flex justify-center">
          <SlowNetworkHint loadingDuration={loadingDuration} />
        </div>
      )}
    </main>
  );
}
