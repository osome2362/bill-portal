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
import {
  FaUsers,
  FaUserPlus,
  FaFileInvoiceDollar,
  FaChartBar,
} from "react-icons/fa"; // ✅ Added icons
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
        const res = await axios.get(
          "https://cablebill-backend.onrender.com/api/reports/today",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTodayCollected(res.data.totalCollected || 0);
      } catch (error) {
        console.error("Error fetching today's report:", error);
      }
    };

    fetchTodayReport();
  }, []);

  const monthlyData = [5000, 8000, 6500, 9000, 7000, 10000];

  // ✅ Reordered cards and added icons
  const cards = [
    { title: "All Customers", path: "/all-customers", icon: <FaUsers /> },
    { title: "Add Customer", path: "/addcustomer", icon: <FaUserPlus /> },
    {
      title: "Today Billed Customers List",
      path: "/today-billed",
      icon: <FaFileInvoiceDollar />,
    },
    { title: "Reports", path: "/reports", icon: <FaChartBar /> },
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
            <div className="icon-wrapper">{card.icon}</div>
            <h2>{card.title}</h2>
          </div>
        ))}
      </div>

      {/* Today’s Collection Summary */}
      <div className="today-collection">
        <h2>Today’s Collected Amount: ₹{todayCollected}</h2>

        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
