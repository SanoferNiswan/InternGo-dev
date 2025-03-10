import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaClipboardList,
  FaProjectDiagram,
  FaGift,
} from "react-icons/fa";
import Announcement from "../../components/Announcement";
import axios from "../../api/axios";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import Forbidden from "../Forbidden";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [statusCount, setStatusCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [forbidden,setForbidden] = useState(false);
  const { profilePhoto,name } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchStatusCount();
  }, []);

  const navigate = useNavigate();

  const fetchStatusCount = async () => {
    try {
      const response = await axios.get(`/api/users/count/status`);
      setStatusCount(response.data.data);
    } catch (error) {     
      if(error.response?.data?.statusCode===403){
        setForbidden(true);
      }else{
        toast.error(JSON.stringify(error.response?.data?.message));
      }
    } finally {
      setLoading(false);
    }
  };

  if(forbidden){
    return <Forbidden />
  }

  return (
    <div className="p-2">
      <div className="bg-blue-500 text-white p-6 rounded-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-md mb-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Admin"
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full aspect-square object-cover"
          />
        ) : (
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full aspect-square object-cover bg-white flex items-center justify-center text-4xl font-bold text-blue-500">
            {name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:gap-4 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">Welcome, {name}!</h2>
          <p className="text-sm sm:text-base text-gray-200">
            Efficiently manage interns, track progress through detailed
            analytics, and monitor engagement with real-time insights. Stay
            informed with important updates, announcements, and performance
            metrics—all in one centralized app.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 shadow-md rounded-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          📢 Announcements
        </h2>
        <Announcement />
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" onClick={()=>navigate("/admin/resources")}>
        <div className="p-6 bg-white shadow-md rounded-lg flex items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          <FaUsers className="text-blue-500 text-4xl" />
          <div>
            <p className="text-gray-500">Total Interns</p>
            <h2 className="text-2xl font-bold text-center">
              {statusCount?.totalCount}
            </h2>
          </div>
        </div>

        <div className="p-6 bg-white shadow-md rounded-lg flex items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          <FaClipboardList className="text-green-500 text-4xl" />
          <div>
            <p className="text-gray-500">Active Interns</p>
            <h2 className="text-2xl font-bold text-center">
              {statusCount?.activeStatus}
            </h2>
          </div>
        </div>
 
        <div className="p-6 bg-white shadow-md rounded-lg flex items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          <FaProjectDiagram className="text-purple-500 text-4xl" />
          <div>
            <p className="text-gray-500">Non Active Interns</p>
            <h2 className="text-2xl font-bold text-center">
              {statusCount?.notActiveStatus}
            </h2>
          </div>
        </div>

        <div className="p-6 bg-white shadow-md rounded-lg flex items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
          <FaGift className="text-yellow-500 text-4xl" />
          <div>
            <p className="text-gray-500">Deployed Interns</p>
            <h2 className="text-2xl font-bold text-center">
              {statusCount?.deployedCount}
            </h2>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
