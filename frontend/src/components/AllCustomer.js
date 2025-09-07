import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./styles/AllCustomer.css";

const AllCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/allcustomers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCustomers(res.data.filteredCustomers || []);
      } catch (error) {
        console.error("Error fetching customers", error);
        setCustomers([]);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ Navigate to single customer view
  const handleViewCustomer = (id) => {
    navigate(`/viewcustomer/${id}`);
  };

  // ✅ Filter customers by ID, phone, box number, or name
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.cId?.toLowerCase().includes(query) ||
      c.name?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.setupBoxNo?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="all-customer-container">
        <h1 className="page-title">All Customers</h1>

        {/* ✅ Search Bar */}
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, Name, Phone, or Box No..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="customer-list">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c) => (
              <div
                className="customer-list-item"
                key={c.id}
                onClick={() => handleViewCustomer(c.cId)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    c.profilePic ||
                    "https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                  }
                  alt={c.name}
                  className="customer-list-img"
                />
                <div className="customer-info">
                  <h2 className="customer-name">{c.name}</h2>
                  <p className="customer-id">ID: {c.cId}</p>
                  <p className="customer-email">Box Number: {c.setupBoxNo}</p>
                  <p className="customer-phone">Phone: {c.phone}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No matching customers found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCustomer;
