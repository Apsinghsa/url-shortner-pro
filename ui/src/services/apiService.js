export async function createShortUrl(longUrl) {
  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ longUrl }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Failed to shorten the url:", err);
    if (err.response && err.response.data) {
      throw err.response.data;
    } else {
      throw new Error(
        "an Unexpected error occured, please try again!",
        `Reason : ${err}`,
      );
    }
  }
}
