# 📱 PingUp - Modern Social Networking Platform

PingUp is a full-stack social media application designed for real-time interaction and seamless networking. It leverages modern web technologies to provide a fast, secure, and engaging user experience.

## ✨ Key Features

- **🔐 Secure Authentication:** Powered by **Clerk**, providing passwordless login and secure session management.
- **💬 Real-time Messaging:** Implementation of **Server-Side Events (SSE)** for instant, low-latency chat without the overhead of WebSockets.
- **🌎 Discover People:** Intelligent search and discovery system to find users by name, username, bio, or location.
- **🤝 Connection System:** Multi-tier networking including Following/Followers and a "Connection Request" handshake system.
- **📸 Rich Media Support:** Integration with **ImageKit** for optimized image and video uploads, including profile customization and stories.
- **🏗️ State Management:** Global state handled via **Redux Toolkit** for predictable data flow across the app.
- **⚡ Background Jobs:** Managed by **Inngest** for handling asynchronous tasks like connection request notifications.

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**
- **Redux Toolkit** (State Management)
- **Tailwind CSS** (Styling)
- **Lucide React** (Iconography)
- **Clerk React** (Authentication)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose** (Database)
- **Server-Side Events (SSE)** (Real-time updates)
- **ImageKit SDK** (Media Management)
- **Inngest** (Serverless Queues)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Clerk Account (for API keys)
- ImageKit Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pingup.git
   cd pingup
   ```

2. **Setup Server:**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server folder:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_uri
   CLERK_SECRET_KEY=your_clerk_secret
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_url_endpoint
   ```

3. **Setup Client:**
   ```bash
   cd ../client
   npm install
   ```
   
   Create a `.env` file in the client folder:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_BASEURL=http://localhost:4000
   ```

4. **Run the Application:**
   - **Server:** `npm run server` (or `node server.js`)
   - **Client:** `npm run dev`

## 📂 Folder Structure

```
├── client/
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── app/            # Redux Store
│   │   ├── components/     # Reusable UI elements
│   │   ├── features/       # Redux Slices (User, Messages, Connections)
│   │   └── pages/          # Feed, Profile, Chat, Discover
├── server/
│   ├── configs/            # DB, ImageKit, Multer configs
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose Schemas
│   └── routes/             # API Endpoints
```

## 📝 Key Implementation Details

### Server-Side Events (SSE)
Instead of traditional WebSockets, this project uses SSE for real-time chat updates. This allows the server to push new messages to the client over a single HTTP connection, making it highly efficient for a social media messaging use case.

### Optimization
Images and videos are processed on-the-fly using ImageKit transformations (WebP format, auto-quality) to ensure fast load times on mobile and desktop devices.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

### 💡 Tips for your GitHub Profile:
- **Screenshot:** Once the app is running, take a screenshot of the "Feed" or "Discover" page and add it to the `README` under a `## Preview` section. It makes the project much more attractive to recruiters.
- **Pinned Repo:** Pin this to your GitHub profile as it shows full-stack proficiency, real-time data handling, and integration with 3rd party APIs (Clerk/ImageKit).
