import { Code } from "lucide-react";

interface LanguageSectionProps {
  analytics: any;
}

export function LanguageSection({ analytics }: LanguageSectionProps) {
  const topLanguages = (analytics?.topLanguages as unknown as Array<{
    language: string;
    count: number;
    percentage: number;
  }>) || [];

  if (topLanguages.length === 0) return null;

  return (
    <div className="border border-[rgba(240,240,250,0.15)] p-4 sm:p-6 backdrop-blur-sm mt-6">
      <h3 className="text-base sm:text-lg font-semibold opacity-80 mb-3 sm:mb-4 flex items-center gap-2">
        <Code className="w-4 h-4 sm:w-5 sm:h-5 text-[#f0f0fa]" />
        Top Languages
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {topLanguages.slice(0, 5).map((lang, index) => (
          <LanguageBar
            key={lang.language}
            language={lang.language}
            percentage={lang.percentage}
            count={lang.count}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

function LanguageBar({
  language,
  percentage,
  count,
  rank,
}: {
  language: string;
  percentage: number;
  count: number;
  rank: number;
}) {
  return (
    <div 
      className="space-y-1"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${language}: ${percentage}% of commits`}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-80 font-medium">{language}</span>
        <span className="opacity-80">
          <span className="sr-only">Percentage:</span> {percentage}% 
          <span className="mx-1" aria-hidden="true">•</span>
          <span className="sr-only">Count:</span> {count} commits
        </span>
      </div>
      <div className="h-2 -full overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
