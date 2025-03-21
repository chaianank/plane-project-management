"use client";

// mobx react lite
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";

// components
import { IssueBlockPriority } from "components/issues/board-views/block-priority";
import { IssueBlockState } from "components/issues/board-views/block-state";
import { IssueBlockDueDate } from "components/issues/board-views/block-due-date";
// interfaces
import { IIssue } from "types/issue";
import { RootStore } from "store/root";
import { useRouter } from "next/router";

export const IssueKanBanBlock = observer(({ issue }: { issue: IIssue }) => {
  const { project: projectStore, issueDetails: issueDetailStore }: RootStore = useMobxStore();

  // router
  const router = useRouter();
  const { workspace_slug, project_slug, board, priorities, states, labels } = router.query as {
    workspace_slug: string;
    project_slug: string;
    board: string;
    priorities: string;
    states: string;
    labels: string;
  };

  const handleBlockClick = () => {
    issueDetailStore.setPeekId(issue.id);
    const params: any = { board: board, peekId: issue.id };
    if (states && states.length > 0) params.states = states;
    if (priorities && priorities.length > 0) params.priorities = priorities;
    if (labels && labels.length > 0) params.labels = labels;
    router.push(
      {
        pathname: `/${workspace_slug}/${project_slug}`,
        query: { ...params },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="py-2 px-3 flex flex-col gap-1.5 bg-custom-background-100 rounded shadow-custom-shadow-2xs border-[0.5px] border-custom-border-200 space-y-2 text-sm">
      {/* id */}
      <div className="text-xs text-custom-text-300 break-words">
        {projectStore?.project?.identifier}-{issue?.sequence_id}
      </div>

      {/* name */}
      <h6
        onClick={handleBlockClick}
        role="button"
        className="text-sm font-medium break-words line-clamp-2 cursor-pointer"
      >
        {issue.name}
      </h6>

      <div className="relative flex-grow flex items-end gap-2 w-full overflow-x-scroll hide-horizontal-scrollbar">
        {/* priority */}
        {issue?.priority && (
          <div className="flex-shrink-0">
            <IssueBlockPriority priority={issue?.priority} />
          </div>
        )}
        {/* state */}
        {issue?.state_detail && (
          <div className="flex-shrink-0">
            <IssueBlockState state={issue?.state_detail} />
          </div>
        )}
        {/* due date */}
        {issue?.target_date && (
          <div className="flex-shrink-0">
            <IssueBlockDueDate due_date={issue?.target_date} group={issue?.state_detail?.group} />
          </div>
        )}
      </div>
    </div>
  );
});
