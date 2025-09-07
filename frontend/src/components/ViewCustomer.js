import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./styles/ViewCustomer.css";

const ViewCustomer = () => {
  const { cId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  // fetch customer details (memoized so useEffect doesn’t complain)
  const fetchCustomer = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://cablebill-backend.onrender.com/viewcustomer/${cId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomer(res.data);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  }, [cId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // handle collect bill
  const handleCollectBill = async () => {
    const amount = prompt("Enter bill amount to collect:");
    if (!amount || isNaN(amount)) {
      alert("⚠️ Please enter a valid amount.");
      return;
    }

    try {
      setCollecting(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://cablebill-backend.onrender.com0/api/customers/transaction",
        { cId, amount, status: "Paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Bill collected successfully!");
      setCustomer(res.data.customer); // update customer with new transaction
    } catch (error) {
      console.error("Error collecting bill:", error);
      alert("❌ Failed to collect bill. Try again.");
    } finally {
      setCollecting(false);
    }
  };

  if (loading) return <p>Loading customer details...</p>;
  if (!customer) return <p>Customer not found</p>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="view-customer-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Customer Profile Card */}
        <div className="customer-profile-card">
          <img
            src={
              customer.profilePic ||
              "https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
            }
            alt={customer.name}
            className="customer-avatar"
          />
          <div className="customer-details">
            <h2 className="customer-name">{customer.name}</h2>
            <p>
              <strong>Customer ID:</strong> {customer.cId}
            </p>
            <p>
              <strong>Setup Box No:</strong> {customer.setupBoxNo}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>
            <p>
              <strong>Address:</strong> {customer.address}
            </p>
          </div>
        </div>

        {/* Collect Bill Button */}
        <div className="actions">
          <button
            className="collect-btn"
            onClick={handleCollectBill}
            disabled={collecting}
          >
            {collecting ? "Collecting..." : "💰 Collect Bill"}
          </button>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <h3 className="section-title">Payment History</h3>
          {customer.transactions && customer.transactions.length > 0 ? (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {customer.transactions.map((t) => (
                  <tr key={t.transId}>
                    <td>{t.transId || "N/A"}</td>
                    <td>₹{t.amount}</td>
                    <td>{t.status}</td>
                    <td>{new Date(t.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-transactions">No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
