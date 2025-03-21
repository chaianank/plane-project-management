import { useState } from "react";
import { Editor } from "@tiptap/react";
import { usePopper } from "react-popper";
import { List } from "lucide-react";
// components
import { ContentBrowser } from "./content-browser";
// types
import { IMarking } from "..";

type Props = {
  editor: Editor;
  markings: IMarking[];
  sidePeekVisible: boolean;
  setSidePeekVisible: (sidePeekState: boolean) => void;
};

export const SummaryPopover: React.FC<Props> = (props) => {
  const { editor, markings, sidePeekVisible, setSidePeekVisible } = props;

  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );

  const { styles: summaryPopoverStyles, attributes: summaryPopoverAttributes } =
    usePopper(referenceElement, popperElement, {
      placement: "bottom-start",
    });

  return (
    <div className="group/summary-popover w-min whitespace-nowrap">
      <button
        type="button"
        ref={setReferenceElement}
        className={`h-7 w-7 grid place-items-center rounded ${
          sidePeekVisible
            ? "bg-custom-primary-100/20 text-custom-primary-100"
            : "text-custom-text-300"
        }`}
        onClick={() => setSidePeekVisible(!sidePeekVisible)}
      >
        <List className="h-4 w-4" />
      </button>
      {!sidePeekVisible && (
        <div
          className="hidden group-hover/summary-popover:block z-10 max-h-80 w-64 shadow-custom-shadow-rg rounded border-[0.5px] border-custom-border-200 bg-custom-background-100 p-3 overflow-y-auto"
          ref={setPopperElement}
          style={summaryPopoverStyles.popper}
          {...summaryPopoverAttributes.popper}
        >
          <ContentBrowser editor={editor} markings={markings} />
        </div>
      )}
    </div>
  );
};
