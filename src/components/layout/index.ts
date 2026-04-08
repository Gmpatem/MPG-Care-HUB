// Workspace Page Shell Components
export {
  WorkspacePageShell,
  WorkspaceStatsStrip,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
  WorkspaceSection,
  WorkspaceDetailLayout,
  WorkspaceDetailSplit,
  type WorkspacePageShellProps,
  type WorkspaceStatsStripProps,
  type WorkspaceTwoColumnLayoutProps,
  type WorkspaceContentStackProps,
  type WorkspaceSectionProps,
  type WorkspaceDetailLayoutProps,
  type WorkspaceDetailSplitProps,
} from "./workspace-page-shell";

// Workspace Stat Card (enhanced with KPI interpretation)
export {
  WorkspaceStatCard,
  type WorkspaceStatCardProps,
  type WorkspaceStatCardTone,
  type WorkspaceStatCardAction,
} from "./workspace-stat-card";

// Workspace Navigation Components
export {
  WorkspaceBreadcrumbs,
  BackLink,
  PageIdentity,
  type BreadcrumbItem,
  type WorkspaceBreadcrumbsProps,
  type BackLinkProps,
  type PageIdentityProps,
} from "./workspace-breadcrumbs";

// Workspace Header Components
export {
  WorkspacePageHeader,
  type WorkspacePageHeaderProps,
} from "./workspace-page-header";

// Workflow Components
export {
  WorkflowStepCard,
  WorkflowStepList,
  type WorkflowStepStatus,
  type WorkflowStepCardProps,
  type WorkflowStepListProps,
} from "./workflow-step-card";

// Progressive Disclosure Components
export {
  DetailPeekCard,
  QuickPeek,
  type DetailPeekCardProps,
  type PeekMetaItem,
} from "./detail-peek-card";

export {
  ProgressiveDisclosure,
  InlineDisclosure,
  SectionDisclosure,
  type ProgressiveDisclosureProps,
  type InlineDisclosureProps,
  type SectionDisclosureProps,
} from "./progressive-disclosure";

export {
  PeekSummary,
  CompactPeek,
  PeekStack,
  PeekBadge,
  type PeekSummaryProps,
  type PeekSummaryItem,
  type CompactPeekProps,
  type PeekStackProps,
  type PeekBadgeProps,
} from "./peek-summary";

// Awareness Components (Alerts, Activity, Notifications)
export {
  AttentionPanel,
  CompactAlert,
  BlockerAlert,
  type AttentionItem,
  type AttentionPanelProps,
  type AlertTone,
} from "./attention-panel";

export {
  ActivityFeed,
  CompactActivity,
  ActivityTimeline,
  type ActivityItem,
  type ActivityType,
  type ActivityFeedProps,
} from "./activity-feed";

// Timeline Components (Pack I2)
export {
  TimelineFeed,
  CompactTimeline,
  TimelineSection,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineFeedProps,
} from "./timeline-feed";

// KPI Dashboard Components (Pack J1)
export {
  KpiCard,
  KpiSummaryStrip,
  KpiMetricGroup,
  EmptyKpiState,
  type KpiCardProps,
  type KpiTone,
  type KpiAction,
  type KpiSummaryStripProps,
  type KpiMetricGroupProps,
  type EmptyKpiStateProps,
} from "./kpi-card";

// Today View / Operational Prioritization Components (Pack J2)
export {
  TodayViewPanel,
  CompactTodayBadge,
  TodaySummaryStrip,
  type TodayViewPanelProps,
  type TodayItem,
  type TodayItemTone,
  type TodaySummaryStripProps,
} from "./today-view-panel";

// Workflow Handoff / Continuity Components (Pack K1)
export {
  WorkflowHandoffCard,
  HandoffHint,
  WorkflowStageSummary,
  type WorkflowHandoffCardProps,
  type WorkflowStage,
  type HandoffDirection,
  type WorkflowHandoffStep,
  type HandoffHintProps,
  type WorkflowStageSummaryProps,
} from "./workflow-handoff-card";

// Patient Journey / Episode of Care Components (Pack K2)
export {
  PatientJourneyStrip,
  EpisodeOfCareCard,
  CareJourneySummary,
  buildPatientJourneyFromContext,
  type PatientJourneyStripProps,
  type PatientJourneyCardProps,
  type CareJourneySummaryProps,
  type JourneyStage,
  type JourneyStageStatus,
  type JourneyStageInfo,
} from "./patient-journey-strip";
