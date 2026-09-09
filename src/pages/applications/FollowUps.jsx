import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { getApplications } from "@/services/applicationService";
import { generateFollowUpEmail } from "@/services/aiService";
import { sendFollowUpEmail } from "@/services/emailService";

const FollowUps = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState({ subject: "", body: "" });
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const loadDueApplications = async () => {
    setLoading(true);
    try {
      const res = await getApplications({ limit: 100 });
      const due = res.data.data.applications
        .filter((a) => a.followUpDate)
        .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
      setApplications(due);
    } catch (error) {
      toast.error("Couldn't load your follow-ups", {
        description: error.response?.data?.message || "Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueApplications();
  }, []);

  const isDue = (date) => new Date(date) <= new Date();

  const handleGenerate = async (application) => {
    setOpenId(application._id);
    setGenerating(true);
    try {
      const res = await generateFollowUpEmail(application._id);
      setDraft(res.data.data);
    } catch (error) {
      toast.error("Couldn't generate the follow-up email", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (applicationId) => {
    setSending(true);
    try {
      await sendFollowUpEmail({ applicationId, subject: draft.subject, body: draft.body });
      toast.success("Follow-up sent", { description: "Nice work staying on top of it." });
      setOpenId(null);
      loadDueApplications();
    } catch (error) {
      toast.error("Couldn't send the follow-up", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  if (applications.length === 0) {
    return <p className="text-muted">No follow-ups scheduled. They'll show up here after you send an application.</p>;
  }

  return (
    <div className="max-w-3xl space-y-4">
      {applications.map((app) => (
        <div key={app._id} className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold">
                {app.jobTitle} <span className="text-muted font-normal">at {app.companyName}</span>
              </p>
              <p className={`text-sm mt-0.5 ${isDue(app.followUpDate) ? "text-danger" : "text-muted"}`}>
                Follow-up {isDue(app.followUpDate) ? "due" : "scheduled for"}{" "}
                {new Date(app.followUpDate).toLocaleDateString()}
              </p>
            </div>
            {openId !== app._id && (
              <button onClick={() => handleGenerate(app)} className="btn-secondary text-sm flex items-center gap-1.5">
                <Sparkles size={14} /> Generate Follow-up
              </button>
            )}
          </div>

          {openId === app._id && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {generating ? (
                <p className="text-sm text-muted flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Generating...
                </p>
              ) : (
                <>
                  <input
                    className="input-field"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                  <textarea
                    className="input-field min-h-[140px]"
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setOpenId(null)} className="btn-secondary text-sm">
                      Cancel
                    </button>
                    <button onClick={() => handleSend(app._id)} disabled={sending} className="btn-primary text-sm flex items-center gap-1.5">
                      <Send size={14} /> {sending ? "Sending..." : "Send Follow-up"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowUps;
