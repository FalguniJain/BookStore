import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  // If user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left column: Forms */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">BookLoop</h1>
            <p className="text-muted-foreground">
              Your campus book exchange platform
            </p>
          </div>

          {/* Login Form */}
          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <input
                  {...loginForm.register("username")}
                  className="w-full p-2 rounded border"
                  placeholder="Enter your username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <input
                  {...loginForm.register("password")}
                  type="password"
                  className="w-full p-2 rounded border"
                  placeholder="Enter your password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          {/* Registration Form */}
          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Register</h2>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Username</label>
                <input
                  {...registerForm.register("username")}
                  className="w-full p-2 rounded border"
                  placeholder="Choose a username"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  {...registerForm.register("email")}
                  type="email"
                  className="w-full p-2 rounded border"
                  placeholder="Enter your email"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <input
                  {...registerForm.register("password")}
                  type="password"
                  className="w-full p-2 rounded border"
                  placeholder="Create a password"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right column: Hero section */}
      <div className="hidden lg:block w-1/2 bg-primary">
        <div className="h-full flex flex-col justify-center items-center text-white p-12">
          <h2 className="text-4xl font-bold mb-6">Exchange Books, Exchange Knowledge</h2>
          <p className="text-xl max-w-lg text-center mb-8">
            BookLoop helps students find and exchange textbooks within their campus community, saving money and reducing waste.
          </p>
          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">Easy to Use</h3>
              <p>Browse, post, and contact sellers all in one platform.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">Campus Focused</h3>
              <p>Find books specific to your courses and campus.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">Save Money</h3>
              <p>Buy and sell textbooks at reasonable prices.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">Eco-Friendly</h3>
              <p>Reduce waste by giving books a second life.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}