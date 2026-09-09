import { useState } from "react";
import { toast } from "sonner";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateEmail, improveEmail } from "@/services/aiService";
import { sendApplicationEmail } from "@/services/emailService";
import { createApplication } from "@/services/applicationService";
import { STATUS_OPTIONS } from "@/utils/constants";
import EmailEditor from "@/components/email/EmailEditor";

const emptyForm = {
  companyName: "",
  jobTitle: "",
  recruiterEmail: "",
  location: "",
  jobType: "",
  salary: "",
  companyWebsite: "",
  jobUrl: "",
  source: "",
  status: "Applied",
  notes: "",
};

const AddApplicationModal = ({ open, onClose, onSaved }) => {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [cc, setCc] = useState("");
  const [email, setEmail] = useState(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const resumeMissing = !user?.resume?.fileUrl;

  const resetAndClose = () => {
    setForm(emptyForm);
    setPrompt("");
    setCc("");
    setEmail(null);
    onClose();
  };

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.companyName.trim() || !form.jobTitle.trim() || !form.recruiterEmail.trim()) {
      toast.error("A few details are missing", {
        description: "Company name, job title and recruiter email are required.",
      });
      return false;
    }
    return true;
  };

  const buildApplicationData = () => ({
    companyName: form.companyName,
    jobTitle: form.jobTitle,
    recruiterEmail: form.recruiterEmail,
    location: form.location,
    jobType: form.jobType,
    salary: form.salary,
    companyWebsite: form.companyWebsite,
    jobUrl: form.jobUrl,
    source: form.source,
    notes: form.notes,
    jobDescription: prompt,
  });

  const buildJobAnalysis = () => ({
    company: form.companyName,
    jobTitle: form.jobTitle,
    highlights: prompt || undefined,
  });

  const handleGenerateEmail = async () => {
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      toast.error("Add company & job title first", {
        description: "AI needs at least the company name and role to write the email.",
      });
      return;
    }
    setGeneratingEmail(true);
    try {
      const res = await generateEmail(buildJobAnalysis(), user?.settings?.emailTone);
      setEmail(res.data.data);
      toast.success("Application email drafted", {
        description: "Give it a read, tweak it, then save or send.",
      });
    } catch (error) {
      toast.error("Couldn't generate the email", {
        description: error.response?.data?.message || "Please try again in a moment.",
      });
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleAIAction = async (instruction) => {
    setAiEditLoading(true);
    try {
      if (instruction === "regenerate") {
        const res = await generateEmail(buildJobAnalysis(), user?.settings?.emailTone);
        setEmail(res.data.data);
        toast.success("Email regenerated");
      } else {
        const res = await improveEmail(email.subject, email.body, instruction);
        setEmail(res.data.data);
        toast.success("Email updated");
      }
    } catch (error) {
      toast.error("Couldn't update the email", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setAiEditLoading(false);
    }
  };

  const handleSaveApplication = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...buildApplicationData(), status: form.status };
      if (email) payload.email = { subject: email.subject, body: email.body };
      await createApplication(payload);
      toast.success("Application saved", {
        description: `${form.jobTitle} @ ${form.companyName} was added to your applications.`,
      });
      resetAndClose();
      onSaved?.();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This application already exists", {
          description: "Same company, job title and recruiter email are already on your list.",
        });
      } else {
        toast.error("Couldn't save this application", {
          description: error.response?.data?.message || "Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!validate()) return;
    if (resumeMissing) {
      toast.error("Resume required", {
        description: "Upload your resume in Profile before sending an application.",
      });
      return;
    }
    setSending(true);
    try {
      await sendApplicationEmail({
        to: form.recruiterEmail,
        cc,
        subject: email.subject,
        body: email.body,
        applicationData: buildApplicationData(),
      });
      toast.success("Application sent!", {
        description: `Your email to ${form.recruiterEmail} is on its way.`,
      });
      resetAndClose();
      onSaved?.();
    } catch (error) {
      toast.error("Couldn't send the application", {
        description: error.response?.data?.message || "Please check your details and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={saving || sending ? undefined : resetAndClose}
      />
      <div className="relative card w-full max-w-2xl p-5 sm:p-6 my-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-lg">Add an application</h2>
            <p className="text-sm text-muted mt-1">
              Log a job you're applying to (or already applied to) manually — no job description needed.
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="text-muted hover:text-ink shrink-0"
            aria-label="Close"
            disabled={saving || sending}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Company Name *</label>
            <input
              className="input-field"
              placeholder="Deloitte"
              value={form.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Job Title *</label>
            <input
              className="input-field"
              placeholder="Software Engineer"
              value={form.jobTitle}
              onChange={(e) => setField("jobTitle", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Recruiter Email *</label>
            <input
              type="email"
              className="input-field"
              placeholder="hr@example.com"
              value={form.recruiterEmail}
              onChange={(e) => setField("recruiterEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Location</label>
            <input className="input-field" value={form.location} onChange={(e) => setField("location", e.target.value)} />
          </div>
          <div>
            <label className="label-text">Job Type</label>
            <input
              className="input-field"
              placeholder="Full-time"
              value={form.jobType}
              onChange={(e) => setField("jobType", e.target.value)}
            />
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-primary font-medium">Optional details</summary>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="label-text">Company Website</label>
              <input className="input-field" value={form.companyWebsite} onChange={(e) => setField("companyWebsite", e.target.value)} />
            </div>
            <div>
              <label className="label-text">Job URL</label>
              <input className="input-field" value={form.jobUrl} onChange={(e) => setField("jobUrl", e.target.value)} />
            </div>
            <div>
              <label className="label-text">Salary</label>
              <input className="input-field" value={form.salary} onChange={(e) => setField("salary", e.target.value)} />
            </div>
            <div>
              <label className="label-text">Source</label>
              <input className="input-field" placeholder="LinkedIn" value={form.source} onChange={(e) => setField("source", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Notes</label>
              <textarea className="input-field min-h-[70px]" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
            </div>
          </div>
        </details>

        <div className="border-t border-border pt-4">
          <label className="label-text flex items-center gap-1.5">
            <Sparkles size={13} className="text-primary" />
            Want an email drafted for this? (optional)
          </label>
          <p className="text-xs text-muted -mt-1 mb-2">
            Describe the role, or what you'd like the email to emphasize — a sentence or two is enough.
          </p>
          <textarea
            className="input-field min-h-[70px]"
            placeholder="e.g. Backend role, focus on my 3 years of Node.js experience and mention I'm open to relocating"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!!email}
          />
          {!email && (
            <button
              onClick={handleGenerateEmail}
              disabled={generatingEmail}
              className="btn-secondary text-sm flex items-center gap-2 mt-2"
            >
              {generatingEmail ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generatingEmail ? "Generating..." : "Generate Email with AI"}
            </button>
          )}
        </div>

        {email && (
          <EmailEditor
            to={form.recruiterEmail}
            cc={cc}
            subject={email.subject}
            body={email.body}
            onToChange={(v) => setField("recruiterEmail", v)}
            onCcChange={setCc}
            onSubjectChange={(v) => setEmail({ ...email, subject: v })}
            onBodyChange={(v) => setEmail({ ...email, body: v })}
            onAIAction={handleAIAction}
            aiLoading={aiEditLoading}
            onSaveDraft={handleSaveApplication}
            onSend={handleSendEmail}
            sending={sending}
            savingDraft={saving}
            resumeMissing={resumeMissing}
          />
        )}

        {!email && (
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={resetAndClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSaveApplication} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddApplicationModal;
