import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { updateSettings } from "@/services/profileService";

const TONE_OPTIONS = ["Professional", "Friendly", "Formal", "Concise"];

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [tone, setTone] = useState(user?.settings?.emailTone || "Professional");
  const [signature, setSignature] = useState(user?.settings?.signature || "");
  const [notifications, setNotifications] = useState({
    notifyFollowUps: user?.settings?.notifyFollowUps ?? true,
    notifySent: user?.settings?.notifySent ?? true,
    notifyInterviews: user?.settings?.notifyInterviews ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ emailTone: tone, signature, ...notifications });
      await refreshUser();
      toast.success("Settings saved", { description: "Your preferences will apply to future emails." });
    } catch (error) {
      toast.error("Couldn't save your settings", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setNotifications({ ...notifications, [key]: !notifications[key] });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6 space-y-3">
        <h2 className="font-display font-semibold text-lg">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Name</label>
            <input className="input-field bg-bg" value={user?.name || ""} disabled />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input className="input-field bg-bg" value={user?.email || ""} disabled />
          </div>
        </div>
        <p className="text-xs text-muted">Update these from the Profile page.</p>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="font-display font-semibold text-lg">Email</h2>
        <p className="text-sm text-muted">
          SMTP status: <span className="text-primary font-medium">Configured on the server via environment variables</span>
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">AI Preferences</h2>

        <div>
          <label className="label-text">Default Email Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setTone(option)}
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  tone === option ? "bg-primary text-white border-primary" : "border-border bg-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">Default Signature</label>
          <textarea
            className="input-field min-h-[70px]"
            placeholder="Best regards, Your Name"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="font-display font-semibold text-lg">Notifications</h2>

        {[
          { key: "notifyFollowUps", label: "Follow-up reminders" },
          { key: "notifySent", label: "Application sent confirmation" },
          { key: "notifyInterviews", label: "Interview reminders" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between py-1.5">
            <span className="text-sm">{label}</span>
            <input type="checkbox" checked={notifications[key]} onChange={() => toggle(key)} className="w-4 h-4 accent-primary" />
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
