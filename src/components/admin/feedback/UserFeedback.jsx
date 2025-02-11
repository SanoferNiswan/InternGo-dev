import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";
import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import InteractionCard from "../../interaction/InteractionCard";
import Loader from "../../Loader";
import { FaDownload } from "react-icons/fa";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const UserFeedback = () => {
  const { userId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`api/feedbacks/intern/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback(response.data.data);
      console.log("feedback:", response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare Line Chart Data
  const lineChartData = {
    labels: feedback.map((data) => data.interaction.name),
    datasets: [
      {
        label: "Average Rating",
        data: feedback.map((data) => data.avg_rating),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const avgRatings = {};
  let avgCount = {};
  feedback.forEach((fb) => {
    Object.keys(fb.ratings).forEach((key) => {
      const standardizedKey = key.toLowerCase().trim();
      const capitalizedKey = standardizedKey
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      if (!avgRatings[capitalizedKey]) {
        avgRatings[capitalizedKey] = fb.ratings[key];
        avgCount[capitalizedKey] = 1;
        console.log(key);
      } else {
        avgRatings[capitalizedKey] += fb.ratings[key];
        avgCount[capitalizedKey] += 1;
      }
    });
  });
  Object.keys(avgRatings).forEach((key) => {
    console.log(avgRatings[key], avgCount[key]);
    avgRatings[key] /= avgCount[key];
  });

  const categories = Object.keys(avgRatings);
  const ratingsData = Object.values(avgRatings);
  const radarChartData = {
    labels: categories,
    datasets: [
      {
        label: "Skill Ratings",
        data: ratingsData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`/api/feedbacks/${userId}/download`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${feedback[0]?.interaction.assignedIntern}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download the PDF.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (feedback.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg shadow-md">
        <p className="text-gray-500 text-lg font-semibold">
          🚀 No feedback available!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-semibold text-blue-500 text-2xl flex-1 text-center">
          {feedback[0]?.interaction.assignedIntern}'s Feedback Analysis
        </h1>

        <button
          className="text-blue-500 hover:text-blue-600 text-xl flex gap-2 "
          onClick={() => handleDownload(userId)}
        >
          <FaDownload /><span className="text-sm">download</span>
        </button>
        
      </div>

      {/* Line Chart */}
      {feedback.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 flex justify-center">
          <div className="w-3/4 h-96 p-6 overflow-hidden">
            {" "}
            <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">
              Average Ratings Over Interactions
            </h2>
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 10 },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 6,
                    ticks: {
                      stepSize: 0.5,
                      font: {
                        size: 12,
                        weight: "500",
                      },
                      color: "#333",
                    },
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 14,
                        weight: "600",
                      },
                      color: "#333",
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0,
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      )}

      {feedback.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 flex justify-center">
          <div className="w-3/4 h-96 p-6 overflow-hidden">
            <h2 className="text-lg font-semibold text-center text-gray-700 mb-2">
              Overall skill ratings
            </h2>
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 10 },
                scales: {
                  r: {
                    min: 0,
                    max: 5,
                    ticks: {
                      stepSize: 1,
                      font: {
                        size: 10,
                        weight: "300",
                      },
                      color: "#333",
                    },
                    pointLabels: {
                      font: {
                        size: 14,
                        weight: "400",
                      },
                      color: "#333",
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Attended Interactions */}
      <div className="bg-white p-5 rounded-lg shadow-lg mb-6">
        <h2 className="font-semibold text-blue-500 text-center text-xl">
          Attended Interactions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {feedback.map((data) => (
            <InteractionCard key={data.id} interaction={data.interaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFeedback;
