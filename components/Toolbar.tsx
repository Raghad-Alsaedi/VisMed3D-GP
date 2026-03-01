import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
} from "lucide-react";

interface ToolbarProps { editor: any; }

export const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `flex items-center justify-center flex-shrink-0 rounded cursor-pointer border-none transition-all duration-200
     w-7 h-7 p-1 mx-0.5
     ${active ? "bg-blue-500/20 text-blue-400" : "bg-transparent text-white hover:bg-blue-400/10 hover:text-blue-400"}`;

  const selectClass =
    "bg-[#0d1a2d] text-white border border-white/20 rounded cursor-pointer flex-shrink-0 outline-none text-xs h-7 px-1.5 hover:border-blue-400 focus:border-blue-500 transition-colors";

  const divider = <div className="flex-shrink-0 w-px h-5 bg-white/20 mx-1" />;
  const iconSize = 14;

  const allItems = (
    <>
      <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        className={selectClass} value={editor.getAttributes("textStyle").fontFamily || "arial"}>
        <option value="arial"                    className="bg-white text-black">Arial</option>
        <option value="'Times New Roman', serif"  className="bg-white text-black">Times NR</option>
        <option value="'Courier New', monospace"  className="bg-white text-black">Courier</option>
        <option value="Georgia, serif"            className="bg-white text-black">Georgia</option>
        <option value="Verdana, sans-serif"       className="bg-white text-black">Verdana</option>
      </select>
      {divider}
      <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        className={selectClass} value={editor.getAttributes("textStyle").fontSize || "14px"}>
        {["10px","12px","14px","16px","18px","20px","24px","28px","32px"].map((s) => (
          <option key={s} value={s} className="bg-white text-black">{s.replace("px","")}</option>
        ))}
      </select>
      {divider}
      <button onClick={() => editor.chain().focus().toggleBold().run()}      className={btnClass(editor.isActive("bold"))}><Bold size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}    className={btnClass(editor.isActive("italic"))}><Italic size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))}><UnderlineIcon size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()}    className={btnClass(editor.isActive("strike"))}><Strikethrough size={iconSize} /></button>
      {divider}
      <input type="color"
        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
        value={editor.getAttributes("textStyle").color || "#ffffff"}
        className="flex-shrink-0 rounded cursor-pointer border border-white/20 bg-transparent outline-none w-7 h-7"
        style={{ padding: "2px" }}
      />
      {divider}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}  className={btnClass(editor.isActive("bulletList"))}><List size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}><ListOrdered size={iconSize} /></button>
      {divider}
      <button onClick={() => editor.chain().focus().setTextAlign("left").run()}    className={btnClass(editor.isActive({ textAlign: "left" }))}><AlignLeft size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign("center").run()}  className={btnClass(editor.isActive({ textAlign: "center" }))}><AlignCenter size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign("right").run()}   className={btnClass(editor.isActive({ textAlign: "right" }))}><AlignRight size={iconSize} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={btnClass(editor.isActive({ textAlign: "justify" }))}><AlignJustify size={iconSize} /></button>
    </>
  );

  return (
    <>
      <div
        className="hidden md:flex sticky top-[52px] z-40 items-center gap-1 p-2 bg-[#1a2942] border border-white/30 border-b-0 rounded-t-md overflow-x-auto"
        style={{ whiteSpace: "nowrap", backdropFilter: "none", isolation: "isolate" }}
      >
        {allItems}
      </div>

      <div
        className="md:hidden sticky top-[40px] z-40 flex flex-wrap items-center gap-y-1 px-2 py-1 bg-[#1a2942] border border-white/30 border-b-0 rounded-t-md"
      >
        {allItems}
      </div>
    </>
  );
};