import { ChapterTitle } from "@vidstack/react";

export function ChapterTitleComponent() {
  return (
    <span className="inline-block flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-medium text-white">
      <span className="mr-1 text-txt">&#8226;</span>
      <ChapterTitle className="ml-1" />
    </span>
  );
}
