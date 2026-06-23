const API_URL = "/api/links/";

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
