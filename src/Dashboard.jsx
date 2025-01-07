import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Css/dashboard.css";
import "./Css/loading.css";
import { firebaseApp } from "./firebaseConfig";
import logo from "./images/logo.png";
import car from "./images/Uber Black.jpeg";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [highlightedLocations, setHighlightedLocations] = useState({});
  const [emergencyStatus, setEmergencyStatus] = useState(null); // حالة الطوارئ
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        if (!localStorage.getItem("toastShown")) {
          localStorage.setItem("toastShown", "true");
          toast.success("Successfully logged in!");
        }

        const db = getDatabase(firebaseApp);
        const dataRef = ref(db, "/");

        const unsubscribeData = onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            const newData = snapshot.val();
            setData((prevData) => {
              const newHighlightedLocations = {};

              // مقارنة المواقع الحالية مع المواقع السابقة لتحديد التغييرات
              if (prevData?.vehicles_info) {
                Object.keys(newData.vehicles_info).forEach((key) => {
                  if (
                    newData.vehicles_info[key]?.last_location !==
                    prevData.vehicles_info[key]?.last_location
                  ) {
                    newHighlightedLocations[key] = true;
                  }
                });
              }

              setHighlightedLocations(newHighlightedLocations);
              setTimeout(() => {
                setHighlightedLocations({});
              }, 3000); // إزالة التوهج بعد 3 ثوانٍ

              // تحديث حالة الطوارئ فقط إذا كانت قد تغيرت
              if (newData?.emergencyStatus !== prevData?.emergencyStatus) {
                setEmergencyStatus(newData?.emergencyStatus || "false");

                // التحقق من تغيير حالة الطوارئ الخاصة بـ intersection_1
                if (newData?.intersection_1 !== prevData?.intersection_1) {
                  const updatedEmergencyStatus =
                    newData?.intersection_1 === "true" ? "Active" : "Inactive";
                  setEmergencyStatus(updatedEmergencyStatus);
                }
              }

              return newData;
            });

            setLoading(false);
          } else {
            console.log("No data available");
            setLoading(false);
          }
        });

        return () => {
          unsubscribeData();
        };
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = () => {
    setAuthLoading(true);
    signOut(auth)
      .then(() => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("toastShown");
        localStorage.setItem("logout", "true");
        setTimeout(() => {
          navigate("/login");
          setAuthLoading(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error during sign out:", error);
        setAuthLoading(false);
      });
  };

  const handleCloseNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  if (loading || authLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const { Accident_info, vehicles_info } = data;
  const { last_Accident_location, last_Accident_time } = Accident_info || {};

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Project Logo" />
        </div>
        <h1 className="admin-title">
          Admin <span>Dashboard</span>
        </h1>
        <div
          className="bell-icon"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span>🔔</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {showNotifications && (
        <div className="notifications-dropdown">
          <h3>Recent Accidents</h3>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                <p>{`Accident at ${notification.location} at ${notification.time}`}</p>
              </div>
            ))
          ) : (
            <p>No recent accidents.</p>
          )}
          <button
            className="close-notifications"
            onClick={handleCloseNotifications}
          >
            Close
          </button>
        </div>
      )}

      <div className="sections-container">
        {/* Vehicles Section */}
        <div className="section vehicles-section">
          <h2 className="text-vehicles">Vehicles Information</h2>
          <div className="vehicle-cards">
            {vehicles_info &&
              Object.keys(vehicles_info).map((vehicleKey) => (
                <div className="card vehicle-card" key={vehicleKey}>
                  <img
                    src={vehicles_info[vehicleKey]?.image || car}
                    alt={`${vehicleKey} car`}
                  />
                  <p>
                    <strong>Vehicle:</strong> {vehicleKey}
                  </p>
                  <p
                    className={`location-text ${
                      highlightedLocations[vehicleKey] ? "highlight" : ""
                    }`}
                  >
                    <strong>Last Location:</strong>{" "}
                    {vehicles_info[vehicleKey]?.last_location}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Accident Section */}
        <div className="section accident-section">
          <h2 className="accident-title">Recent Accident Details</h2>
          <div className="card accident-card">
            {last_Accident_location && last_Accident_time ? (
              <>
                {/* Dropdown to toggle accident details */}
                <details className="accident-details">
                  <summary className="accident-summary">
                    Accident at {last_Accident_location} (Click for details)
                  </summary>
                  <div className="accident-info">
                    <p>
                      <strong>Location:</strong> {last_Accident_location}
                    </p>
                    <p>
                      <strong>Time:</strong> {last_Accident_time}
                    </p>
                  </div>
                </details>
              </>
            ) : (
              <p className="no-accident">No accident data available</p>
            )}
          </div>
        </div>

        {/* Emergency Status Section */}
        <div className="section emergency-status-section">
          <h2 className="emergency-status-title">Emergency Status</h2>
          <div className="card emergency-status-card">
            <p>
              <strong>Status:</strong>{" "}
              {emergencyStatus.intersection_1 === "true"
                ? "Active"
                : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={1000}
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

export default Dashboard;
