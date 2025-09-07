import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Navbar from "./Navbar"
import { saveAs } from "file-saver";
import "./styles/Reports.css";

const Reports = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [reportData, setReportData] = useState(null);
  const [type, setType] = useState(""); // collection, monthly, unpaid

  const token = localStorage.getItem("token");

  // 🔹 Fetch Collection Report
  const fetchCollectionReport = async () => {
    try {
      const res = await axios.get(
        "https://cablebill-backend.onrender.com/api/reports/collection",
        {
          params: { from, to },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReportData(res.data);
      setType("collection");
    } catch (err) {
      console.error("Error fetching collection report", err);
    }
  };

  // 🔹 Fetch Monthly Report
  const fetchMonthlyReport = async () => {
    try {
      const res = await axios.get("https://cablebill-backend.onrender.com/api/reports/monthly", {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data);
      setType("monthly");
    } catch (err) {
      console.error("Error fetching monthly report", err);
    }
  };

  // 🔹 Fetch Unpaid Customers
  const fetchUnpaidReport = async () => {
    try {
      const res = await axios.get("https://cablebill-backend.onrender.com/api/reports/unpaid", {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data);
      setType("unpaid");
    } catch (err) {
      console.error("Error fetching unpaid report", err);
    }
  };

  // 🔹 Download Excel
  const downloadExcel = () => {
    if (!reportData) return;

    let data = [];

    if (type === "collection") {
      data = reportData.transactions;
    } else if (type === "monthly") {
      data = reportData.transactions;
    } else if (type === "unpaid") {
      data = reportData.unpaid;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${type}_report.xlsx`);
  };

  return (
      <div> <Navbar />
    <div className="reports-container">
      <h2>📊 Reports</h2>

      {/* Collection Report */}
      <div className="report-section">
        <h3>Collection Report</h3>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={fetchCollectionReport}>Get Report</button>
      </div>

      {/* Monthly Report */}
      <div className="report-section">
        <h3>Monthly Report</h3>
        <input
          type="number"
          placeholder="Year (e.g. 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button onClick={fetchMonthlyReport}>Get Report</button>
      </div>

      {/* Unpaid Report */}
      <div className="report-section">
        <h3>Unpaid Customers</h3>
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button onClick={fetchUnpaidReport}>Get Report</button>
      </div>

      {/* Results */}
      {reportData && (
        <div className="report-results">
          <h3>📋 {type.charAt(0).toUpperCase() + type.slice(1)} Report</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(
                  type === "collection"
                    ? reportData.transactions[0] || {}
                    : type === "monthly"
                    ? reportData.transactions[0] || {}
                    : reportData.unpaid[0] || {}
                ).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(type === "collection"
                ? reportData.transactions
                : type === "monthly"
                ? reportData.transactions
                : reportData.unpaid
              ).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button className="download-btn" onClick={downloadExcel}>
            ⬇️ Download Excel
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default Reports;
