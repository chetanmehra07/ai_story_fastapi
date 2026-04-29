import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeInput from "./ThemeInput.jsx";
import LoadingStatus from "./LoadingStatus.jsx";
import { API_BASE_URL } from "../util.js";

function StoryGenerator() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("");
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Friendly error mapper
  const getFriendlyError = (error) => {
    const msg = error?.message || "";

    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      return "Our AI is a bit busy right now. Please try again in a few seconds.\n";
    }

    if (msg.includes("Network Error")) {
      return "Network issue. Please check your internet connection.\n";
    }

    if (msg.includes("timeout")) {
      return " Server is taking too long. Try again shortly.\n";
    }

    return " Something went wrong while generating your story.\n";
  };

  // 🔁 Polling
  useEffect(() => {
    let pollInterval;

    if (jobId && jobStatus === "processing") {
      pollInterval = setInterval(() => {
        pollJobStatus(jobId);
      }, 4000); // faster UX
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId, jobStatus]);

  // 🚀 Generate Story
  const generateStory = async (theme) => {
    setLoading(true);
    setError(null);
    setTheme(theme);

    try {
      const response = await axios.post(`${API_BASE_URL}/stories/create`, {
        theme,
      });

      const { job_id, status } = response.data;

      setJobId(job_id);
      setJobStatus(status);

      pollJobStatus(job_id);
    } catch (e) {
      setLoading(false);
      setError(getFriendlyError(e));
    }
  };

  // 🔁 Poll job status
  const pollJobStatus = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      const { status, story_id, error: jobError } = response.data;

      setJobStatus(status);

      if (status === "completed" && story_id) {
        navigate(`/story/${story_id}`);
      } else if (status === "failed" || jobError) {
        setError(getFriendlyError({ message: jobError }));
        setLoading(false);
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        setError(getFriendlyError(e));
        setLoading(false);
      }
    }
  };

  // 🔄 Reset
  const reset = () => {
    setJobId(null);
    setJobStatus(null);
    setError(null);
    setTheme("");
    setLoading(false);
  };

  return (
    <div className="story-generator">
      {/* ❌ Error UI */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}

      {/* 🧠 Input */}
      {!jobId && !error && !loading && <ThemeInput onSubmit={generateStory} />}

      {/* ⏳ Loading */}
      {loading && <LoadingStatus theme={theme} />}
    </div>
  );
}

export default StoryGenerator;
