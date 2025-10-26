import React, { useEffect, useState, useCallback } from "react";
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
  const [billAmount, setBillAmount] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    setupBoxNo: "",
    phone: "",
    address: "",
  });

  const fetchCustomer = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/viewcustomer/${cId}`, {
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

  // Mobile-friendly bill collection
  const handleCollectBill = async (e) => {
    e.preventDefault();
    if (!billAmount || isNaN(billAmount)) {
      alert("⚠️ Please enter a valid amount.");
      return;
    }
    try {
      setCollecting(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/customers/transaction",
        { cId, amount: billAmount, status: "Paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Bill collected successfully!");
      setCustomer(res.data.customer);
      setBillAmount("");
    } catch (error) {
      console.error("Error collecting bill:", error);
      alert("❌ Failed to collect bill. Try again.");
    } finally {
      setCollecting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/customers",
        { ...formData, cId: customer.cId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Customer updated successfully!");
      setCustomer(res.data);
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
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="customer-profile-card">
          <img
            src={customer.profilePic || "https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"}
            alt={customer.name}
            className="customer-avatar"
          />
          <div className="customer-details">
            <div className="customer-name-edit">
              <h2 className="customer-name">{customer.name}</h2>
              <button className="edit-customer-btn" onClick={() => setEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                  <path d="M12.854.146a.5.5 0 0 1 .11.638l-.057.07-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10a.5.5 0 0 1 .7 0zm-1.1 2.1L3 10.9V13h2.1l8.754-8.754-2.1-2.1z"/>
                </svg>
                <h3>Edit</h3>
              </button>
            </div>

            {editing && (
              <form className="edit-form" onSubmit={handleUpdate}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                <input type="text" name="setupBoxNo" value={formData.setupBoxNo} onChange={handleChange} placeholder="Setup Box No" required />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                <div className="edit-actions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}

            {!editing && (
              <>
                <p><strong>ID:</strong> {customer.cId}</p>
                <p><strong>Box:</strong> {customer.setupBoxNo}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <p><strong>Address:</strong> {customer.address}</p>
              </>
            )}
          </div>
        </div>

        {/* Mobile-friendly Bill Collection */}
        <form className="collect-form" onSubmit={handleCollectBill}>
          <input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="Enter Bill Amount" required />
          <button type="submit" disabled={collecting}>
            {collecting ? "Collecting..." : "Collect Bill"}
          </button>
        </form>

        {/* Transaction Table */}
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
                    <td>{t.transId}</td>
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
