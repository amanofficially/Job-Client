import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, CheckCircle2, Briefcase, PenLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { analyzeJob, generateEmail, improveEmail } from "@/services/aiService";
import { sendApplicationEmail } from "@/services/emailService";
import { createApplication } from "@/services/applicationService";
import MatchScoreCard from "@/components/applications/MatchScoreCard";
import EmailEditor from "@/components/email/EmailEditor";

const Apply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, setValue, watch } = useForm();

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [autoFilled, setAutoFilled] = useState({});
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);

  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [email, setEmail] = useState(null);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");

  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);

  const resumeMissing = !user?.resume?.fileUrl;
  const jobTitleValue = watch("jobTitle");

  const fillIfEmpty = (field, value, detected) => {
    if (!value) return;
    const current = getValues(field);
    if (!current || !current.trim()) {
      setValue(field, value, { shouldDirty: false });
      if (detected) setAutoFilled((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleAnalyze = async (formData) => {
    if (!formData.jobDescription?.trim()) {
      toast.error("Job description required", {
        description: "Paste the full job description so JobPilot can analyze it.",
      });
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setEmail(null);
    setSelectedRoleIndex(null);
    setAutoFilled({});

    try {
      const res = await analyzeJob(formData.jobDescription);
      const data = res.data.data;
      setAnalysis(data);

      fillIfEmpty("companyName", data.company, true);
      fillIfEmpty("jobTitle", data.jobTitle, true);
      fillIfEmpty("location", data.location, true);
      fillIfEmpty("recruiterEmail", data.recruiterEmail, true);
      if (data.recruiterEmail) setTo((prev) => prev || data.recruiterEmail);
      if (data.employmentType) fillIfEmpty("jobType", data.employmentType, true);

      const extractedCount = ["company", "jobTitle", "location", "recruiterEmail"].filter(
        (f) => data[f]
      ).length;

      if (data.detectedRoles?.length > 1) {
        toast.success("Multiple roles found in this posting", {
          description: `Pick the exact role you're applying for below — we found ${data.detectedRoles.length} open positions.`,
        });
      } else if (extractedCount > 0) {
        toast.success("Job details extracted", {
          description: "Company, role and contact details were filled in automatically. Review before sending.",
        });
      } else {
        toast.success("Job analyzed", {
          description: "We couldn't find company/contact details in the text — please fill them in manually.",
        });
      }
    } catch (error) {
      toast.error("Couldn't analyze this job description", {
        description: error.response?.data?.message || "Please check the text and try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectRole = (role, index) => {
    setSelectedRoleIndex(index);
    setValue("jobTitle", role.jobTitle, { shouldDirty: false });
    setAutoFilled((prev) => ({ ...prev, jobTitle: true }));
    if (role.location) setValue("location", role.location, { shouldDirty: false });
    toast.success(`Role selected: ${role.jobTitle}`);
  };

  const handleGenerateEmail = async () => {
    setGeneratingEmail(true);
    try {
      const res = await generateEmail(
        { ...analysis, jobTitle: getValues("jobTitle") || analysis.jobTitle, company: getValues("companyName") || analysis.company },
        user?.settings?.emailTone
      );
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
        const res = await generateEmail(analysis, user?.settings?.emailTone);
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

  const buildApplicationData = () => {
    const formValues = getValues();
    return {
      companyName: formValues.companyName,
      jobTitle: formValues.jobTitle,
      jobDescription: formValues.jobDescription,
      companyWebsite: formValues.companyWebsite || "",
      jobUrl: formValues.jobUrl || "",
      salary: formValues.salary || "",
      jobType: formValues.jobType || "",
      location: formValues.location || "",
      source: formValues.source || "",
      matchScore: analysis?.matchScore || 0,
      matchingSkills: analysis?.matchingSkills || [],
      missingSkills: analysis?.missingSkills || [],
      recommendation: analysis?.recommendation || "",
    };
  };

  const validateCoreFields = () => {
    const values = getValues();
    const missing = [];
    if (!values.companyName?.trim()) missing.push("Company Name");
    if (!values.jobTitle?.trim()) missing.push("Job Title");
    if (!to?.trim()) missing.push("Recruiter Email");

    if (missing.length > 0) {
      toast.error("A few details are missing", {
        description: `Please fill in: ${missing.join(", ")}.`,
      });
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateCoreFields()) return;
    setSavingDraft(true);
    try {
      await createApplication({ ...buildApplicationData(), recruiterEmail: to, status: "Draft" });
      toast.success("Draft saved", {
        description: "You can find it anytime in Applications and finish it later.",
      });
      navigate("/applications");
    } catch (error) {
      toast.error("Couldn't save this draft", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSend = async () => {
    if (!validateCoreFields()) return;

    if (resumeMissing) {
      toast.error("Resume required", {
        description: "Upload your resume in Profile before sending an application.",
      });
      return;
    }

    setSending(true);
    try {
      await sendApplicationEmail({
        to,
        cc,
        subject: email.subject,
        body: email.body,
        applicationData: buildApplicationData(),
      });
      toast.success("Application sent!", {
        description: `Your email to ${to} is on its way. Track its progress in Applications.`,
      });
      navigate("/applications");
    } catch (error) {
      toast.error("Couldn't send the application", {
        description: error.response?.data?.message || "Please check your details and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit(handleAnalyze)} className="card p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg">Paste the job description</h2>
          <p className="text-sm text-muted mt-1">
            We'll automatically pull out the company, role, location and recruiter email —
            you only fill in what we can't find.
          </p>
        </div>

        <div>
          <textarea
            className="input-field min-h-[180px]"
            placeholder="Paste the full job description here..."
            {...register("jobDescription", { required: true })}
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={analyzing} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {analyzing ? "Analyzing..." : "Extract & Analyze Job"}
          </button>
        </div>

        {analysis?.detectedRoles?.length > 1 && (
          <div className="bg-accent-light border border-accent/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-ink flex items-center gap-1.5 mb-3">
              <Briefcase size={15} className="text-accent" />
              This posting lists {analysis.detectedRoles.length} roles — which one are you applying for?
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedRoles.map((role, i) => (
                <button
                  type="button"
                  key={`${role.jobTitle}-${i}`}
                  onClick={() => handleSelectRole(role, i)}
                  className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                    selectedRoleIndex === i
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium block">{role.jobTitle || "Role"}</span>
                  {(role.location || role.experienceRequired) && (
                    <span className={selectedRoleIndex === i ? "text-white/80" : "text-muted"}>
                      {[role.location, role.experienceRequired].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-5">
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <PenLine size={14} className="text-muted" />
            <p className="label-text mb-0">Job information</p>
            {Object.keys(autoFilled).length > 0 && (
              <span className="text-xs text-primary-dark bg-primary-light px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> Auto-filled
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text flex items-center gap-1.5">
                Company Name
                {autoFilled.companyName && <CheckCircle2 size={13} className="text-primary" />}
              </label>
              <input className="input-field" placeholder="Deloitte" {...register("companyName")} />
            </div>
            <div>
              <label className="label-text flex items-center gap-1.5">
                Job Title
                {autoFilled.jobTitle && <CheckCircle2 size={13} className="text-primary" />}
              </label>
              <input
                className="input-field"
                placeholder="Software Engineer"
                {...register("jobTitle")}
                value={jobTitleValue || ""}
                onChange={(e) => setValue("jobTitle", e.target.value)}
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-1.5">
                Recruiter Email
                {autoFilled.recruiterEmail && <CheckCircle2 size={13} className="text-primary" />}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="hr@example.com"
                {...register("recruiterEmail")}
                onChange={(e) => {
                  register("recruiterEmail").onChange(e);
                  setTo(e.target.value);
                }}
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-1.5">
                Job Location
                {autoFilled.location && <CheckCircle2 size={13} className="text-primary" />}
              </label>
              <input className="input-field" placeholder="Hyderabad" {...register("location")} />
            </div>
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-primary font-medium">Optional details</summary>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="label-text">Company Website</label>
              <input className="input-field" {...register("companyWebsite")} />
            </div>
            <div>
              <label className="label-text">Job URL</label>
              <input className="input-field" {...register("jobUrl")} />
            </div>
            <div>
              <label className="label-text">Salary</label>
              <input className="input-field" {...register("salary")} />
            </div>
            <div>
              <label className="label-text">Job Type</label>
              <input className="input-field" placeholder="Full-time" {...register("jobType")} />
            </div>
            <div>
              <label className="label-text">Source</label>
              <input className="input-field" placeholder="LinkedIn" {...register("source")} />
            </div>
          </div>
        </details>
      </form>

      {analysis && (
        <>
          <MatchScoreCard analysis={analysis} />

          {!email && (
            <div className="flex justify-center">
              <button onClick={handleGenerateEmail} disabled={generatingEmail} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                {generatingEmail ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generatingEmail ? "Generating..." : "Generate Application Email"}
              </button>
            </div>
          )}
        </>
      )}

      {email && (
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
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          sending={sending}
          savingDraft={savingDraft}
          resumeMissing={resumeMissing}
        />
      )}
    </div>
  );
};

export default Apply;
