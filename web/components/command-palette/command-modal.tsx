import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Command } from "cmdk";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react-lite";
import { FolderPlus, Search, Settings } from "lucide-react";
// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// services
import { WorkspaceService } from "services/workspace.service";
import { IssueService } from "services/issue";
// hooks
import useDebounce from "hooks/use-debounce";
// components
import {
  CommandPaletteThemeActions,
  ChangeIssueAssignee,
  ChangeIssuePriority,
  ChangeIssueState,
  CommandPaletteHelpActions,
  CommandPaletteIssueActions,
  CommandPaletteProjectActions,
  CommandPaletteWorkspaceSettingsActions,
  CommandPaletteSearchResults,
} from "components/command-palette";
import { LayersIcon, Loader, ToggleSwitch, Tooltip } from "@plane/ui";
// types
import { IWorkspaceSearchResults } from "types";
// fetch-keys
import { ISSUE_DETAILS } from "constants/fetch-keys";

// services
const workspaceService = new WorkspaceService();
const issueService = new IssueService();

export const CommandModal: React.FC = observer(() => {
  // states
  const [placeholder, setPlaceholder] = useState("Type a command or search...");
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IWorkspaceSearchResults>({
    results: {
      workspace: [],
      project: [],
      issue: [],
      cycle: [],
      module: [],
      issue_view: [],
      page: [],
    },
  });
  const [isWorkspaceLevel, setIsWorkspaceLevel] = useState(false);
  const [pages, setPages] = useState<string[]>([]);

  const {
    commandPalette: {
      isCommandPaletteOpen,
      toggleCommandPaletteModal,
      toggleCreateIssueModal,
      toggleCreateProjectModal,
    },
    trackEvent: { setTrackElement }
  } = useMobxStore();

  // router
  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const page = pages[pages.length - 1];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // TODO: update this to mobx store
  const { data: issueDetails } = useSWR(
    workspaceSlug && projectId && issueId ? ISSUE_DETAILS(issueId.toString()) : null,
    workspaceSlug && projectId && issueId
      ? () => issueService.retrieve(workspaceSlug.toString(), projectId.toString(), issueId.toString())
      : null
  );

  const closePalette = () => {
    toggleCommandPaletteModal(false);
  };

  const createNewWorkspace = () => {
    closePalette();
    router.push("/create-workspace");
  };

  useEffect(
    () => {
      if (!workspaceSlug) return;

      setIsLoading(true);

      if (debouncedSearchTerm) {
        setIsSearching(true);
        workspaceService
          .searchWorkspace(workspaceSlug.toString(), {
            ...(projectId ? { project_id: projectId.toString() } : {}),
            search: debouncedSearchTerm,
            workspace_search: !projectId ? true : isWorkspaceLevel,
          })
          .then((results) => {
            setResults(results);
            const count = Object.keys(results.results).reduce(
              (accumulator, key) => (results.results as any)[key].length + accumulator,
              0
            );
            setResultsCount(count);
          })
          .finally(() => {
            setIsLoading(false);
            setIsSearching(false);
          });
      } else {
        setResults({
          results: {
            workspace: [],
            project: [],
            issue: [],
            cycle: [],
            module: [],
            issue_view: [],
            page: [],
          },
        });
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearchTerm, isWorkspaceLevel, projectId, workspaceSlug] // Only call effect if debounced search term changes
  );

  return (
    <Transition.Root show={isCommandPaletteOpen} afterLeave={() => setSearchTerm("")} as={React.Fragment}>
      <Dialog as="div" className="relative z-30" onClose={() => closePalette()}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-30 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative flex items-center justify-center w-full ">
              <div className="w-full max-w-2xl transform divide-y divide-custom-border-200 divide-opacity-10 rounded-lg bg-custom-background-100 shadow-custom-shadow-md transition-all">
                <Command
                  filter={(value, search) => {
                    if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                    return 0;
                  }}
                  onKeyDown={(e) => {
                    // when search is empty and page is undefined
                    // when user tries to close the modal with esc
                    if (e.key === "Escape" && !page && !searchTerm) closePalette();

                    // Escape goes to previous page
                    // Backspace goes to previous page when search is empty
                    if (e.key === "Escape" || (e.key === "Backspace" && !searchTerm)) {
                      e.preventDefault();
                      setPages((pages) => pages.slice(0, -1));
                      setPlaceholder("Type a command or search...");
                    }
                  }}
                >
                  <div
                    className={`flex sm:items-center gap-4 p-3 pb-0 ${
                      issueDetails ? "flex-col sm:flex-row justify-between" : "justify-end"
                    }`}
                  >
                    {issueDetails && (
                      <div className="overflow-hidden truncate rounded-md bg-custom-background-80 p-2 text-xs font-medium text-custom-text-200">
                        {issueDetails.project_detail.identifier}-{issueDetails.sequence_id} {issueDetails.name}
                      </div>
                    )}
                    {projectId && (
                      <Tooltip tooltipContent="Toggle workspace level search">
                        <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-1 text-xs cursor-pointer">
                          <button
                            type="button"
                            onClick={() => setIsWorkspaceLevel((prevData) => !prevData)}
                            className="flex-shrink-0"
                          >
                            Workspace Level
                          </button>
                          <ToggleSwitch
                            value={isWorkspaceLevel}
                            onChange={() => setIsWorkspaceLevel((prevData) => !prevData)}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-4 h-4 w-4 text-custom-text-200"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                    <Command.Input
                      className="w-full border-0 border-b border-custom-border-200 bg-transparent p-4 pl-11 text-custom-text-100 placeholder:text-custom-text-400 outline-none focus:ring-0 text-sm"
                      placeholder={placeholder}
                      value={searchTerm}
                      onValueChange={(e) => setSearchTerm(e)}
                      autoFocus
                      tabIndex={1}
                    />
                  </div>

                  <Command.List className="max-h-96 overflow-scroll p-2">
                    {searchTerm !== "" && (
                      <h5 className="text-xs text-custom-text-100 mx-[3px] my-4">
                        Search results for{" "}
                        <span className="font-medium">
                          {'"'}
                          {searchTerm}
                          {'"'}
                        </span>{" "}
                        in {!projectId || isWorkspaceLevel ? "workspace" : "project"}:
                      </h5>
                    )}

                    {!isLoading && resultsCount === 0 && searchTerm !== "" && debouncedSearchTerm !== "" && (
                      <div className="my-4 text-center text-custom-text-200 text-sm">No results found.</div>
                    )}

                    {(isLoading || isSearching) && (
                      <Command.Loading>
                        <Loader className="space-y-3">
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                          <Loader.Item height="40px" />
                        </Loader>
                      </Command.Loading>
                    )}

                    {debouncedSearchTerm !== "" && (
                      <CommandPaletteSearchResults closePalette={closePalette} results={results} />
                    )}

                    {!page && (
                      <>
                        {/* issue actions */}
                        {issueId && (
                          <CommandPaletteIssueActions
                            closePalette={closePalette}
                            issueDetails={issueDetails}
                            pages={pages}
                            setPages={(newPages) => setPages(newPages)}
                            setPlaceholder={(newPlaceholder) => setPlaceholder(newPlaceholder)}
                            setSearchTerm={(newSearchTerm) => setSearchTerm(newSearchTerm)}
                          />
                        )}
                        <Command.Group heading="Issue">
                          <Command.Item
                            onSelect={() => {
                              closePalette();
                              setTrackElement("COMMAND_PALETTE");
                              toggleCreateIssueModal(true);
                            }}
                            className="focus:bg-custom-background-80"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <LayersIcon className="h-3.5 w-3.5" />
                              Create new issue
                            </div>
                            <kbd>C</kbd>
                          </Command.Item>
                        </Command.Group>

                        {workspaceSlug && (
                          <Command.Group heading="Project">
                            <Command.Item
                              onSelect={() => {
                                closePalette();
                                setTrackElement("COMMAND_PALETTE");
                                toggleCreateProjectModal(true);
                              }}
                              className="focus:outline-none"
                            >
                              <div className="flex items-center gap-2 text-custom-text-200">
                                <FolderPlus className="h-3.5 w-3.5" />
                                Create new project
                              </div>
                              <kbd>P</kbd>
                            </Command.Item>
                          </Command.Group>
                        )}

                        {/* project actions */}
                        {projectId && <CommandPaletteProjectActions closePalette={closePalette} />}

                        <Command.Group heading="Workspace Settings">
                          <Command.Item
                            onSelect={() => {
                              setPlaceholder("Search workspace settings...");
                              setSearchTerm("");
                              setPages([...pages, "settings"]);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <Settings className="h-3.5 w-3.5" />
                              Search settings...
                            </div>
                          </Command.Item>
                        </Command.Group>
                        <Command.Group heading="Account">
                          <Command.Item onSelect={createNewWorkspace} className="focus:outline-none">
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <FolderPlus className="h-3.5 w-3.5" />
                              Create new workspace
                            </div>
                          </Command.Item>
                          <Command.Item
                            onSelect={() => {
                              setPlaceholder("Change interface theme...");
                              setSearchTerm("");
                              setPages([...pages, "change-interface-theme"]);
                            }}
                            className="focus:outline-none"
                          >
                            <div className="flex items-center gap-2 text-custom-text-200">
                              <Settings className="h-3.5 w-3.5" />
                              Change interface theme...
                            </div>
                          </Command.Item>
                        </Command.Group>

                        {/* help options */}
                        <CommandPaletteHelpActions closePalette={closePalette} />
                      </>
                    )}

                    {/* workspace settings actions */}
                    {page === "settings" && workspaceSlug && (
                      <CommandPaletteWorkspaceSettingsActions closePalette={closePalette} />
                    )}

                    {/* issue details page actions */}
                    {page === "change-issue-state" && issueDetails && (
                      <ChangeIssueState closePalette={closePalette} issue={issueDetails} />
                    )}
                    {page === "change-issue-priority" && issueDetails && (
                      <ChangeIssuePriority closePalette={closePalette} issue={issueDetails} />
                    )}
                    {page === "change-issue-assignee" && issueDetails && (
                      <ChangeIssueAssignee closePalette={closePalette} issue={issueDetails} />
                    )}

                    {/* theme actions */}
                    {page === "change-interface-theme" && (
                      <CommandPaletteThemeActions
                        closePalette={() => {
                          closePalette();
                          setPages((pages) => pages.slice(0, -1));
                        }}
                      />
                    )}
                  </Command.List>
                </Command>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
});
