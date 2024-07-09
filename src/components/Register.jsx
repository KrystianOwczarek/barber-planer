import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../firebase";
import { getDocs, setDoc, collection, doc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function Register() {
  const name = useRef();
  const surname = useRef();
  const email = useRef();
  const phone = useRef();
  const password = useRef();
  const [visiblePassword, setVisiblePassword] = useState(true);
  const [existPhoneArray, setExistPhoneArray] = useState();
  const confirmpassword = useRef();
  const [visibleConfirmPassword, setVisibleConfirmPassword] = useState(true);
  const successModal = () => toast.success("The account has been created.");
  const errorModal = () => toast.error("The account has not been created.");
  const errorEmailModal = () => toast.error("An account with the provided email address already exists.");
  const errorPasswordToast = () => toast.error("Passwords must match.");
  const errorPhoneToast = () =>
    toast.error("An account with the provided phone number already exists.");
  const navigate = useNavigate();

  const getClientCollection = async () => {
    const clientsCollection = collection(db, "clients");
    const querySnapshot = await getDocs(clientsCollection);
    const existPhones = [];

    querySnapshot.forEach((snapshot) => {
      existPhones.push(snapshot.data().phone);
    });
    setExistPhoneArray(existPhones);
  };

  useEffect(() => {
    getClientCollection();
  }, []);

  const verificationEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser, {
        handleCodeInApp: true,
        url: `https://barber-planer.web.app`,
      }).then(() => {
        successModal();
        console.log("Send email verification");
        setTimeout(() => navigate("/"), 2000);
      });
    } catch (error) {
      errorModal();
      console.log(error);
    }
  };

  const Register = async (e) => {
    e.preventDefault();
    if (password.current.value === confirmpassword.current.value) {
      if (!existPhoneArray.includes(phone.current.value)) {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            email.current.value,
            password.current.value
          );

          await updateProfile(cred.user, {
            displayName: "client",
            emailVerified: false,
          });

          await setDoc(doc(db, "clients", auth.currentUser.uid), {
            uid: cred.user.uid,
            name: name.current.value,
            surname: surname.current.value,
            phone: phone.current.value,
          });

          verificationEmail();
          console.log("User registered successfully");
        } catch (error) {
          errorEmailModal();
          console.log(error);
        }
      } else {
        errorPhoneToast();
      }
    } else {
      errorPasswordToast();
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} width="500px" />
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Register
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            action="#"
            method="POST"
            onSubmit={(e) => Register(e)}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  ref={name}
                  autoComplete="name"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="surname"
                className="block text-lg font-medium leading-6 text-gray-900"
              >
                Surname
              </label>
              <div className="mt-2">
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  ref={surname}
                  autoComplete="surname"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-lg font-medium leading-6 text-gray-900"
              >
                Phone number:
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="phone"
                  ref={phone}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
              </div>
            </div>

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
              <label
                htmlFor="email"
                className="block text-lg font-medium leading-6 text-gray-900"
              >
                Confirm password
              </label>
              <div className="position-relative mt-2">
                <input
                  id="confirmpassword"
                  name="confirmpassword"
                  type={visibleConfirmPassword ? "password" : "text"}
                  autoComplete="confirmpassword"
                  ref={confirmpassword}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lightbrown sm:text-sm sm:leading-6"
                />
                <div className="eye-position">
                  {visibleConfirmPassword ? (
                    <IoMdEye
                      style={{ cursor: "pointer" }}
                      onClick={() => setVisibleConfirmPassword(false)}
                      color="black"
                    />
                  ) : (
                    <IoMdEyeOff
                      style={{ cursor: "pointer" }}
                      onClick={() => setVisibleConfirmPassword(true)}
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
                Register
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Do you already have an account? &nbsp;
            <Link
              to="/"
              className="font-semibold leading-6 text-brown hover:text-lightbrown"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
