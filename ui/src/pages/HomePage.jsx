import React, { useState } from "react";
import { createShortUrl } from "../services/apiService";
import Spinner from "../components/Spinner";

export default function HomePage() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrlData, setShortUrlData] = useState(null);
  const [serverError, setServerError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateUrl = () => {
    const errors = {};
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i",
    );

    if (!longUrl) {
      errors.longUrl = "URL field cannot be empty.";
    } else if (!urlPattern.test(longUrl)) {
      errors.longUrl = "Please enter a valid URL (e.g., https://example.com).";
    }
    return errors;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsCopied(false);
    setServerError("");
    setShortUrlData(null);

    const validationErrors = validateUrl();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createShortUrl(longUrl);
      setShortUrlData(response);
    } catch (error) {
      const errorMessage = error.message || "An unexpected error occured!";
      setServerError(errorMessage);
      setShortUrlData(null);
      console.error("Error from API :", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = async () => {
    if (!shortUrlData?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrlData.shortUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Url Shortner</h2>
        <p className="mt-2 text-gray-600">Enter a long URL, make it short.</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="longUrl-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Your long URL
          </label>
          <input
            id="longUrl-input"
            type="url"
            placeholder="https://example.com/long/url/to/shorten"
            value={longUrl}
            onChange={(e) => {
              setLongUrl(e.target.value);
              if (formErrors.longUrl) {
                setFormErrors({});
              }
            }}
            required
            disabled={isLoading}
            className={`w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 ${
              formErrors.longUrl
                ? "border-danger focus:ring-danger"
                : "border-gray-300"
            }`}
          />
          {formErrors.longUrl && (
            <p className="mt-1 text-sm text-danger">{formErrors.longUrl}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Spinner size="small" /> : "Shorten"}
        </button>
      </form>

      {serverError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}

      {shortUrlData && (
        <section
          className="mt-8 rounded-lg border border-green-300 bg-green-50 p-6"
          aria-label="Shortened URL result"
        >
          <h3 className="mb-3 text-lg font-semibold text-green-800">
            Your short URL is ready!
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={shortUrlData.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-link break-all hover:underline"
            >
              {shortUrlData.shortUrl}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-700">
            Original URL: {shortUrlData.longUrl.substring(0, 70)}...
          </p>
        </section>
      )}
    </div>
  );
}
