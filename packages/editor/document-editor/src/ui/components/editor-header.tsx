import { Editor } from "@tiptap/react";
import { Archive, RefreshCw, Lock } from "lucide-react";
import { IMarking } from "..";
import { FixedMenu } from "../menu";
import { UploadImage } from "@plane/editor-types";
import { DocumentDetails } from "../types/editor-types";
import { AlertLabel } from "./alert-label";
import {
  IVerticalDropdownItemProps,
  VerticalDropdownMenu,
} from "./vertical-dropdown-menu";
import { SummaryPopover } from "./summary-popover";
import { InfoPopover } from "./info-popover";

interface IEditorHeader {
  editor: Editor;
  KanbanMenuOptions: IVerticalDropdownItemProps[];
  sidePeekVisible: boolean;
  setSidePeekVisible: (sidePeekState: boolean) => void;
  markings: IMarking[];
  isLocked: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  readonly: boolean;
  uploadFile?: UploadImage;
  setIsSubmitting?: (
    isSubmitting: "submitting" | "submitted" | "saved",
  ) => void;
  documentDetails: DocumentDetails;
  isSubmitting?: "submitting" | "submitted" | "saved";
}

export const EditorHeader = (props: IEditorHeader) => {
  const {
    documentDetails,
    archivedAt,
    editor,
    sidePeekVisible,
    readonly,
    setSidePeekVisible,
    markings,
    uploadFile,
    setIsSubmitting,
    KanbanMenuOptions,
    isArchived,
    isLocked,
    isSubmitting,
  } = props;

  return (
    <div className="flex items-center border-b border-custom-border-200 py-2 px-5">
      <div className="flex-shrink-0 w-56 lg:w-72">
        <SummaryPopover
          editor={editor}
          markings={markings}
          sidePeekVisible={sidePeekVisible}
          setSidePeekVisible={setSidePeekVisible}
        />
      </div>

      <div className="flex-shrink-0">
        {!readonly && uploadFile && (
          <FixedMenu
            editor={editor}
            uploadFile={uploadFile}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </div>

      <div className="flex-grow flex items-center justify-end gap-3">
        {isLocked && (
          <AlertLabel
            Icon={Lock}
            backgroundColor="bg-custom-background-80"
            textColor="text-custom-text-300"
            label="Locked"
          />
        )}
        {isArchived && archivedAt && (
          <AlertLabel
            Icon={Archive}
            backgroundColor="bg-blue-500/20"
            textColor="text-blue-500"
            label={`Archived at ${new Date(archivedAt).toLocaleString()}`}
          />
        )}

        {!isLocked && !isArchived ? (
          <div
            className={`flex absolute right-[120px] transition-all duration-300 items-center gap-x-2 ${
              isSubmitting === "saved" ? "fadeOut" : "fadeIn"
            }`}
          >
            {isSubmitting !== "submitted" && isSubmitting !== "saved" && (
              <RefreshCw className="h-4 w-4 stroke-custom-text-300" />
            )}
            <span className="text-sm text-custom-text-300">
              {isSubmitting === "submitting" ? "Saving..." : "Saved"}
            </span>
          </div>
        ) : null}
        {!isArchived && <InfoPopover documentDetails={documentDetails} />}
        <VerticalDropdownMenu items={KanbanMenuOptions} />
      </div>
    </div>
  );
};
