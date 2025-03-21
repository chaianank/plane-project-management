import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { ModuleIssueQuickActions } from "components/issues";
// types
import { IIssue } from "types";
import { EIssueActions } from "../../types";
import { BaseCalendarRoot } from "../base-calendar-root";

export const ModuleCalendarLayout: React.FC = observer(() => {
  const {
    moduleIssues: moduleIssueStore,
    moduleIssuesFilter: moduleIssueFilterStore,
    moduleIssueCalendarView: moduleIssueCalendarViewStore,
    calendarHelpers: { handleDragDrop: handleCalenderDragDrop },
  } = useMobxStore();

  const router = useRouter();
  const { workspaceSlug, projectId, moduleId } = router.query as {
    workspaceSlug: string;
    projectId: string;
    moduleId: string;
  };

  const issueActions = {
    [EIssueActions.UPDATE]: async (issue: IIssue) => {
      if (!workspaceSlug || !moduleId) return;
      await moduleIssueStore.updateIssue(workspaceSlug, issue.project, issue.id, issue, moduleId);
    },
    [EIssueActions.DELETE]: async (issue: IIssue) => {
      if (!workspaceSlug || !moduleId) return;
      await moduleIssueStore.removeIssue(workspaceSlug, issue.project, issue.id, moduleId);
    },
    [EIssueActions.REMOVE]: async (issue: IIssue) => {
      if (!workspaceSlug || !moduleId || !issue.bridge_id) return;
      await moduleIssueStore.removeIssueFromModule(workspaceSlug, issue.project, moduleId, issue.id, issue.bridge_id);
    },
  };

  const handleDragDrop = (source: any, destination: any, issues: IIssue[], issueWithIds: any) => {
    handleCalenderDragDrop(
      source,
      destination,
      workspaceSlug,
      projectId,
      moduleIssueStore,
      issues,
      issueWithIds,
      moduleId
    );
  };

  return (
    <BaseCalendarRoot
      issueStore={moduleIssueStore}
      issuesFilterStore={moduleIssueFilterStore}
      calendarViewStore={moduleIssueCalendarViewStore}
      QuickActions={ModuleIssueQuickActions}
      issueActions={issueActions}
      viewId={moduleId}
      handleDragDrop={handleDragDrop}
    />
  );
});
