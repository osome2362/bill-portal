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
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    setupBoxNo: "",
    phone: "",
    address: "",
  });

  // Fetch customer details
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

  // Populate form when customer loads
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        setupBoxNo: customer.setupBoxNo,
        phone: customer.phone,
        address: customer.address || "",
      });
    }
  }, [customer]);

  // Handle collect bill
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
        "http://localhost:5000/api/customers/transaction",
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

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit updated customer data
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Send cId in request body
      const res = await axios.put(
        "http://localhost:5000/api/customers",
        { ...formData, cId: customer.cId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Customer updated successfully!");
      setCustomer(res.data); // update UI
      setEditing(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("❌ Failed to update customer. Try again.");
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
            <div className="customer-name-edit">
              <h2 className="customer-name">{customer.name}</h2>
              <button
                className="edit-customer-btn"
                onClick={() => setEditing(true)}
              >
                {/* Pen SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-pencil-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.854.146a.5.5 0 0 1 .11.638l-.057.07-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10a.5.5 0 0 1 .7 0zm-1.1 2.1L3 10.9V13h2.1l8.754-8.754-2.1-2.1z" />
                </svg>
                <h3>Edit</h3>
              </button>
            </div>

            {/* Inline Edit Form */}
            {editing && (
              <form className="edit-form" onSubmit={handleUpdate}>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Setup Box No:</label>
                  <input
                    type="text"
                    name="setupBoxNo"
                    value={formData.setupBoxNo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button type="submit" style={{ marginRight: "10px" }}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!editing && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Collect Bill Button */}
        <div className="actions">
          <button
            className="collect-btn"
            onClick={handleCollectBill}
            disabled={collecting}
          >
            {collecting ? "Collecting..." : "Collect Bill"}
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
