import { Info } from "lucide-react";
import { InlineNotice } from "@/components/ui/inline-notice";

interface DataQualityIndicatorProps {
  outlierCount: number;
  unknownExtensionPercent: number;
  totalCommits: number;
}

export function DataQualityIndicator({
  outlierCount,
  unknownExtensionPercent,
  totalCommits,
}: DataQualityIndicatorProps) {
  const hasOutliers = outlierCount > 0;
  const hasUnknownTypes = unknownExtensionPercent > 20;
  const lowDataCount = totalCommits < 10;

  if (!hasOutliers && !hasUnknownTypes && !lowDataCount) {
    return null;
  }

  return (
    <InlineNotice
      variant="info"
      title="Data quality notes"
      icon={<Info />}
    >
      <ul className="space-y-1.5">
        {hasOutliers ? (
          <li>
            {outlierCount.toLocaleString("en-US")}{" "}
            {outlierCount === 1 ? "commit was" : "commits were"} excluded from
            statistical averages as outliers, likely from lockfiles or generated
            files.
          </li>
        ) : null}
        {hasUnknownTypes ? (
          <li>
            {unknownExtensionPercent}% of changed files could not be mapped to a
            language.
          </li>
        ) : null}
        {lowDataCount ? (
          <li>
            Only {totalCommits.toLocaleString("en-US")}{" "}
            {totalCommits === 1 ? "commit is" : "commits are"} available, so
            insight accuracy may vary.
          </li>
        ) : null}
      </ul>
    </InlineNotice>
  );
}
