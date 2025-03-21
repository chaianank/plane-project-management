import { useRouter } from "next/router";
// components
import { ListProperties } from "./properties";
// ui
import { Spinner, Tooltip } from "@plane/ui";
// types
import { IIssue, IIssueDisplayProperties } from "types";
import { EIssueActions } from "../types";

interface IssueBlockProps {
  columnId: string;

  issue: IIssue;
  handleIssues: (issue: IIssue, action: EIssueActions) => void;
  quickActions: (group_by: string | null, issue: IIssue) => React.ReactNode;
  displayProperties: IIssueDisplayProperties | undefined;
  canEditProperties: (projectId: string | undefined) => boolean;
}

export const IssueBlock: React.FC<IssueBlockProps> = (props) => {
  const { columnId, issue, handleIssues, quickActions, displayProperties, canEditProperties } = props;
  // router
  const router = useRouter();
  const updateIssue = (group_by: string | null, issueToUpdate: IIssue) => {
    handleIssues(issueToUpdate, EIssueActions.UPDATE);
  };

  const handleIssuePeekOverview = () => {
    const { query } = router;

    router.push({
      pathname: router.pathname,
      query: { ...query, peekIssueId: issue?.id, peekProjectId: issue?.project },
    });
  };

  const canEditIssueProperties = canEditProperties(issue.project);

  return (
    <>
      <div className="text-sm p-3 relative bg-custom-background-100 flex items-center gap-3">
        {displayProperties && displayProperties?.key && (
          <div className="flex-shrink-0 text-xs text-custom-text-300 font-medium">
            {issue?.project_detail?.identifier}-{issue.sequence_id}
          </div>
        )}

        {issue?.tempId !== undefined && (
          <div className="absolute top-0 left-0 w-full h-full animate-pulse bg-custom-background-100/20 z-[99999]" />
        )}
        <Tooltip tooltipHeading="Title" tooltipContent={issue.name}>
          <div
            className="line-clamp-1 text-sm font-medium text-custom-text-100 w-full cursor-pointer"
            onClick={handleIssuePeekOverview}
          >
            {issue.name}
          </div>
        </Tooltip>

        <div className="ml-auto flex-shrink-0 flex items-center gap-2">
          {!issue?.tempId ? (
            <>
              <ListProperties
                columnId={columnId}
                issue={issue}
                isReadonly={!canEditIssueProperties}
                handleIssues={updateIssue}
                displayProperties={displayProperties}
              />
              {quickActions(!columnId && columnId === "null" ? null : columnId, issue)}
            </>
          ) : (
            <div className="w-4 h-4">
              <Spinner className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
