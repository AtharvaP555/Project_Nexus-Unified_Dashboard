import { useState, useEffect } from "react";
import apiClient from "../api";

const GitHubWidget = ({ config }) => {
  // Accept config prop
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const username = config?.username || "github"; // Use configured username or default
        const response = await apiClient.get(
          `/github/stats/?username=${username}`
        );
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch GitHub data");
        console.error("GitHub API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [config]); // Re-fetch when config changes

  if (loading)
    return <div className="widget-loading">Loading GitHub data...</div>;
  if (error) return <div className="widget-error">{error}</div>;

  return (
    <div className="github-widget">
      <h4>GitHub Stats {config?.username && `(@${config.username})`}</h4>
      {userData ? (
        <div className="github-content">
          <img
            src={userData.avatar_url}
            alt="GitHub Avatar"
            className="github-avatar"
            style={{ width: "50px", borderRadius: "50%" }}
          />
          <div className="github-stats">
            <p>Followers: {userData.followers}</p>
            <p>Repositories: {userData.public_repos}</p>
            <p>Following: {userData.following}</p>
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default GitHubWidget;
