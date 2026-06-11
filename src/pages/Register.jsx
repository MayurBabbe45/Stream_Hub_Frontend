import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUploadCloud, FiUser, FiMail, FiLock, FiAtSign, FiBriefcase } from "react-icons/fi"; // 🚨 Added FiBriefcase
import axiosInstance from "../utils/axiosInstance";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE", // 🚨 Added role state, defaulting to Employee
  });

  const [files, setFiles] = useState({ avatar: null, coverImage: null });
  const [previews, setPreviews] = useState({ avatar: null, coverImage: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    
    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!files.avatar) {
      toast.error("Avatar image is required!");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Provisioning your enterprise account...");

    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("username", formData.username.toLowerCase());
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role); // 🚨 Sending the selected role to the backend
      
      data.append("avatar", files.avatar); 
      if (files.coverImage) {
        data.append("coverImage", files.coverImage);
      }

      await axiosInstance.post("/users/register", data);

      toast.success("Account created successfully!", { id: loadingToast });
      navigate("/login"); 

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl w-full bg-[#1f1f1f] border border-zinc-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Enterprise Access</h2>
          <p className="text-gray-400 mt-2">Secure corporate media distribution</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* 🚨 THE NEW ROLE SELECTOR 🚨 */}
          <div className="flex flex-col gap-3">
            <label className="text-sm text-zinc-400 font-medium">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.role === "EMPLOYEE" 
                    ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                    : "border-zinc-700 bg-[#141414] text-zinc-500 hover:border-zinc-500"
                }`}
              >
                <input 
                  type="radio" name="role" value="EMPLOYEE" 
                  className="hidden" 
                  checked={formData.role === "EMPLOYEE"} 
                  onChange={handleChange} 
                />
                <FiUser size={24} />
                <span className="font-bold text-sm">Employee</span>
              </label>
              
              <label 
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.role === "BUSINESS" 
                    ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                    : "border-zinc-700 bg-[#141414] text-zinc-500 hover:border-zinc-500"
                }`}
              >
                <input 
                  type="radio" name="role" value="BUSINESS" 
                  className="hidden" 
                  checked={formData.role === "BUSINESS"} 
                  onChange={handleChange} 
                />
                <FiBriefcase size={24} />
                <span className="font-bold text-sm">Business</span>
              </label>
            </div>
          </div>

          {/* --- FILE UPLOAD SECTION --- */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4 bg-[#141414] rounded-xl border border-zinc-800/50">
            {/* Avatar Upload (Required) */}
            <div className="relative group cursor-pointer flex flex-col items-center">
              <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="hidden" id="avatarUpload" />
              <label htmlFor="avatarUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors relative">
                  {previews.avatar ? (
                    <img src={previews.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiUploadCloud className="text-3xl text-zinc-500 group-hover:text-blue-500 transition-colors" />
                  )}
                </div>
                <span className="text-xs text-zinc-400 font-medium">Avatar *</span>
              </label>
            </div>

            {/* Cover Image Upload (Optional) */}
            <div className="relative group cursor-pointer flex flex-col items-center flex-1 w-full">
              <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" id="coverUpload" />
              <label htmlFor="coverUpload" className="cursor-pointer w-full flex flex-col items-center gap-2">
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden hover:border-purple-500 transition-colors relative">
                  {previews.coverImage ? (
                    <img src={previews.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-500 group-hover:text-purple-500 transition-colors flex items-center gap-2">
                      <FiUploadCloud className="text-xl" /> Cover Image (Optional)
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* --- TEXT INPUT SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Full Name" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="relative">
              <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Username" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Corporate Email" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Secure Password" className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Provisioning..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-zinc-400 mt-6 text-sm">
          Already registered?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign In Securely
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;