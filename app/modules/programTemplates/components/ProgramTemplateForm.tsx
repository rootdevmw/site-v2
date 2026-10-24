"use client";
import {
  ProgramEditor,
  type ProgramEditorProps,
} from "@/components/records/ProgramEditor";
export function ProgramTemplateForm(props: ProgramEditorProps) {
  return <ProgramEditor {...props} kind="template" />;
}
