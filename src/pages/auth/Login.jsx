import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Rocket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!", { description: "Redirecting you to your dashboard." });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Couldn't log you in", {
        description: error.response?.data?.message || "Check your email and password and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg">JobPilot AI</span>
        </div>

        <div className="card p-7">
          <h1 className="text-xl font-display font-semibold mb-1">Log in</h1>
          <p className="text-sm text-muted mb-6">Welcome back, let's get you applying.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
