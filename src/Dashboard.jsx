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

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // Check if the toast has already been shown
        if (!localStorage.getItem("toastShown")) {
          localStorage.setItem("toastShown", "true");
          toast.success("Successfully logged in!");
        }

        const db = getDatabase(firebaseApp);
        const dataRef = ref(db, "/");

        const unsubscribeData = onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            const newData = snapshot.val();
            setData(newData);
            setLoading(false);

            // Check for new accidents
            const { last_Accident_location, last_Accident_time } =
              newData.Accident_info || {};
            if (last_Accident_location && last_Accident_time) {
              // Check time difference (only notify if the accident occurred within the last 30 minutes)
              const currentTime = new Date().getTime();
              const accidentTime = new Date(last_Accident_time).getTime();
              const timeDifference = (currentTime - accidentTime) / 60000; // Difference in minutes

              // Only notify if the accident occurred in the last 30 minutes
              if (timeDifference <= 10000) {
                const newNotification = {
                  location: last_Accident_location,
                  time: last_Accident_time,
                };

                // Add the new notification, keeping only the latest 5
                setNotifications((prev) => {
                  const updatedNotifications = [newNotification, ...prev];
                  return updatedNotifications.slice(0, 5); // Keep only the latest 5
                });

                toast.info(
                  `🚨 New Accident at ${last_Accident_location} at ${last_Accident_time}`
                );
              }
            }
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
        localStorage.removeItem("toastShown"); // Remove toast flag on logout
        // Save logout state in localStorage to show toast on login page
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
    setNotifications([]); // Clear notifications when closed
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

  const { Accident_info, addresses, emergencyStatus, vehicles_info } = data;
  const { last_Accident_location, last_Accident_time } = Accident_info || {};

  return (
    <div className="dashboard-container">
      {/* Navbar with bell icon */}
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Project Logo" />
        </div>
        <h1 className="admin-title">Admin Dashboard</h1>
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

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <h3>Recent Accidents</h3>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                <p>{`🚨 Accident at ${notification.location} at ${notification.time}`}</p>
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

      {/* Accident Section */}
      <div className="section accident-section">
        <h2>🚨 Last Accident</h2>
        <div className="card accident-card">
          {last_Accident_location && last_Accident_time ? (
            <>
              <p>
                <strong>📍 Location:</strong> {last_Accident_location}
              </p>
              <p>
                <strong>⏰ Time:</strong> {last_Accident_time}
              </p>
            </>
          ) : (
            <p>No accident data available</p>
          )}
        </div>
      </div>

      {/* Project Map Section */}
      <div className="section map-section">
        <h2>🗺️ Project Map</h2>
        <img
          src="/path-to-map-image.jpg"
          alt="Project Map"
          className="project-map"
        />
      </div>

      {/* Addresses Section */}
      <div className="section addresses-section">
        <h2>🏙️ Addresses</h2>
        <div className="addresses">
          {addresses &&
            Object.keys(addresses).map((key) => (
              <p key={key}>
                <strong>{key}:</strong> {addresses[key]} 🛣️
              </p>
            ))}
        </div>
      </div>

      {/* Vehicles Information Section */}
      <div className="section vehicles-section">
        <h2>🚘 Vehicles Information</h2>
        <div className="vehicle-cards">
          {vehicles_info &&
            Object.keys(vehicles_info).map((vehicleKey) => (
              <div className="card vehicle-card" key={vehicleKey}>
                <p>
                  <strong>🔑 Vehicle:</strong> {vehicleKey}
                </p>
                <p>
                  <strong>📍 Last Location:</strong>{" "}
                  {vehicles_info[vehicleKey]?.last_location}
                </p>
                <p>
                  <strong>⏰ Last Time:</strong>{" "}
                  {vehicles_info[vehicleKey]?.last_time}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Notifications container */}
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
