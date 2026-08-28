import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import {
  signupSchema,
  type SignupFormData,
} from "../validators/signup.validator";
import { createUser } from "../services/api";

function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof signupSchema>, any, z.output<typeof signupSchema>>(
    {
      resolver: zodResolver(signupSchema),
    },
  );

  async function onSubmit(data: SignupFormData) {
    try {
      const result = await createUser(data);
      console.log(result);
    } catch (error) {
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
          Create your Mediconnect account
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

            {errors.email && <p className="text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone">Phone</label>

            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full rounded-lg border p-2"
            />

            {errors.phone && <p className="text-sm">{errors.phone.message}</p>}
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

          <button
            type="submit"
            className="w-full rounded-lg px-4 py-2 font-medium bg-amber-200 border-2 "
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
