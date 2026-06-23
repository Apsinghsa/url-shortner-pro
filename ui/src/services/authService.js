const API_BASE = import.meta.env.VITE_API_URL || "";
const API_URL = API_BASE + "/api/auth";

export async function registerUser(userData) {
  try {
    const response = await fetch(API_URL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Api Error: User registration failed", error);
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Api Error: Login failed", error);
    throw error;
  }
}
