# 🎬 StreamHub - B2B Media Vault & Workspace (Frontend)

StreamHub is a secure, high-performance web interface designed for corporate video hosting, workspace messaging, and compliance tracking. Built using **React**, **Vite**, **Tailwind CSS v4**, and **Redux Toolkit**, this frontend implements a strict role-based access control (RBAC) hierarchy distinguishing corporate businesses from general employees.

---

## 🌟 Key Features

* **🛡️ Zero-Trust Media Gating:** Access-controlled playback. Employees must request vault access or register via active invite links to watch corporate videos.
* **💬 Real-Time Encrypted Chat:** Secure workspace messaging with automatic 10-day retention policies and live message exchanges powered by Socket.io.
* **📊 Compliance Analytics Dashboard:** Corporate channels gain access to detailed views, subscription numbers, and aggregate user engagement statistics.
* **⚡ Micro-Animations & Transitions:** Fluid page load animations and responsive layout sidebars built using `framer-motion`.
* **📁 Comprehensive Media Utilities:** Advanced media management including custom playlist curation, polymorphic video/comment liking, and interactive watch histories.

---

## 🛠️ Tech Stack

* **Core Library:** React 19
* **Bundler & Build Tool:** Vite 8 (Hot Module Replacement enabled)
* **Styling & Theme:** Tailwind CSS v4 & Framer Motion for animations
* **State Management:** Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)
* **Routing:** React Router v7
* **API Client:** Axios (configured with global interceptors and `withCredentials`)
* **WebSockets:** socket.io-client for real-time notifications and chat sync

---

## 📁 Repository Structure

```bash
src/
├── assets/         # Global visual assets and logos
├── components/     # Reusable layout elements (Sidebars, Modals, Video Cards)
├── hooks/          # Custom helper hooks
├── pages/          # Full page views (Dashboard, Chat, Search, Video Detail)
├── store/          # Redux auth slices and state configurations
└── utils/          # Axios instance & custom backend api interceptors
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher)
* Backend API up and running (Render or local instance)

### 2. Installation
1. Navigate to the frontend directory:
   ```bash
   cd "Video Frontend"
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```

### 3. Environment Setup
Create a `.env` file at the root of the frontend folder by copying the provided example:
```bash
cp .env.example .env
```
Update the variables within `.env` to match your target backend endpoints:
```env
# Production Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Production Backend Socket.io URL
VITE_SOCKET_URL=http://localhost:8000
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```

### 5. Production Build
To build the application for deployment (optimized bundle compilation):
```bash
npm run build
```
Deploy the resulting `dist/` directory to your static hosting provider (e.g., Netlify). Note that client-side routing redirects are preconfigured in the `public/_redirects` file.
