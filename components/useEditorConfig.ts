import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";

// Tiptap supports changing text color, font family, and alignment out of the box,
// but font size is not included — so we create it here as a custom extension
export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  // This teaches Tiptap two things about fontSize:
  // - how to read it from saved HTML (e.g. style="font-size: 14px")
  // - how to write it back to HTML when rendering the editor content
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  // Adds two editor commands: one to set font size, one to clear it
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// Gives the doctor a full editing toolbar: bold, italic, underline, strikethrough,
// headings, bullet lists, numbered lists, text alignment, font family,
// font size, and text color
export const richTextExtensions = [
  StarterKit,
  TiptapUnderline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
];

// Some fields in the report (like "Body Part") should stay as simple text —
// no bold, no lists, no headings. So we take StarterKit and turn off
// all the formatting features, leaving just basic typing
export const plainTextExtensions = [
  StarterKit.configure({
    bold: false,
    italic: false,
    strike: false,
    code: false,
    heading: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
  }),
];

// Defines what settings each editor section needs when it's created —
// things like what text to show, the placeholder, what to do when the doctor
// types something, and whether this field allows rich formatting or plain text only
interface EditorConfig {
  content: string;
  placeholder: string;
  onUpdate: (content: string) => void;
  onFocus?: (editor: any) => void;
  onBlur?: () => void;
  minHeight?: string;
  maxHeight?: string;
  isPlainText?: boolean;
}

// Instead of setting up a Tiptap editor from scratch in every section,
// this hook does the setup once and gets reused everywhere.
// Each section just says what content it has, what placeholder to show,
// and whether it needs formatting tools or plain text only
export const useCustomEditor = ({
  content,
  placeholder,
  onUpdate,
  onFocus,
  onBlur,
  minHeight = "100px",
  maxHeight,
  isPlainText = false,
}: EditorConfig) => {
  return useEditor({
    immediatelyRender: false,
    extensions: [
      ...(isPlainText ? plainTextExtensions : richTextExtensions),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // For plain text fields we save just the raw characters the doctor typed.
      // For rich text fields we save the full HTML so the formatting
      // (bold, lists, font size, etc.) is preserved when the report is loaded again
      const content = isPlainText ? editor.getText() : editor.getHTML();
      onUpdate(content);
    },
    onFocus: ({ editor }) => onFocus?.(editor),
    onBlur,
    editorProps: {
      attributes: {
        class: isPlainText ? "tiptap-editor body-part-editor" : "tiptap-editor",
        style: maxHeight
          ? `min-height: ${minHeight}; max-height: ${maxHeight};`
          : `min-height: ${minHeight}`,
      },
    },
  });
};