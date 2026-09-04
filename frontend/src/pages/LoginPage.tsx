import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import {
  loginSchema,
  type LoginFormData,
} from "../validators/login.validator";
import { ApiError, loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
const { refreshUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof loginSchema>, any, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await loginUser(data.email, data.password);

      await refreshUser();

      navigate("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", {
          type: "server",
          message: error.message,
        });

        return;
      }

      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-sm">
        <Link
          to="/"
          aria-label="Go to home"
          className="mb-6 inline-flex items-center"
        >
          <img
            width="20"
            height="20"
            src="https://img.icons8.com/parakeet-filled/48/home.png"
            alt="home"
          />
        </Link>

        <h1 className="mb-6 text-2xl font-bold">
          Login to your Mediconnect account
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full rounded-lg border p-2"
            />

            {errors.email && (
              <p className="text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-lg border p-2"
            />

            {errors.password && (
              <p className="text-sm">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border-2 bg-amber-200 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;