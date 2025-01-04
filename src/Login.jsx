import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Css/login.css"; // ملف CSS منفصل
import { firebaseApp } from "./firebaseConfig";
import logo from "./images/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    // تحقق من حالة الخروج في localStorage
    if (localStorage.getItem("logout")) {
      toast.error("You have successfully logged out", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        theme: "colored", // لجعل الإشعار أحمر
      });
      // إزالة الحالة بعد عرض الإشعار
      localStorage.removeItem("logout");
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("user", JSON.stringify(userCredential.user));
        navigate("/dashboard");
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <img src={logo} alt="Project Logo" />
          </div>
          <h1>
            Admin <span>Login</span>
          </h1>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;
