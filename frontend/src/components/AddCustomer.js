import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./styles/AddCustomer.css"; // <-- Import CSS file

const AddCustomer = () => {
  const [cId, setCId] = useState("");
  const [name, setName] = useState("");
  const [setupBoxNo, setSetupBoxNo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Always add TAM prefix before sending
      const customerId = `TAM${cId}`;

      await axios.post(
        "http://localhost:5000/api/customers/create",
        { cId: customerId, name, setupBoxNo, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Customer added successfully");

      // Reset form
      setCId("");
      setName("");
      setSetupBoxNo("");
      setPhone("");
      setAddress("");
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
          <h2>Add New Customer</h2>
          <form onSubmit={handleSubmit} className="customer-form">
            {/* Customer ID input with fixed TAM prefix */}
            <div className="customer-id-input">
              <span className="prefix">TAM</span>
              <input
                type="number"
                placeholder="Enter ID number"
                value={cId}
                onChange={(e) => setCId(e.target.value)}
                required
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
