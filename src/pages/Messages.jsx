import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiMessageSquare, FiArrowLeft, FiClock } from "react-icons/fi"; // 🚨 Added FiClock
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const Messages = () => {
  const currentUser = useSelector((state) => state.auth.userData);
  
  const [colleagues, setColleagues] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [unreadCounts, setUnreadCounts] = useState({});

  const selectedPartnerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    selectedPartnerRef.current = selectedPartner;
  }, [selectedPartner]);

  // 1. Init Data & Sockets
  useEffect(() => {
    const initChat = async () => {
      try {
        const [colleaguesRes, unreadRes] = await Promise.all([
          axiosInstance.get("/chat/colleagues"),
          axiosInstance.get("/chat/unread") 
        ]);
        
        setColleagues(colleaguesRes.data.data);
        setUnreadCounts(unreadRes.data.data.breakdown);
      } catch (error) {
        console.error("Failed to load chat data", error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    if (currentUser?._id) {
      socketRef.current = io("http://localhost:8000", {
        query: { userId: currentUser._id },
      });

      socketRef.current.on("receiveMessage", (message) => {
        if (message.sender._id === selectedPartnerRef.current?._id) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
          axiosInstance.post(`/chat/mark-read/${message.sender._id}`);
          window.dispatchEvent(new Event("chatStateChanged")); 
        } else {
          setUnreadCounts(prev => ({
            ...prev,
            [message.sender._id]: (prev[message.sender._id] || 0) + 1
          }));
          toast(`New message from ${message.sender.fullName}`, {
            icon: '💬',
            style: { background: '#1f1f1f', color: '#fff', border: '1px solid #27272a' }
          });
          window.dispatchEvent(new Event("chatStateChanged")); 
        }
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser]);

  const handleSelectPartner = async (colleague) => {
    setSelectedPartner(colleague);
    
    if (unreadCounts[colleague._id] > 0) {
      setUnreadCounts(prev => ({ ...prev, [colleague._id]: 0 }));
      window.dispatchEvent(new Event("chatStateChanged")); 
    }

    try {
      const response = await axiosInstance.get(`/chat/history/${colleague._id}`);
      setMessages(response.data.data);
      scrollToBottom();
      await axiosInstance.post(`/chat/mark-read/${colleague._id}`);
    } catch (error) {
      toast.error("Failed to load chat history");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner) return;

    const tempMessage = newMessage;
    setNewMessage(""); 

    try {
      const response = await axiosInstance.post("/chat/send", {
        receiverId: selectedPartner._id,
        content: tempMessage
      });
      setMessages((prev) => [...prev, response.data.data]);
      scrollToBottom();
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(tempMessage); 
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-full bg-[#0a0a0a] overflow-hidden">
      
      {/* LEFT SIDEBAR: Corporate Directory */}
      <div className={`${selectedPartner ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-[#0f0f0f]`}>
        <div className="p-5 border-b border-zinc-800 bg-[#141414]">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiMessageSquare className="text-blue-500" /> Internal Chat
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {colleagues.map((colleague) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={colleague._id}
              onClick={() => handleSelectPartner(colleague)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                selectedPartner?._id === colleague._id ? "bg-blue-600/10 border border-blue-500/30" : "hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <div className="relative">
                <img src={colleague.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f]"></div>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-semibold text-white truncate flex items-center justify-between">
                  {colleague.fullName}
                  {unreadCounts[colleague._id] > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                      {unreadCounts[colleague._id]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 truncate">@{colleague.username}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Active Chat Window */}
      <div className={`${!selectedPartner ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative`}>
        {selectedPartner ? (
          <>
            <div className="h-16 border-b border-zinc-800 bg-[#141414] flex items-center px-6 gap-4 shrink-0 z-10">
              <button onClick={() => setSelectedPartner(null)} className="md:hidden text-zinc-400 hover:text-white"><FiArrowLeft size={24} /></button>
              <img src={selectedPartner.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
              <div>
                <div className="font-bold text-white leading-tight">{selectedPartner.fullName}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* 🚨 NEW: 10-Day Retention Banner at the top of the chat */}
              <div className="flex justify-center mb-8">
                <span className="bg-zinc-800/80 text-zinc-400 text-[10px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-full border border-zinc-700/50 flex items-center gap-2">
                  <FiClock size={12} /> Messages auto-delete 10 days after sending
                </span>
              </div>

              {messages.map((msg) => {
                const isMine = msg.sender._id === currentUser?._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] lg:max-w-[60%] flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMine && <img src={msg.sender.avatar} alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-zinc-800" />}
                      <div className={`p-4 rounded-2xl ${isMine ? "bg-blue-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(37,99,235,0.2)]" : "bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50"}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#141414] border-t border-zinc-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a secure message..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-500 text-white p-3 md:px-6 rounded-xl transition-colors disabled:opacity-50"><FiSend /></button>
              </form>
            </div>
          </>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20 px-4">
             <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50">
               <FiMessageSquare className="text-4xl text-zinc-600" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">End-to-End Encrypted Silo</h3>
             <p className="max-w-md text-center text-sm leading-relaxed mb-6">Select a colleague from the directory to start a secure conversation.</p>
             
             {/* 🚨 NEW: 10-Day Retention Notice in the empty state */}
             <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800/30 px-4 py-2 rounded-lg border border-zinc-700/30">
               <FiClock className="text-zinc-500" />
               Subject to strict 10-day data retention policy.
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Messages;