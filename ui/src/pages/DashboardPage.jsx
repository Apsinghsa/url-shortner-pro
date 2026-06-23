import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserLinks } from "../services/linkService";
import Spinner from "../components/Spinner";

const DashboardPage = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        if (token) {
          const response = await getUserLinks(token);
          setLinks(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch links:", err);
        const errorMessage = err.message || "Could not load your links.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [token]);

  const handleCopy = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => {
        setCopiedLinkId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome! Here are all the links you have created.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger" role="alert">
            Error: {error}
          </p>
        ) : links.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-700">
                <tr>
                  <th className="border-b-2 border-table-header px-4 py-3">
                    Original URL
                  </th>
                  <th className="border-b-2 border-table-header px-4 py-3">
                    Short URL
                  </th>
                  <th className="border-b-2 border-table-header px-4 py-3 text-center">
                    Clicks
                  </th>
                  <th className="border-b-2 border-table-header px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-border">
                {links.map((link) => (
                  <tr key={link._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 break-all">
                      <a
                        href={link.longUrl}
                        title={link.longUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        {link.longUrl.substring(0, 50)}...
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        {link.shortUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">
                      {link.clicks}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(link.shortUrl, link._id)}
                        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {copiedLinkId === link._id ? "Copied!" : "Copy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-600">
            You haven&apos;t created any short links yet. Go to the homepage to
            create your first one!
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 rounded-md bg-danger px-4 py-2 text-base font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-danger"
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
