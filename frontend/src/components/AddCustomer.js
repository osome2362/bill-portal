import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./styles/AddCustomer.css"; 

const AddCustomer = () => {
  const [cId, setCId] = useState("");
  const [name, setName] = useState("");
  const [setupBoxNo, setSetupBoxNo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch last customer to generate next ID
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://cablebill-backend.onrender.com/allcustomers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const customers = res.data.filteredCustomers || [];
        if (customers.length === 0) {
          setCId("01");
        } else {
          // Get highest numeric part of cId
          const lastId = customers
            .map(c => parseInt(c.cId.replace("TAM", ""), 10))
            .sort((a, b) => b - a)[0];

          const nextId = (lastId + 1).toString().padStart(2, "0");
          setCId(nextId);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCId("01"); // fallback
      }
    };

    fetchNextId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const customerId = `TAM${cId}`;

      await axios.post(
        "https://cablebill-backend.onrender.com/api/customers/create",
        { cId: customerId, name, setupBoxNo, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Customer added successfully");

      // Reset form and generate next ID
      setName("");
      setSetupBoxNo("");
      setPhone("");
      setAddress("");

      const nextId = (parseInt(cId, 10) + 1).toString().padStart(2, "0");
      setCId(nextId);
    } catch (error) {
      console.error("Error adding customer", error);
      alert("❌ Failed to add customer");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="add-customer-container">
        <div className="form-card">
          {/* ✅ Back Button */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h2>Add New Customer</h2>
          <form onSubmit={handleSubmit} className="customer-form">
            {/* Auto-generated Customer ID */}
            <div className="customer-id-input">
              <span className="prefix">TAM</span>
              <input
                type="text"
                value={cId}
                readOnly
              />
            </div>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Setup Box No"
              value={setupBoxNo}
              onChange={(e) => setSetupBoxNo(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <button type="submit">➕ Add Customer</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
