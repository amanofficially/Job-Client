import { CheckCircle2, AlertTriangle } from "lucide-react";

const MatchScoreCard = ({ analysis }) => {
  const score = analysis.matchScore ?? 0;

  const ringColor = score >= 75 ? "#1F6F5C" : score >= 50 ? "#B8860B" : "#C0442E";

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E4E4DE" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={ringColor}
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-display font-bold">{score}%</span>
            <span className="text-xs text-muted">Match</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="font-display font-semibold text-lg">{analysis.recommendation || "Analysis Result"}</p>
          <p className="text-sm text-muted mt-1">
            {analysis.jobTitle} {analysis.company ? `at ${analysis.company}` : ""}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-medium text-muted mb-2">Matching Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.matchingSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 text-xs bg-primary-light text-primary-dark px-2 py-1 rounded-full"
                  >
                    <CheckCircle2 size={12} /> {skill}
                  </span>
                ))}
                {(!analysis.matchingSkills || analysis.matchingSkills.length === 0) && (
                  <span className="text-xs text-muted">None found</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.missingSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 text-xs bg-warn-light text-warn px-2 py-1 rounded-full"
                  >
                    <AlertTriangle size={12} /> {skill}
                  </span>
                ))}
                {(!analysis.missingSkills || analysis.missingSkills.length === 0) && (
                  <span className="text-xs text-muted">None — great fit!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchScoreCard;
