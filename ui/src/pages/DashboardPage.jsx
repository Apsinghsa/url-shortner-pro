// client/src/pages/DashboardPage.jsx

// 1. Import React and necessary hooks
import React from "react";
import { useNavigate } from "react-router-dom";

// 2. Import the custom useAuth hook
// This is the beautiful, clean way we can access our global authentication state and functions.
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  // 3. Consume the AuthContext
  // We call our custom hook to get the functions and state we need from the context.
  // We are "destructuring" the logout function from the object returned by useAuth().
  const { logout } = useAuth();

  // The useNavigate hook gives us a function to programmatically redirect the user.
  const navigate = useNavigate();

  // 4. Create the logout handler function
  const handleLogout = () => {
    // Call the logout function from our AuthContext.
    // This will clear the token from localStorage and update the global state.
    logout();

    // After logging out, we redirect the user to the login page.
    // This provides a clear and immediate transition for the user.
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* A welcoming header for the user */}
      <h2>My Dashboard</h2>
      <p>
        Welcome to your personal dashboard! Here you will be able to see all the
        links you have created.
      </p>

      {/* We will add the list of links here in a future task. */}
      <div className="links-list-placeholder">
        <p>Your links will appear here soon...</p>
      </div>

      {/* 5. The Logout Button */}
      {/* We attach our handleLogout function to the button's onClick event. */}
      <button
        onClick={handleLogout}
        className="btn btn-logout"
        style={{ marginTop: "2rem" }}
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
