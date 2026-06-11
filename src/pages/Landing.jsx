import { Link } from "react-router-dom";
import { FiShield, FiVideo, FiUsers, FiLock, FiZap, FiServer, FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-zinc-800/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <FiVideo className="text-white" />
          </div>
          Stream<span className="text-blue-500">Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-white text-black hover:bg-zinc-200 rounded-full transition-colors shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <FiShield /> Simple Secure Access for Teams
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 max-w-5xl leading-tight"
        >
          Safe Video Streaming for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Your Team</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl text-zinc-400 max-w-3xl mb-12 leading-relaxed"
        >
          A simple video platform for teams. Upload training, choose who can watch, and keep your content private.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <Link to="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 text-lg">
            Start Now
          </Link>
          <Link to="/login" className="px-8 py-4 bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all border border-zinc-700 backdrop-blur-sm flex items-center justify-center gap-2 text-lg">
            <FiUsers /> Sign in as Employee
          </Link>
        </motion.div>
      </main>

      {/* Scroll-Triggered "How It Works" Section */}
      <section className="relative z-10 py-24 px-6 bg-black/40 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Learn how your team can upload videos, request access, and watch safely.</p>
          </div>

          <div className="space-y-32">
            
            {/* Step 1 */}
            <WorkflowStep 
              number="01"
              icon={<FiServer />}
              title="Create Team Accounts"
              description="When your team joins, owners get tools to upload videos and employees get a private place to watch them."
              align="left"
            />

            {/* Step 2 */}
            <WorkflowStep 
              number="02"
              icon={<FiZap />}
              title="Request Access"
              description="Employees can request permission to view videos, and owners get a quick notification to approve them."
              align="right"
            />

            {/* Step 3 */}
            <WorkflowStep 
              number="03"
              icon={<FiLock />}
              title="Watch Safely"
              description="Approved employees can play videos in a protected viewer, so only the right people can watch."
              align="left"
            />

            {/* Step 4 */}
            <WorkflowStep 
              number="04"
              icon={<FiActivity />}
              title="Remove Access Anytime"
              description="If someone leaves the team, you can turn off their access and they will no longer see restricted videos."
              align="right"
            />

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 text-center border-t border-zinc-800/50">
        <h2 className="text-4xl font-bold text-white mb-8">Ready to share videos safely?</h2>
        <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black hover:bg-zinc-200 font-bold rounded-full transition-all text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          Get Started <FiShield />
        </Link>
      </section>

    </div>
  );
};

// Reusable Scroll-Revealing Component
const WorkflowStep = ({ number, icon, title, description, align }) => {
  const isLeft = align === "left";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }} // Triggers slightly before scrolling into view
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
    >
      {/* Visual Graphic Side */}
      <div className="flex-1 w-full">
        <div className="aspect-video bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          {/* Abstract background shape for the graphic */}
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="h-full w-full border border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
            <div className="text-5xl text-blue-500">{icon}</div>
            <div className="text-zinc-600 font-mono font-bold text-6xl opacity-20 absolute bottom-4 right-6">{number}</div>
          </div>
        </div>
      </div>

      {/* Text Content Side */}
      <div className="flex-1 text-center md:text-left">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 font-bold mb-6 border border-blue-500/20">
          {number}
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
        <p className="text-lg text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default Landing;