import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";

// mobx store
import { useMobxStore } from "lib/mobx/store-provider";
// components
import { AppliedFiltersList, SaveFilterView } from "components/issues";

// types
import { IIssueFilterOptions } from "types";
import { EFilterType } from "store/issues/types";

export const ProjectAppliedFiltersRoot: React.FC = observer(() => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query as {
    workspaceSlug: string;
    projectId: string;
  };

  const {
    projectLabel: { projectLabels },
    projectState: projectStateStore,
    projectMember: { projectMembers },
    projectIssuesFilter: { issueFilters, updateFilters },
  } = useMobxStore();

  const userFilters = issueFilters?.filters;

  // filters whose value not null or empty array
  const appliedFilters: IIssueFilterOptions = {};
  Object.entries(userFilters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key as keyof IIssueFilterOptions] = value;
  });

  const handleRemoveFilter = (key: keyof IIssueFilterOptions, value: string | null) => {
    if (!workspaceSlug || !projectId) return;
    if (!value) {
      updateFilters(workspaceSlug.toString(), projectId.toString(), EFilterType.FILTERS, {
        [key]: null,
      });
      return;
    }

    let newValues = issueFilters?.filters?.[key] ?? [];
    newValues = newValues.filter((val) => val !== value);

    updateFilters(workspaceSlug.toString(), projectId.toString(), EFilterType.FILTERS, {
      [key]: newValues,
    });
  };

  const handleClearAllFilters = () => {
    if (!workspaceSlug || !projectId) return;
    const newFilters: IIssueFilterOptions = {};
    Object.keys(userFilters ?? {}).forEach((key) => {
      newFilters[key as keyof IIssueFilterOptions] = null;
    });
    updateFilters(workspaceSlug.toString(), projectId.toString(), EFilterType.FILTERS, { ...newFilters });
  };

  // return if no filters are applied
  if (Object.keys(appliedFilters).length === 0) return null;

  return (
    <div className="p-4 flex items-center justify-between">
      <AppliedFiltersList
        appliedFilters={appliedFilters}
        handleClearAllFilters={handleClearAllFilters}
        handleRemoveFilter={handleRemoveFilter}
        labels={projectLabels ?? []}
        members={projectMembers?.map((m) => m.member)}
        states={projectStateStore.states?.[projectId?.toString() ?? ""]}
      />

      <SaveFilterView workspaceSlug={workspaceSlug} projectId={projectId} filterParams={appliedFilters} />
    </div>
  );
});
