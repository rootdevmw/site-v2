"use client";
import { ChurchGroupEditor, type ChurchGroupEditorProps } from "@/components/directories/ChurchGroupEditor";
export function MinistryForm(props: ChurchGroupEditorProps) { return <ChurchGroupEditor {...props} kind="ministry" />; }
