import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const [visiblePassword, setVisiblePassword] = useState(true);
  const navigate = useNavigate();
  const errorModal = () => toast.error("Account doesn't exist.");
  const errorVerifiedModal = () => toast.error("Account doesn't verified.");


  const Login = async (e) => {
    e.preventDefault();

    await signInWithEmailAndPassword(
      auth,
      email.current.value,
      password.current.value
    )
      .then((result) => {
        if (result.user.emailVerified) {
          if (result.user.displayName === "client") {
            navigate("/client-planner");
          } else if (result.user.displayName === "admin") {
            navigate("/admin");
          }
        } else {
          errorVerifiedModal();
        }
      })
      .catch((error) => {
        errorModal();
        console.log(error);
      });
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} width="500px" />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            action="#"
            method="POST"
            onSubmit={(e) => Login(e)}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  ref={email}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-brown hover:text-lightbrown"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="position-relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={visiblePassword ? "password" : "text"}
                  autoComplete="current-password"
                  ref={password}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
                <div className="eye-position">
                  {visiblePassword ? (
                    <IoMdEye
                      style={{ cursor: "pointer" }}
                      onClick={() => setVisiblePassword(false)}
                      color="black"
                    />
                  ) : (
                    <IoMdEyeOff
                      style={{ cursor: "pointer" }}
                      onClick={() => setVisiblePassword(true)}
                      color="black"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-brown px-3 text-sm font-semibold text-white shadow-sm hover:bg-lightbrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account? &nbsp;
            <Link
              to="/register"
              className="font-semibold leading-6 text-brown hover:text-lightbrown"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
