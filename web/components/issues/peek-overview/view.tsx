import { FC, ReactNode, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import useSWR from "swr";
import { MoveRight, MoveDiagonal, Bell, Link2, Trash2 } from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import {
  DeleteArchivedIssueModal,
  DeleteIssueModal,
  IssueActivity,
  IssueUpdateStatus,
  PeekOverviewIssueDetails,
  PeekOverviewProperties,
} from "components/issues";
// ui
import { Button, CenterPanelIcon, CustomSelect, FullScreenPanelIcon, SidePanelIcon, Spinner } from "@plane/ui";
// types
import { IIssue } from "types";

interface IIssueView {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issue: IIssue | null;
  isLoading?: boolean;
  isArchived?: boolean;
  handleCopyText: (e: React.MouseEvent<HTMLButtonElement>) => void;
  redirectToIssueDetail: () => void;
  issueUpdate: (issue: Partial<IIssue>) => void;
  issueReactionCreate: (reaction: string) => void;
  issueReactionRemove: (reaction: string) => void;
  issueCommentCreate: (comment: any) => void;
  issueCommentUpdate: (comment: any) => void;
  issueCommentRemove: (commentId: string) => void;
  issueCommentReactionCreate: (commentId: string, reaction: string) => void;
  issueCommentReactionRemove: (commentId: string, reaction: string) => void;
  issueSubscriptionCreate: () => void;
  issueSubscriptionRemove: () => void;
  handleDeleteIssue: () => Promise<void>;
  children: ReactNode;
  disableUserActions?: boolean;
  showCommentAccessSpecifier?: boolean;
}

type TPeekModes = "side-peek" | "modal" | "full-screen";

const PEEK_OPTIONS: { key: TPeekModes; icon: any; title: string }[] = [
  {
    key: "side-peek",
    icon: SidePanelIcon,
    title: "Side Peek",
  },
  {
    key: "modal",
    icon: CenterPanelIcon,
    title: "Modal",
  },
  {
    key: "full-screen",
    icon: FullScreenPanelIcon,
    title: "Full Screen",
  },
];

export const IssueView: FC<IIssueView> = observer((props) => {
  const {
    workspaceSlug,
    projectId,
    issueId,
    issue,
    isLoading,
    isArchived,
    handleCopyText,
    redirectToIssueDetail,
    issueUpdate,
    issueReactionCreate,
    issueReactionRemove,
    issueCommentCreate,
    issueCommentUpdate,
    issueCommentRemove,
    issueCommentReactionCreate,
    issueCommentReactionRemove,
    issueSubscriptionCreate,
    issueSubscriptionRemove,
    handleDeleteIssue,
    children,
    disableUserActions = false,
    showCommentAccessSpecifier = false,
  } = props;

  const router = useRouter();
  const { peekIssueId } = router.query;

  const {
    user: { currentUser },
    issueDetail: { fetchIssueSubscription, getIssueActivity, getIssueReactions, getIssueSubscription, setPeekId },
  } = useMobxStore();

  const [peekMode, setPeekMode] = useState<TPeekModes>("side-peek");
  const [deleteIssueModal, setDeleteIssueModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<"submitting" | "submitted" | "saved">("saved");

  const updateRoutePeekId = () => {
    if (issueId != peekIssueId) {
      setPeekId(issueId);
      const { query } = router;
      router.push({
        pathname: router.pathname,
        query: { ...query, peekIssueId: issueId, peekProjectId: projectId },
      });
    }
  };

  const removeRoutePeekId = () => {
    const { query } = router;

    if (query.peekIssueId) {
      setPeekId(null);

      delete query.peekIssueId;
      delete query.peekProjectId;
      router.push({
        pathname: router.pathname,
        query: { ...query },
      });
    }
  };

  useSWR(
    workspaceSlug && projectId && issueId && peekIssueId && issueId === peekIssueId
      ? `ISSUE_PEEK_OVERVIEW_SUBSCRIPTION_${workspaceSlug}_${projectId}_${peekIssueId}`
      : null,
    async () => {
      if (workspaceSlug && projectId && issueId && peekIssueId && issueId === peekIssueId) {
        await fetchIssueSubscription(workspaceSlug, projectId, issueId);
      }
    }
  );

  const issueReactions = getIssueReactions || [];
  const issueActivity = getIssueActivity;
  const issueSubscription = getIssueSubscription || [];

  const currentMode = PEEK_OPTIONS.find((m) => m.key === peekMode);

  return (
    <>
      {issue && !isArchived && (
        <DeleteIssueModal
          isOpen={deleteIssueModal}
          handleClose={() => setDeleteIssueModal(false)}
          data={issue}
          onSubmit={handleDeleteIssue}
        />
      )}
      {issue && isArchived && (
        <DeleteArchivedIssueModal
          data={issue}
          isOpen={deleteIssueModal}
          handleClose={() => setDeleteIssueModal(false)}
          onSubmit={handleDeleteIssue}
        />
      )}
      <div className="w-full truncate !text-base">
        {children && (
          <div onClick={updateRoutePeekId} className="w-full cursor-pointer">
            {children}
          </div>
        )}

        {issueId === peekIssueId && (
          <div
            className={`fixed z-20 overflow-hidden bg-custom-background-100 flex flex-col transition-all duration-300 border border-custom-border-200 rounded 
          ${peekMode === "side-peek" ? `w-full md:w-[50%] top-0 right-0 bottom-0` : ``}
          ${peekMode === "modal" ? `top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-5/6 h-5/6` : ``}
          ${peekMode === "full-screen" ? `top-0 right-0 bottom-0 left-0 m-4` : ``}
          `}
            style={{
              boxShadow:
                "0px 4px 8px 0px rgba(0, 0, 0, 0.12), 0px 6px 12px 0px rgba(16, 24, 40, 0.12), 0px 1px 16px 0px rgba(16, 24, 40, 0.12)",
            }}
          >
            {/* header */}
            <div
              className={`relative flex items-center justify-between p-4 ${
                currentMode?.key === "full-screen" ? "border-b border-custom-border-200" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <button onClick={removeRoutePeekId}>
                  <MoveRight className="h-4 w-4 text-custom-text-400 hover:text-custom-text-200" />
                </button>

                <button onClick={redirectToIssueDetail}>
                  <MoveDiagonal className="h-4 w-4 text-custom-text-400 hover:text-custom-text-200" />
                </button>
                {currentMode && (
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <CustomSelect
                      value={currentMode}
                      onChange={(val: any) => setPeekMode(val)}
                      customButton={
                        <button type="button" className="">
                          <currentMode.icon className="h-4 w-4 text-custom-text-400 hover:text-custom-text-200" />
                        </button>
                      }
                    >
                      {PEEK_OPTIONS.map((mode) => (
                        <CustomSelect.Option key={mode.key} value={mode.key}>
                          <div
                            className={`flex items-center gap-1.5 ${
                              currentMode.key === mode.key
                                ? "text-custom-text-200"
                                : "text-custom-text-400 hover:text-custom-text-200"
                            }`}
                          >
                            <mode.icon className="h-4 w-4 flex-shrink-0 -my-1" />
                            {mode.title}
                          </div>
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-x-4">
                <IssueUpdateStatus isSubmitting={isSubmitting} />
                <div className="flex items-center gap-4">
                  {issue?.created_by !== currentUser?.id &&
                    !issue?.assignees.includes(currentUser?.id ?? "") &&
                    !router.pathname.includes("[archivedIssueId]") && (
                      <Button
                        size="sm"
                        prependIcon={<Bell className="h-3 w-3" />}
                        variant="outline-primary"
                        className="hover:!bg-custom-primary-100/20"
                        onClick={() =>
                          issueSubscription && issueSubscription.subscribed
                            ? issueSubscriptionRemove()
                            : issueSubscriptionCreate()
                        }
                      >
                        {issueSubscription && issueSubscription.subscribed ? "Unsubscribe" : "Subscribe"}
                      </Button>
                    )}
                  <button onClick={handleCopyText}>
                    <Link2 className="h-4 w-4 text-custom-text-300 hover:text-custom-text-200 -rotate-45" />
                  </button>
                  {!disableUserActions && (
                    <button onClick={() => setDeleteIssueModal(true)}>
                      <Trash2 className="h-4 w-4 text-custom-text-300 hover:text-custom-text-200" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* content */}
            <div className="relative w-full h-full overflow-hidden overflow-y-auto">
              {isLoading && !issue ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                issue && (
                  <>
                    {["side-peek", "modal"].includes(peekMode) ? (
                      <div className="relative flex flex-col gap-3 py-5 px-8">
                        {isArchived && (
                          <div className="absolute top-0 left-0 h-full min-h-full w-full z-[9] flex items-center justify-center bg-custom-background-100 opacity-60" />
                        )}
                        <PeekOverviewIssueDetails
                          setIsSubmitting={(value) => setIsSubmitting(value)}
                          isSubmitting={isSubmitting}
                          workspaceSlug={workspaceSlug}
                          issue={issue}
                          issueUpdate={issueUpdate}
                          issueReactions={issueReactions}
                          user={currentUser}
                          issueReactionCreate={issueReactionCreate}
                          issueReactionRemove={issueReactionRemove}
                        />

                        <PeekOverviewProperties
                          issue={issue}
                          issueUpdate={issueUpdate}
                          disableUserActions={disableUserActions}
                        />

                        <IssueActivity
                          workspaceSlug={workspaceSlug}
                          projectId={projectId}
                          issueId={issueId}
                          user={currentUser}
                          issueActivity={issueActivity}
                          issueCommentCreate={issueCommentCreate}
                          issueCommentUpdate={issueCommentUpdate}
                          issueCommentRemove={issueCommentRemove}
                          issueCommentReactionCreate={issueCommentReactionCreate}
                          issueCommentReactionRemove={issueCommentReactionRemove}
                          showCommentAccessSpecifier={showCommentAccessSpecifier}
                        />
                      </div>
                    ) : (
                      <div className={`overflow-auto w-full h-full flex ${isArchived ? "opacity-60" : ""}`}>
                        <div className="relative w-full h-full space-y-6 p-4 py-5 overflow-auto">
                          <div className={isArchived ? "pointer-events-none" : ""}>
                            <PeekOverviewIssueDetails
                              setIsSubmitting={(value) => setIsSubmitting(value)}
                              isSubmitting={isSubmitting}
                              workspaceSlug={workspaceSlug}
                              issue={issue}
                              issueReactions={issueReactions}
                              issueUpdate={issueUpdate}
                              user={currentUser}
                              issueReactionCreate={issueReactionCreate}
                              issueReactionRemove={issueReactionRemove}
                            />

                            <IssueActivity
                              workspaceSlug={workspaceSlug}
                              projectId={projectId}
                              issueId={issueId}
                              user={currentUser}
                              issueActivity={issueActivity}
                              issueCommentCreate={issueCommentCreate}
                              issueCommentUpdate={issueCommentUpdate}
                              issueCommentRemove={issueCommentRemove}
                              issueCommentReactionCreate={issueCommentReactionCreate}
                              issueCommentReactionRemove={issueCommentReactionRemove}
                              showCommentAccessSpecifier={showCommentAccessSpecifier}
                            />
                          </div>
                        </div>
                        <div
                          className={`flex-shrink-0 !w-[400px] h-full border-l border-custom-border-200 p-4 py-5 ${
                            isArchived ? "pointer-events-none" : ""
                          }`}
                        >
                          <PeekOverviewProperties
                            issue={issue}
                            issueUpdate={issueUpdate}
                            disableUserActions={disableUserActions}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
});
