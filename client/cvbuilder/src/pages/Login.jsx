import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { cvApi } from "../helpers/http-client";
import Swal from "sweetalert2";

/**
 * WHAT: Login page with email/password authentication
 * INPUT: Email and password from form
 * OUTPUT: Authenticates user and redirects to dashboard on success
 */

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);
      if (localStorage.getItem("access_token")) {
        navigate("/dashboard");
        return;
      }

      // console.log(localStorage.removeItem("access_token"), "<<< Token");

      const response = await cvApi.post("/login", {
        email,
        password,
      });

      console.log(response.data, "<<< Login");

      localStorage.setItem("access_token", response.data.access_token);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Login successful",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/dashboard");
    } catch (error) {
      console.log(error.response, "<<< Login");

      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "There was an error",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLoginResponse(res) {
    try {
      const response = await cvApi.post(
        "/auth/google",
        {},
        {
          headers: {
            token: res.credential,
          },
        },
      );

      const data = response.data;
      localStorage.setItem("access_token", data.access_token);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Login successful",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Google login failed",
      });
    }
  }

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLoginResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
        },
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (localStorage.getItem("access_token")) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">
          Smart CV Assistant
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Generate professional CVs with AI
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div id="google-signin-button" className="w-full"></div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Features:
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Upload PDF or Word documents</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>AI-powered CV generation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Professional formatting</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Secure cloud storage</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
