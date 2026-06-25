const API_URL = (import.meta.env.VITE_API_URL || "") + "/api/links/";

export const getUserLinks = async (token) => {
  try {
    const response = await fetch(API_URL + "my-links", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user links");
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch links:", error);
    throw error;
  }
};

export const getClicksByDay = async (token, days = 30) => {
  try {
    const response = await fetch(`${API_URL}clicks-by-day?days=${days}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch clicks by day");
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch clicks by day:", error);
    throw error;
  }
};
