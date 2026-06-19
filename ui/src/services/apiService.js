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

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to shorten URL");
    }

    console.log(response.json());
    return response.json();
  } catch (err) {
    console.error("Failed to shorten the url:", err);
    throw new Error(
      `An unexpected error occurred, please try again! Reason: ${err.message}`,
      { cause: err },
    );
  }
}
