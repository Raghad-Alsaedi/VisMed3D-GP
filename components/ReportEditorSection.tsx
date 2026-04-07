"use client";
import { EditorContent } from "@tiptap/react";

interface ReportEditorSectionProps {
  title: string;
  editor: any;
  subtitle?: string;
}

// A single labeled section inside the report form
// e.g. "Findings" with the Tiptap editor underneath it
const ReportEditorSection = ({ title, editor, subtitle }: ReportEditorSectionProps) => {
  return (
    <div className="bg-[#0D1A2D]">
      {/* Section header: title on the left, optional subtitle on the right */}
      <div className="bg-[#0D1A2D] flex items-center justify-between px-2 py-1">
        <span className="text-white font-medium" style={{ fontSize: "clamp(9px, 2vw, 13px)" }}>
          {title}
        </span>
        {subtitle && (
          <span className="text-gray-400" style={{ fontSize: "clamp(8px, 1.8vw, 11px)" }}>
            {subtitle}
          </span>
        )}
      </div>
      {/* The actual text editor for this section */}
      <div className="px-2 py-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ReportEditorSection;