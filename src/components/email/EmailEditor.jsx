import { Wand2, Loader2 } from "lucide-react";

const aiActions = [
  { label: "Regenerate", instruction: "regenerate" },
  { label: "Improve", instruction: "Make the email more professional and polished" },
  { label: "Make Shorter", instruction: "Make the email more concise, under 100 words" },
  { label: "Make More Professional", instruction: "Make the tone more formal and corporate" },
  { label: "Make Friendly", instruction: "Make the tone warmer and more approachable, while staying professional" },
];

const EmailEditor = ({
  to,
  cc,
  subject,
  body,
  onToChange,
  onCcChange,
  onSubjectChange,
  onBodyChange,
  onAIAction,
  aiLoading,
  onSaveDraft,
  onSend,
  sending,
  savingDraft,
  resumeMissing,
}) => {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display font-semibold text-lg">Review your application email</h3>
        <div className="flex flex-wrap gap-2">
          {aiActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onAIAction(action.instruction)}
              disabled={aiLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-white hover:bg-bg flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text">To (Recruiter Email)</label>
          <input className="input-field" value={to} onChange={(e) => onToChange(e.target.value)} />
        </div>
        <div>
          <label className="label-text">CC (optional)</label>
          <input className="input-field" value={cc} onChange={(e) => onCcChange(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label-text">Subject</label>
        <input className="input-field" value={subject} onChange={(e) => onSubjectChange(e.target.value)} />
      </div>

      <div>
        <label className="label-text">Body</label>
        <textarea
          className="input-field min-h-[280px] leading-relaxed"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
        />
      </div>

      {resumeMissing && (
        <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg">
          Please upload your resume before sending the application.
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <button onClick={onSaveDraft} disabled={savingDraft || sending} className="btn-secondary">
          {savingDraft ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={onSend} disabled={sending || savingDraft || resumeMissing} className="btn-primary">
          {sending ? "Sending..." : "Send Application"}
        </button>
      </div>
    </div>
  );
};

export default EmailEditor;
