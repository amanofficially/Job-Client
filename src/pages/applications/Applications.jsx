import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Briefcase,
  Users,
  Trophy,
  XCircle,
  Plus,
} from "lucide-react";
import {
  getApplications,
  deleteApplication,
  updateStatus,
} from "@/services/applicationService";
import { getDashboardStats } from "@/services/dashboardService";
import { STATUS_OPTIONS } from "@/utils/constants";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AddApplicationModal from "@/components/applications/AddApplicationModal";

const DEBOUNCE_MS = 400;

const MatchScorePill = ({ score }) => {
  const tone =
    score >= 75
      ? "bg-primary-light text-primary-dark"
      : score >= 45
        ? "bg-warn-light text-warn"
        : "bg-danger-light text-danger";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${tone}`}
    >
      {score}%
    </span>
  );
};

const CompanyAvatar = ({ name }) => {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const palettes = [
    "bg-primary-light text-primary-dark",
    "bg-accent-light text-accent",
    "bg-warn-light text-warn",
  ];
  const idx = (name || "").length % palettes.length;
  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-semibold text-sm shrink-0 ${palettes[idx]}`}
    >
      {initial}
    </div>
  );
};

const buildPageWindow = (current, total) => {
  const pages = [];
  const add = (p) => pages.push(p);
  const windowSize = 1;

  add(1);
  if (current - windowSize > 2) add("…");
  for (
    let p = Math.max(2, current - windowSize);
    p <= Math.min(total - 1, current + windowSize);
    p++
  )
    add(p);
  if (current + windowSize < total - 1) add("…");
  if (total > 1) add(total);

  return pages;
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("applicationDate");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const fetchApplications = async () => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    try {
      const res = await getApplications({
        search,
        status,
        sortBy,
        order,
        page,
        limit: 8,
      });
      if (thisRequest !== requestId.current) return;
      setApplications(res.data.data.applications);
      setPagination(res.data.data.pagination);
    } catch (error) {
      if (thisRequest !== requestId.current) return;
      toast.error("Couldn't load your applications", {
        description:
          error.response?.data?.message ||
          "Check your connection and try again.",
      });
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, sortBy, order, page]);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch {
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const performDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteApplication(confirmTarget.id);
      toast.success("Application deleted", {
        description: confirmTarget.label
          ? `"${confirmTarget.label}" was removed from your applications.`
          : undefined,
      });
      setConfirmTarget(null);
      fetchApplications();
      fetchStats();
    } catch (error) {
      toast.error("Couldn't delete this application", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      toast.success("Status updated", {
        description: `Marked as "${newStatus}".`,
      });
      fetchApplications();
      fetchStats();
    } catch (error) {
      toast.error("Couldn't update status", {
        description: error.response?.data?.message || "Please try again.",
      });
    }
  };

  const hasFilters = useMemo(() => search || status, [search, status]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const pageWindow = useMemo(
    () => buildPageWindow(pagination.page, pagination.pages),
    [pagination],
  );

  return (
    <div className="space-y-5">
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center shrink-0">
              <Briefcase size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-semibold leading-none">
                {stats.total}
              </p>
              <p className="text-xs text-muted mt-1">Total applications</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warn-light text-warn flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-semibold leading-none">
                {stats.interviews}
              </p>
              <p className="text-xs text-muted mt-1">Interviewing</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-semibold leading-none">
                {stats.offers}
              </p>
              <p className="text-xs text-muted mt-1">Offers</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0">
              <XCircle size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-semibold leading-none">
                {stats.rejected}
              </p>
              <p className="text-xs text-muted mt-1">Rejected</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
          <input
            className="input-field pl-9"
            placeholder="Search by company, title or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <Plus size={14} /> Add Application
          </button>

          <select
            className="input-field w-auto flex-1 sm:flex-none"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="input-field w-auto flex-1 sm:flex-none"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split("-");
              setSortBy(field);
              setOrder(dir);
            }}
          >
            <option value="applicationDate-desc">Newest first</option>
            <option value="applicationDate-asc">Oldest first</option>
            <option value="matchScore-desc">Match score: high to low</option>
            <option value="matchScore-asc">Match score: low to high</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm px-3 flex items-center gap-1.5 shrink-0"
              title="Clear filters"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="card hidden sm:block overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-bg text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Position</th>
              <th className="text-left px-5 py-3 font-medium">Match</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Applied On</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-muted">
                      <Inbox size={22} />
                    </div>
                    <p className="text-muted text-sm max-w-xs">
                      {hasFilters
                        ? "No applications match your filters."
                        : "No applications yet. Your first one will show up here."}
                    </p>
                    {hasFilters ? (
                      <button
                        onClick={clearFilters}
                        className="btn-secondary text-sm"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <Link to="/apply" className="btn-primary text-sm">
                        Apply for a job
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              applications.map((app) => (
                <tr key={app._id} className="hover:bg-bg/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <CompanyAvatar name={app.companyName} />
                      <span className="font-medium truncate max-w-[160px]">
                        {app.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{app.jobTitle}</td>
                  <td className="px-5 py-3">
                    <MatchScorePill score={app.matchScore} />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app._id, e.target.value)
                      }
                      className="text-xs border border-border rounded-full px-2 py-1 bg-white cursor-pointer hover:border-primary/40 transition-colors"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-muted whitespace-nowrap">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/applications/${app._id}`}
                        className="text-muted hover:text-primary transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() =>
                          setConfirmTarget({
                            id: app._id,
                            label: `${app.jobTitle} @ ${app.companyName}`,
                          })
                        }
                        className="text-muted hover:text-danger transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {loading && (
          <div className="card p-6 text-center text-muted text-sm">
            Loading...
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="card p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-muted">
              <Inbox size={22} />
            </div>
            <p className="text-muted text-sm">
              {hasFilters
                ? "No applications match your filters."
                : "No applications yet."}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Clear filters
              </button>
            ) : (
              <Link to="/apply" className="btn-primary text-sm">
                Apply for a job
              </Link>
            )}
          </div>
        )}

        {!loading &&
          applications.map((app) => (
            <div key={app._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyAvatar name={app.companyName} />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{app.jobTitle}</p>
                    <p className="text-sm text-muted truncate">
                      {app.companyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/applications/${app._id}`}
                    className="text-muted hover:text-primary"
                    title="View"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() =>
                      setConfirmTarget({
                        id: app._id,
                        label: `${app.jobTitle} @ ${app.companyName}`,
                      })
                    }
                    className="text-muted hover:text-danger"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 mt-3">
                <MatchScorePill score={app.matchScore} />
                <StatusBadge status={app.status} />
                <span className="text-xs text-muted ml-auto">
                  {new Date(app.applicationDate).toLocaleDateString()}
                </span>
              </div>

              <select
                value={app.status}
                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                className="input-field mt-3 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted bg-white border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-bg"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {pageWindow.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 h-8 flex items-center justify-center text-muted text-sm"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm shrink-0 transition-colors ${
                  p === pagination.page
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-muted hover:bg-bg"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={pagination.page >= pagination.pages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted bg-white border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-bg"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Delete this application?"
        description={
          confirmTarget?.label
            ? `"${confirmTarget.label}" will be permanently removed. This cannot be undone.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={performDelete}
      />

      <AddApplicationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          fetchApplications();
          fetchStats();
        }}
      />
    </div>
  );
};

export default Applications;
