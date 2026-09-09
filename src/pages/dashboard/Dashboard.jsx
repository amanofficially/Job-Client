import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { Briefcase, Send, Users, Trophy, BellRing } from "lucide-react";
import { getDashboardStats } from "@/services/dashboardService";
import StatCard from "@/components/common/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-muted">Could not load dashboard stats.</p>;
  }

  return (
    <div className="space-y-6">
      {stats.followUpsDueToday > 0 && (
        <div className="card p-4 flex items-center gap-3 bg-accent-light border-accent/30">
          <BellRing size={18} className="text-accent" />
          <p className="text-sm text-ink">
            <span className="font-semibold">{stats.followUpsDueToday}</span> application
            {stats.followUpsDueToday > 1 ? "s" : ""} need a follow-up today.{" "}
            <Link to="/follow-ups" className="text-primary font-medium underline">
              View follow-ups
            </Link>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Applications" value={stats.total} icon={Briefcase} tone="primary" />
        <StatCard label="Applied" value={stats.applied} icon={Send} tone="primary" />
        <StatCard label="Interviews" value={stats.interviews} icon={Users} tone="warn" />
        <StatCard label="Offers" value={stats.offers} icon={Trophy} tone="accent" />
        <StatCard label="Rejected" value={stats.rejected} icon={Briefcase} tone="danger" />
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-muted">Success Rate</p>
          <p className="text-xl font-display font-semibold mt-1">{stats.successRate}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Interview Rate</p>
          <p className="text-xl font-display font-semibold mt-1">{stats.interviewRate}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Applications This Week</p>
          <p className="text-xl font-display font-semibold mt-1">{stats.thisWeek}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Applications This Month</p>
          <p className="text-xl font-display font-semibold mt-1">{stats.thisMonth}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="font-semibold mb-4">Applications - Last 14 Days</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4DE" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1F6F5C" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="font-semibold mb-4">Applications by Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.statusChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4DE" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#D98E4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
