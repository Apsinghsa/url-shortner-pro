const API_BASE = import.meta.env.VITE_API_URL || "";

export async function createShortUrl(longUrl) {
  try {
    const response = await fetch(API_BASE + "/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ longUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to shorten URL");
    }

    return data.data.url;
  } catch (error) {
    console.error("Failed to shorten the url:", error);
    throw error;
  }
}
