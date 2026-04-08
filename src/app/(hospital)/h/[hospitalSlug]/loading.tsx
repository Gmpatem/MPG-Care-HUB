import { WorkspaceLoadingState } from "@/components/layout/workspace-loading-state";

/**
 * HospitalWorkspaceLoading - Consistent loading state for all hospital workspaces
 * 
 * This uses the shared WorkspaceLoadingState component to ensure
 * all workspace pages have a consistent loading experience.
 */
export default function HospitalWorkspaceLoading() {
  return (
    <main className="px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <WorkspaceLoadingState layout="dashboard" />
    </main>
  );
}
