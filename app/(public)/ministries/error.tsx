"use client";
import { GroupError } from "@/components/public/groups/GroupError";
export default function Error({ reset }: { reset: () => void }) {
  return <GroupError kind="ministry" reset={reset} />;
}
