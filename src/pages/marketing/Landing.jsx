import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Mail,
  MousePointerClick,
  ClipboardCheck,
  BellRing,
  Rocket,
  Menu,
  X,
  FileText,
  Send,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Job Analysis",
    description:
      "Paste any job description and instantly see how well your profile matches it.",
  },
  {
    icon: Mail,
    title: "AI Email Generation",
    description:
      "Get a personalized application email written around the exact role, in seconds.",
  },
  {
    icon: MousePointerClick,
    title: "One-Click Sending",
    description:
      "Review, edit, and send your application only when you're ready to.",
  },
  {
    icon: ClipboardCheck,
    title: "Application Tracker",
    description:
      "Every application you send is tracked automatically from one dashboard.",
  },
  {
    icon: BellRing,
    title: "Follow-up Reminders",
    description:
      "JobPilot tells you exactly when it's time to follow up, so nothing slips through.",
  },
];

const steps = [
  {
    title: "Paste the job description",
    description:
      "Drop in the JD — JobPilot pulls out the company, role, and recruiter details for you.",
  },
  {
    title: "Review your match",
    description:
      "See a match score against your profile, plus exactly which skills to highlight.",
  },
  {
    title: "Send with confidence",
    description:
      "AI drafts the email, you review and edit it, then send your resume in one click.",
  },
];

const HeroIllustration = () => (
  <svg
    viewBox="0 0 420 340"
    className="w-full h-auto"
    role="img"
    aria-label="Resume being sent as an application email"
  >
    <defs>
      <linearGradient id="heroCard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F3F6F4" />
      </linearGradient>
    </defs>

    <circle cx="210" cy="170" r="165" fill="#E4F2EE" />

    <g transform="translate(48 60)">
      <rect
        width="150"
        height="200"
        rx="14"
        fill="url(#heroCard)"
        stroke="#E4E4DE"
        strokeWidth="1.5"
      />
      <circle cx="34" cy="34" r="14" fill="#1F6F5C" opacity="0.15" />
      <circle cx="34" cy="34" r="8" fill="#1F6F5C" />
      <rect
        x="56"
        y="27"
        width="70"
        height="7"
        rx="3.5"
        fill="#1C2321"
        opacity="0.75"
      />
      <rect
        x="56"
        y="40"
        width="46"
        height="6"
        rx="3"
        fill="#6B7570"
        opacity="0.6"
      />
      {[70, 90, 110, 130, 150, 170].map((y, i) => (
        <rect
          key={y}
          x="22"
          y={y}
          width={i % 2 === 0 ? 106 : 84}
          height="6"
          rx="3"
          fill="#E4E4DE"
        />
      ))}
    </g>

    <path
      d="M212 150 C 235 150, 235 150, 255 150"
      stroke="#D98E4A"
      strokeWidth="3"
      fill="none"
      strokeDasharray="2 8"
      strokeLinecap="round"
    />

    <g transform="translate(250 95)">
      <rect
        width="132"
        height="96"
        rx="12"
        fill="#FFFFFF"
        stroke="#E4E4DE"
        strokeWidth="1.5"
      />
      <path
        d="M6 14 L66 60 L126 14"
        stroke="#1F6F5C"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="106" cy="76" r="20" fill="#1F6F5C" />
      <path
        d="M97 76 L103 82 L116 68"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    <g transform="translate(150 250)">
      <rect width="140" height="52" rx="26" fill="#1C2321" />
      <text
        x="70"
        y="32"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="Sora, sans-serif"
      >
        92% Match
      </text>
    </g>

    <circle cx="60" cy="280" r="5" fill="#D98E4A" />
    <circle cx="368" cy="60" r="4" fill="#1F6F5C" opacity="0.5" />
    <circle cx="20" cy="120" r="3" fill="#1F6F5C" opacity="0.4" />
  </svg>
);

const journeyPhotos = [
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    alt: "Person planning notes next to a laptop",
    caption: "Plan",
    description: "Paste the JD and let JobPilot map it against your profile.",
  },
  {
    src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
    alt: "Person applying for jobs on a laptop",
    caption: "Apply",
    description: "Send a personalized email in minutes, from anywhere.",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    alt: "Three colleagues smiling together after good news",
    caption: "Get hired",
    description: "Track every reply and follow-up until you land the offer.",
  },
];

const ctaBackground =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      <header className="relative">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg truncate">
              JobPilot AI
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login" className="btn-secondary">
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>

          <button
            className="sm:hidden text-ink p-2 -mr-2"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pb-5 flex flex-col gap-2 max-w-6xl mx-auto">
            <Link
              to="/login"
              className="btn-secondary w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="btn-primary w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            Apply smarter. Track everything.
          </h1>
          <p className="text-base sm:text-lg text-muted mt-5 max-w-md mx-auto lg:mx-0">
            Let AI personalize your job applications while you focus on landing
            the interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Start Applying
            </Link>
            <a href="#features" className="btn-secondary text-base px-6 py-3">
              See how it works
            </a>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 text-sm text-muted">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Resume-aware matching
            </div>
            <div className="flex items-center gap-2">
              <Send size={16} className="text-primary" />
              Nothing sends without you
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 max-w-sm sm:max-w-md mx-auto w-full">
          <HeroIllustration />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="card p-5 relative">
              <span className="text-3xl font-display font-bold text-primary/15 leading-none">
                0{i + 1}
              </span>
              <p className="font-semibold mt-2">{step.title}</p>
              <p className="text-sm text-muted mt-1.5">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-display font-semibold">
            From plan to offer letter
          </h2>
          <p className="text-muted text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Real job seekers use JobPilot at every stage — not just to write
            emails, but to stay organized until they get the "yes."
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {journeyPhotos.map((photo, i) => (
            <div
              key={photo.caption}
              className={`card overflow-hidden ${i === 1 ? "sm:-translate-y-3" : ""}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-44 object-cover"
              />
              <div className="p-4">
                <p className="font-display font-semibold">{photo.caption}</p>
                <p className="text-sm text-muted mt-1">{photo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24"
      >
        <h2 className="text-xl sm:text-2xl font-display font-semibold mb-8 text-center">
          Everything you need to apply with confidence
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-5">
              <div className="w-10 h-10 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <p className="font-semibold mb-1">{title}</p>
              <p className="text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <div
          className="relative overflow-hidden rounded-card shadow-card text-center px-6 py-14 sm:py-20"
          style={{
            backgroundImage: `linear-gradient(rgba(23, 86, 74, 0.2), rgba(31, 111, 92, 0.8)), url(${ctaBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white">
            Ready to apply smarter?
          </h2>
          <p className="text-white/85 mt-3 max-w-md mx-auto text-sm sm:text-base">
            Create your profile once, then let JobPilot handle the busywork on
            every application.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-dark font-medium px-6 py-3 rounded-lg mt-7 hover:bg-white/90 transition-colors shadow-sm"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted">
        JobPilot AI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;
