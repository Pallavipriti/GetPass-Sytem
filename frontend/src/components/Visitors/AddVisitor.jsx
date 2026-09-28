import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import axiosApi from "../../services/api";

const AddVisitor = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "Pallavi Priti",
    email: "abc@gmail.com",
    phone: "1234567890",
    idType: "Aadhar",
    idNumber: "5679789798",
    vehicleNumber: "6568",
    purpose: "family visit",
    hostId: "69c94f62e862140b0b196459",
    visitType: "pre-approved",
    expectedArrival: "",
    expectedDeparture: "",
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await axiosApi.get("/residents");
      console.log("response",response.data)
      const options = response.data?.residents?.map((user) => ({
        value: user._id,
        label: `${user.name} - ${user.apartmentNo}`,
      }));
      console.log("options",options)
      setResidents(options??[]);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosApi.post("/visitors/add-visitors", {
       ...formData,
      });
      console.log("response",response)
      toast.success("Visitor added successfully!");
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        idType: "Aadhar",
        idNumber: "",
        vehicleNumber: "",
        purpose: "",
        hostId: "",
        visitType: "pre-approved",
        expectedArrival: "",
        expectedDeparture: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Add New Visitor</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Type *
            </label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Aadhar">Aadhar Card</option>
              <option value="Driving License">Driving License</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Number *
            </label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Visit *
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host/Resident *
            </label>
            <select
              value={formData.hostId}
              onChange={(e) =>
                setFormData({ ...formData, hostId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select resident...</option>
              {residents?.map((resident) => (
                <option key={resident.value} value={resident.value}>
                  {resident.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Type *
            </label>
            <select
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pre-approved">Pre-approved</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Arrival
            </label>
            <input
              type="datetime-local"
              name="expectedArrival"
              value={formData.expectedArrival}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Departure
            </label>
            <input
              type="datetime-local"
              name="expectedDeparture"
              value={formData.expectedDeparture}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            disabled={loading}
            >
            {loading ? "Adding Visitor..." : "Add Visitor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVisitor;
