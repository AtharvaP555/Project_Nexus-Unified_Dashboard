import { useState, useEffect } from "react";
import apiClient from "../api";

const NewsWidget = ({ config }) => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const category = config?.category || "general";
        const country = config?.country || "us";

        const response = await apiClient.get(
          `/news/headlines/?category=${category}&country=${country}`
        );

        if (response.data.success) {
          setNewsData(response.data);
          setError("");
        } else {
          setError(response.data.message || "Failed to fetch news");
        }
      } catch (err) {
        setError("Failed to connect to news service");
        console.error("News API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [config?.category, config?.country]);

  if (loading) return <div className="widget-loading">Loading news...</div>;
  if (error) return <div className="widget-error">{error}</div>;

  return (
    <div className="news-widget">
      <h4>Top News {config?.category && `(${config.category})`}</h4>

      {newsData && newsData.articles.length > 0 ? (
        <div className="news-content">
          <div className="news-list">
            {newsData.articles.slice(0, 3).map((article, index) => (
              <div key={index} className="news-item">
                <h5 className="news-title">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    {article.title}
                  </a>
                </h5>
                <p className="news-source">{article.source?.name}</p>
              </div>
            ))}
          </div>
          {newsData.totalResults > 3 && (
            <p className="news-more">
              +{newsData.totalResults - 3} more articles
            </p>
          )}
        </div>
      ) : (
        <p>No news articles available</p>
      )}
    </div>
  );
};

export default NewsWidget;
