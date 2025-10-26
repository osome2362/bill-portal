import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [todayCollected, setTodayCollected] = useState(0);

  useEffect(() => {
    const fetchTodayReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/reports/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ✅ Use the correct key from backend response
        setTodayCollected(res.data.totalCollected || 0);
      } catch (error) {
        console.error("Error fetching today's report:", error);
      }
    };

    fetchTodayReport();
  }, []);

  // Example placeholder data for chart
  const monthlyData = [5000, 8000, 6500, 9000, 7000, 10000];

  const cards = [
    { title: "Add Customer", path: "/addcustomer" },
    { title: "All Customers", path: "/all-customers" },
    { title: "View Customer", path: "/view-customer" },
    { title: "Reports", path: "/reports" },
  ];

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Collection (₹)",
        data: monthlyData,
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Monthly Collection Overview" },
    },
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* Card Grid */}
      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <h2>{card.title}</h2>
          </div>
        ))}
      </div>

      {/* Today’s Collection Summary */}
      <div className="today-collection">
        <h2>Today’s Collected Amount: ₹{todayCollected}</h2>

        {/* Monthly Collection Chart */}
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
