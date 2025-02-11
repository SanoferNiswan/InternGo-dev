import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams,Navigate } from "react-router-dom";
import axios from "../../../api/axios";
import Select from "react-select";
import { addDays, isAfter, parseISO, isValid } from "date-fns";
import Loader from "../../Loader";

const AdminUpdate = () => {
  const { date } = useParams();
  
  const inputDate = parseISO(date);
  if (!isValid(inputDate)) {
    return <Navigate to="/not-found" replace />;
  }

  // Get today's date and tomorrow's date
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // If the input date is after tomorrow, redirect to 404
  if (isAfter(inputDate, tomorrow)) {
    return <Navigate to="/not-found" replace />;
  }

  const { token } = useSelector((state) => state.auth);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const [filter, setFilter] = useState({
    year: [],
    batch: [],
    designation: [],
    status: [],
    planStatus: "Present",
  });

  const years = [2023, 2024, 2025];
  const batches = ["Batch 1", "Batch 2", "Batch 3"];
  const designations = ["frontend", "backend", "testing"];
  const statusOptions = [
    "ACTIVE", 
    "NOT_ACTIVE",
    "EXAMINATION",
    "SHADOWING",
    "DEPLOYED",
  ];

  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const createSelectOptions = useMemo(
    () => (options) =>
      options.map((option) => ({ value: option, label: option })),
    []
  );

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "/api/dailyUpdates/",
          {
            date,
            name: search,
            ...filter,
          },
          {
            params: { limit, offset: (currentPage - 1) * limit },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.statusCode === 200) {
          setDailyUpdates(response.data.data.data);
          setTotalPages(response.data.data.total_pages || 1);
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [date, filter, search, currentPage]);

  const handleFilterChange = useCallback((selectedOptions, fieldName) => {
    setFilter((prev) => ({
      ...prev,
      [fieldName]: selectedOptions
        ? selectedOptions.map((opt) => opt.value)
        : [],
    }));
  }, []);

  if(loading){
    return <Loader />
  }
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
         {date} Updates
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-60"
          placeholder="Search by name"
        />
        <Select
          isMulti
          value={createSelectOptions(filter.designation)}
          options={createSelectOptions(designations)}
          onChange={(selectedOptions) =>
            handleFilterChange(selectedOptions, "designation")
          }
          placeholder="Filter by Designation"
          className="w-60"
        />
        <Select
          isMulti
          value={createSelectOptions(filter.year)}
          options={createSelectOptions(years)}
          onChange={(selectedOptions) => handleFilterChange(selectedOptions, "year")}
          placeholder="Filter by Year"
          className="w-60"
        />
        <Select
          isMulti
          value={createSelectOptions(filter.batch)}
          options={createSelectOptions(batches)}
          onChange={(selectedOptions) => handleFilterChange(selectedOptions, "batch")}
          placeholder="Filter by Batch"
          className="w-60"
        />
      </div>

      {/* Tables by User */}
      {dailyUpdates.length > 0 ? (
        dailyUpdates.map((update) => (
          <div key={update.user.id} className="mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-2 p-3 rounded-md">
              {update.user.name} - {update.user.designation}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 shadow-md">
                <thead>
                  <tr className="bg-gray-500 text-white text-left">
                    <th className="p-3 border">Task Name</th>
                    <th className="p-3 border">Planned Activities</th>
                    <th className="p-3 border">Completed Activities</th>
                    <th className="p-3 border">Estimated Time</th>
                    <th className="p-3 border">Actual Time</th>
                    <th className="p-3 border">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {update.tasks.map((task, index) => (
                    <tr
                      key={task.id}
                      className={
                        index % 2 === 0 ? "bg-white text-gray-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      <td className="p-3 border">{task.taskName}</td>
                      <td className="p-3 border">{task.activitiesPlanned || "N/A"}</td>
                      <td className="p-3 border">{task.activitiesCompleted || "N/A"}</td>
                      <td className="p-3 border">{task.estimatedTime || "-"} hrs</td>
                      <td className="p-3 border">{task.actualTime || "-"} hrs</td>
                      <td className="p-3 border font-semibold text-blue-600">{task.taskProgress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-4">No updates found.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 transition-all hover:bg-blue-700"
        >
          Previous
        </button>
        <span className="text-lg font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 transition-all hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUpdate;
