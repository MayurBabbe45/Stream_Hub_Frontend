import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiClock, FiDownload } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const ComplianceDashboard = () => {
  const { videoId } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axiosInstance.get(`/progress/report/${videoId}`);
        setReportData(response.data.data);
      } catch (error) {
        console.error("Failed to load compliance report", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [videoId]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Employee Name", "Email", "Seconds Watched", "Progress (%)", "Status", "Last Active"];
    const csvRows = reportData.map(record => {
      return [
        `"${record.employeeName}"`, 
        `"${record.employeeEmail}"`,
        record.secondsWatched,
        record.progressPercentage,
        record.isCompleted ? "Verified" : "Incomplete",
        `"${new Date(record.lastActive).toLocaleDateString()}"`
      ].join(","); 
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `compliance_audit_${videoId}.csv`); 
    document.body.appendChild(link);
    link.click(); 
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  if (loading) {
    return <div className="p-10 text-center text-zinc-400">Loading audit data...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* 🚨 RESPONSIVE HEADER: Stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Training Compliance</h1>
          <p className="text-sm sm:text-base text-zinc-400">Real-time verification of employee video completion.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* 🚨 THE FIX: Added overflow-x-auto to allow horizontal swiping on mobile */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Watch Time</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                    No employees have started this training yet.
                  </td>
                </tr>
              ) : (
                reportData.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors">
                    
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={record.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-zinc-700 shrink-0" />
                      <div>
                        <div className="font-medium text-white">{record.employeeName}</div>
                        <div className="text-xs text-zinc-500">{record.employeeEmail}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {Math.floor(record.secondsWatched / 60)}m {Math.floor(record.secondsWatched % 60)}s
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-zinc-800 rounded-full h-2 min-w-[60px] max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${record.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${record.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{record.progressPercentage}%</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {record.isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          <FiCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <FiClock /> Incomplete
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(record.lastActive).toLocaleDateString()}
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;