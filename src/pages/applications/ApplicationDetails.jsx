import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Loader2 } from "lucide-react";
import {
  getApplicationById,
  updateApplication,
  addTimelineEvent,
} from "@/services/applicationService";
import { generateEmail, improveEmail } from "@/services/aiService";
import { sendApplicationEmail } from "@/services/emailService";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/common/StatusBadge";
import EmailEditor from "@/components/email/EmailEditor";
import { STATUS_OPTIONS } from "@/utils/constants";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newEvent, setNewEvent] = useState({ label: "", note: "" });

  const [email, setEmail] = useState(null);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [savingDraftEmail, setSavingDraftEmail] = useState(false);
  const [sending, setSending] = useState(false);

  const resumeMissing = !user?.resume?.fileUrl;
  const isUnsent = !application?.email?.sentAt;

  const loadApplication = async () => {
    try {
      const res = await getApplicationById(id);
      const data = res.data.data;
      setApplication(data);
      setForm(data);
      setTo(data.recruiterEmail || "");
      if (data.email?.body && !data.email?.sentAt) {
        setEmail({ subject: data.email.subject, body: data.email.body });
      }
    } catch (error) {
      toast.error("Couldn't find that application", {
        description: "It may have been deleted. Taking you back to the list.",
      });
      navigate("/applications");
    }
  };

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateApplication(id, {
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        recruiterEmail: form.recruiterEmail,
        jobUrl: form.jobUrl,
        location: form.location,
        status: form.status,
        matchScore: form.matchScore,
        notes: form.notes,
        followUpDate: form.followUpDate,
      });
      setApplication(res.data.data);
      toast.success("Changes saved");
    } catch (error) {
      toast.error("Couldn't save your changes", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.label.trim()) return;
    try {
      const res = await addTimelineEvent(id, newEvent);
      setApplication(res.data.data);
      setNewEvent({ label: "", note: "" });
      toast.success("Event added to timeline");
    } catch (error) {
      toast.error("Couldn't add that event", {
        description: error.response?.data?.message || "Please try again.",
      });
    }
  };

  const buildJobAnalysis = () => ({
    company: application.companyName,
    jobTitle: application.jobTitle,
    matchScore: application.matchScore,
    matchingSkills: application.matchingSkills,
    missingSkills: application.missingSkills,
    recommendation: application.recommendation,
  });

  const buildApplicationData = () => ({
    companyName: application.companyName,
    jobTitle: application.jobTitle,
    jobDescription: application.jobDescription,
    companyWebsite: application.companyWebsite || "",
    jobUrl: application.jobUrl || "",
    salary: application.salary || "",
    jobType: application.jobType || "",
    location: application.location || "",
    source: application.source || "",
    matchScore: application.matchScore || 0,
    matchingSkills: application.matchingSkills || [],
    missingSkills: application.missingSkills || [],
    recommendation: application.recommendation || "",
  });

  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    try {
      const res = await generateEmail(buildJobAnalysis(), user?.settings?.emailTone);
      setEmail(res.data.data);
      toast.success("Application email drafted", {
        description: "Give it a read, tweak the tone, then send it when you're ready.",
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

  const handleSaveEmailDraft = async () => {
    setSavingDraftEmail(true);
    try {
      const res = await updateApplication(id, {
        recruiterEmail: to,
        email: { subject: email.subject, body: email.body },
      });
      setApplication(res.data.data);
      toast.success("Draft saved", {
        description: "Your email text is saved — come back anytime to finish and send it.",
      });
    } catch (error) {
      toast.error("Couldn't save this draft", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSavingDraftEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!to?.trim()) {
      toast.error("Recruiter email required", { description: "Add a recipient before sending." });
      return;
    }
    if (resumeMissing) {
      toast.error("Resume required", {
        description: "Upload your resume in Profile before sending an application.",
      });
      return;
    }

    setSending(true);
    try {
      const res = await sendApplicationEmail({
        to,
        cc,
        subject: email.subject,
        body: email.body,
        applicationData: buildApplicationData(),
      });
      toast.success("Application sent!", {
        description: `Your email to ${to} is on its way.`,
      });
      setApplication(res.data.data);
      setForm(res.data.data);
    } catch (error) {
      toast.error("Couldn't send the application", {
        description: error.response?.data?.message || "Please check your details and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  if (!application || !form) {
    return <p className="text-muted">Loading...</p>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => navigate("/applications")} className="flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to applications
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Job Details</h2>
              <StatusBadge status={application.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Company</label>
                <input className="input-field" value={form.companyName} onChange={(e) => handleFieldChange("companyName", e.target.value)} />
              </div>
              <div>
                <label className="label-text">Position</label>
                <input className="input-field" value={form.jobTitle} onChange={(e) => handleFieldChange("jobTitle", e.target.value)} />
              </div>
              <div>
                <label className="label-text">Recruiter Email</label>
                <input className="input-field" value={form.recruiterEmail} onChange={(e) => handleFieldChange("recruiterEmail", e.target.value)} />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input className="input-field" value={form.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} />
              </div>
              <div>
                <label className="label-text">Job URL</label>
                <input className="input-field" value={form.jobUrl || ""} onChange={(e) => handleFieldChange("jobUrl", e.target.value)} />
              </div>
              <div>
                <label className="label-text">Match Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field"
                  value={form.matchScore}
                  onChange={(e) => handleFieldChange("matchScore", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label-text">Status</label>
                <select className="input-field" value={form.status} onChange={(e) => handleFieldChange("status", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Follow-up Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.followUpDate ? form.followUpDate.slice(0, 10) : ""}
                  onChange={(e) => handleFieldChange("followUpDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label-text">Notes</label>
              <textarea className="input-field min-h-[100px]" value={form.notes || ""} onChange={(e) => handleFieldChange("notes", e.target.value)} />
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {application.email?.body && application.email?.sentAt && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg mb-3">Sent Email</h2>
              <p className="text-sm font-medium mb-1">Subject: {application.email.subject}</p>
              <p className="text-sm text-muted whitespace-pre-wrap">{application.email.body}</p>
            </div>
          )}

          {isUnsent && !email && (
            <div className="card p-6 flex flex-col items-center text-center gap-3">
              <div>
                <h2 className="font-display font-semibold text-lg">Application email</h2>
                <p className="text-sm text-muted mt-1">
                  This application doesn't have an email yet. Generate one, then send it whenever you're ready.
                </p>
              </div>
              <button
                onClick={handleGenerateEmail}
                disabled={generatingEmail}
                className="btn-primary flex items-center gap-2 justify-center"
              >
                {generatingEmail ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generatingEmail ? "Generating..." : "Generate Application Email"}
              </button>
            </div>
          )}

          {isUnsent && email && (
            <EmailEditor
              to={to}
              cc={cc}
              subject={email.subject}
              body={email.body}
              onToChange={setTo}
              onCcChange={setCc}
              onSubjectChange={(v) => setEmail({ ...email, subject: v })}
              onBodyChange={(v) => setEmail({ ...email, body: v })}
              onAIAction={handleAIAction}
              aiLoading={aiEditLoading}
              onSaveDraft={handleSaveEmailDraft}
              onSend={handleSendEmail}
              sending={sending}
              savingDraft={savingDraftEmail}
              resumeMissing={resumeMissing}
            />
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Timeline</h2>
          <div className="space-y-4">
            {application.timeline?.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                  {index !== application.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted">{new Date(event.date).toLocaleString()}</p>
                  {event.note && <p className="text-xs text-muted mt-0.5">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 mt-2 space-y-2">
            <input
              className="input-field text-sm"
              placeholder="Event label (e.g. Interview Scheduled)"
              value={newEvent.label}
              onChange={(e) => setNewEvent({ ...newEvent, label: e.target.value })}
            />
            <input
              className="input-field text-sm"
              placeholder="Note (optional)"
              value={newEvent.note}
              onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
            />
            <button onClick={handleAddEvent} className="btn-secondary w-full flex items-center justify-center gap-1 text-sm">
              <Plus size={14} /> Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
