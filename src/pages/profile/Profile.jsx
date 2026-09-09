import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FileText, Upload, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, uploadResume } from "@/services/profileService";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { register, handleSubmit, reset, getValues, setValue } = useForm();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone,
        headline: user.profile?.headline,
        location: user.profile?.location,
        skills: (user.profile?.skills || []).join(", "),
        experience: user.profile?.experience,
        education: user.profile?.education,
        portfolio: user.profile?.portfolio,
        github: user.profile?.github,
        linkedin: user.profile?.linkedin,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
        profile: {
          headline: data.headline,
          location: data.location,
          skills: data.skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience: data.experience,
          education: data.education,
          portfolio: data.portfolio,
          github: data.github,
          linkedin: data.linkedin,
        },
      });
      await refreshUser();
      setAutoFilled(false);
      toast.success("Profile updated", { description: "Your changes will be used in future application emails." });
    } catch (error) {
      toast.error("Couldn't update your profile", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const ALLOWED_RESUME_TYPES = [".pdf", ".doc", ".docx"];
  const MAX_RESUME_SIZE = 5 * 1024 * 1024;

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_RESUME_TYPES.includes(ext)) {
      toast.error("Unsupported file type", {
        description: "Please upload a PDF, DOC or DOCX file.",
      });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      toast.error("File too large", {
        description: "Your resume must be 5MB or smaller.",
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadResume(file);
      await refreshUser();

      const extracted = res.data?.data?.extractedProfile;

      setTimeout(() => {
        const fieldsFilled = extracted ? applyExtractedProfile(extracted) : 0;

        if (fieldsFilled > 0) {
          setAutoFilled(true);
          toast.success("Resume uploaded", {
            description: `Filled in ${fieldsFilled} empty field${fieldsFilled > 1 ? "s" : ""} from your resume. Review, then save.`,
          });
        } else {
          toast.success("Resume uploaded", {
            description: "It'll be attached automatically the next time you apply.",
          });
        }
      }, 0);
    } catch (error) {
      toast.error("Couldn't upload your resume", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const applyExtractedProfile = (extracted) => {
    const current = getValues();
    let filled = 0;

    const maybeSet = (field, value) => {
      if (!value) return;
      const isBlank = field === "skills" ? !current.skills?.trim() : !current[field]?.trim();
      if (isBlank) {
        setValue(field, value, { shouldDirty: true });
        filled += 1;
      }
    };

    maybeSet("name", extracted.name);
    maybeSet("phone", extracted.phone);
    maybeSet("headline", extracted.headline);
    maybeSet("location", extracted.location);
    if (extracted.skills?.length) maybeSet("skills", extracted.skills.join(", "));
    maybeSet("experience", extracted.experience);
    maybeSet("education", extracted.education);
    maybeSet("portfolio", extracted.portfolio);
    maybeSet("github", extracted.github);
    maybeSet("linkedin", extracted.linkedin);

    return filled;
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-1">Resume</h2>
        <p className="text-sm text-muted mb-4">This is attached automatically when you send an application.</p>

        <div className="flex items-center justify-between bg-bg rounded-lg px-4 py-3 border border-border">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span className="text-sm">{user?.resume?.fileName || "No resume uploaded yet"}</span>
          </div>
          <label className="btn-secondary text-sm cursor-pointer flex items-center gap-1.5">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          </label>
        </div>
      </div>

      {autoFilled && (
        <div className="card p-4 flex items-start gap-3 bg-primary-light border-primary/20">
          <div className="w-8 h-8 rounded-full bg-white text-primary-dark flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-dark">Auto-filled from your resume</p>
            <p className="text-xs text-primary-dark/80 mt-0.5">
              We only filled in fields that were empty. Review everything below, then hit Save Profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoFilled(false)}
            className="text-primary-dark/60 hover:text-primary-dark shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Your Profile</h2>
        <p className="text-sm text-muted -mt-2">The AI uses this information to personalize your application emails.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" {...register("name")} />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input className="input-field bg-bg" value={user?.email || ""} disabled />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input className="input-field" {...register("phone")} />
          </div>
          <div>
            <label className="label-text">Professional Headline</label>
            <input className="input-field" placeholder="Full Stack Developer" {...register("headline")} />
          </div>
          <div>
            <label className="label-text">Location</label>
            <input className="input-field" {...register("location")} />
          </div>
          <div>
            <label className="label-text">Skills (comma separated)</label>
            <input className="input-field" placeholder="React, Node.js, MongoDB" {...register("skills")} />
          </div>
        </div>

        <div>
          <label className="label-text">Experience</label>
          <textarea className="input-field min-h-[90px]" placeholder="Briefly describe your work experience..." {...register("experience")} />
        </div>

        <div>
          <label className="label-text">Education</label>
          <textarea className="input-field min-h-[70px]" {...register("education")} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label-text">Portfolio</label>
            <input className="input-field" {...register("portfolio")} />
          </div>
          <div>
            <label className="label-text">GitHub</label>
            <input className="input-field" {...register("github")} />
          </div>
          <div>
            <label className="label-text">LinkedIn</label>
            <input className="input-field" {...register("linkedin")} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
