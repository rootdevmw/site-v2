import { ContentViewer } from "@/components/ui/ContentViewer";

export function RecordRichText({ content, emptyMessage }: { content?: string | null; emptyMessage: string }) {
  if (!content?.replace(/<\/?p>|<br\s*\/?>|&nbsp;/gi, "").trim()) return <p className="record-empty">{emptyMessage}</p>;
  return <div className="record-rich-text"><ContentViewer key={content} content={content} /></div>;
}
