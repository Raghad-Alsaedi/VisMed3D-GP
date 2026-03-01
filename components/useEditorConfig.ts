import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";

export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
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

export const richTextExtensions = [
  StarterKit,
  TiptapUnderline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Color,
  FontFamily,
  FontSize,
];

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
      const content = isPlainText ? editor.getText() : editor.getHTML();
      onUpdate(content);
    },
    onFocus: ({ editor }) => onFocus?.(editor),
    onBlur,
    editorProps: {
      attributes: {
        class: isPlainText ? "tiptap-editor body-part-editor" : "tiptap-editor",
        style: maxHeight ? `min-height: ${minHeight}; max-height: ${maxHeight};` : `min-height: ${minHeight}`,
      },
    },
  });
};