import React, { useState } from "react";
import axios from "axios";
// import "./CustomerForm.css"; // Import CSS

const CustomerForm = () => {
  const [customer, setCustomer] = useState({
    cId: "",
    name: "",
    setupboxid: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

        const tokenkey = localStorage.getItem("token");
      const response = await axios.post(
        "http://172.17.107.63:5001/api/customers/create",
        customer,
        {
          headers: { token: {tokenkey} }, // Replace with actual token
        }
      );
      setMessage(response.data.message);
      setCustomer({ cId: "", name: "", setupboxid: "", phone: "", address: "" });
    } catch (error) {
      setMessage(error.response?.data.error || "❌ Error adding customer");
    }
  };

  return (
    <div className="customer-form">
      <h2>Add Customer</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="cId" placeholder="Customer ID" value={customer.cId} onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" value={customer.name} onChange={handleChange} required />
        <input type="text" name="setupboxid" placeholder="setup box id" value={customer.setupboxid} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone" value={customer.phone} onChange={handleChange} required />
        <input type="textarea" name="address" placeholder="Address" value={customer.address} onChange={handleChange} required />
        <button type="submit">Add Customer</button>
      </form>
    </div>
  );
};

export default CustomerForm;
