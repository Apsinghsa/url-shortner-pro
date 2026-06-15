import React from "react";
import { useState } from "react";
import { createShortUrl } from "../services/apiService";

export default function HomePage() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrlData, setShortUrlData] = useState(null);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    if (!longUrl) {
      setError("Please provide a Long Url");
      setShortUrlData(null);
      return;
    }
    try {
      setError("");
      const response = await createShortUrl(longUrl);
      setShortUrlData(response.data.url);
    } catch (error) {
      const errorMessage = error.error || "An unexpected error occured!";
      setError(errorMessage);
      setShortUrlData(null);
      console.error("Error from API :", error);
    }
  }
  return (
    <>
      <h2>Url Shortner</h2>
      <div>Enter a long Url, make it short</div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="longUrl-input">Your long Url</label>
          <input
            id="longUrl-input"
            className="border border-gray-600 m-2"
            type="url"
            placeholder="https://example.com/long/url/to/shorten"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className=" bg-blue-300 cursor-pointer">
          Shorten
        </button>
      </form>

      {error && (
        <div className="error-container bg-red-900 mt-4">
          <p>
            <strong>Error: </strong>
            {error}
          </p>
        </div>
      )}

      {shortUrlData && (
        <div className="result-container border border-green-300">
          <h3>Your Short Url is ready!!</h3>
          <p>
            <strong>Short Link:</strong>
            <a
              href={shortUrlData.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 font-bold color={#007bff}"
            >
              {shortUrlData.shortUrl}
            </a>
          </p>
          <p className="text-sm text-gray-700">
            Original URL : {shortUrlData.longUrl.substring(0, 70)}....
          </p>
        </div>
      )}
    </>
  );
}
