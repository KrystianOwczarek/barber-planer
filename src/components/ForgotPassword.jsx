import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const email = useRef();
  const navigate = useNavigate();
  const successToast = () => toast.success("Password changed successfully.");
  const errorToast = () => toast.error("Password was not changed.");


  const ResetPassword = async (e) => {
    e.preventDefault();

    await sendPasswordResetEmail(auth, email.current.value)
      .then(() => {
        successToast();
        setTimeout(navigate("/"), 2000);
      })
      .catch((error) => {
        errorToast();
        console.error(error);
      });
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Forgot password?
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            action="#"
            method="POST"
            onSubmit={(e) => ResetPassword(e)}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium leading-6 text-gray-900"
              >
                To reset your password, please enter your email address below.
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
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-brown px-3 text-sm font-semibold text-white shadow-sm hover:bg-lightbrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Reset password
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              I remember my password. &nbsp;
              <Link
                to="/"
                className="font-semibold leading-6 text-brown hover:text-lightbrown"
              >
                Sign in.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
