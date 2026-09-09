const StatCard = ({ label, value, icon: Icon, tone = "primary" }) => {
  const toneClasses = {
    primary: "bg-primary-light text-primary-dark",
    accent: "bg-accent-light text-accent",
    warn: "bg-warn-light text-warn",
    danger: "bg-danger-light text-danger",
  };

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-display font-semibold mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatCard;
