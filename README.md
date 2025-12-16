# StarCop - Startup & Investor Connection Platform

StarCop is a comprehensive MERN stack application designed to bridge the gap between Startups and Investors. It facilitates networking, funding opportunities, and real-time communication through a feature-rich interface featuring 3D elements and AI integration.

## 🚀 Features

### Core Functionality
- **Dual Role System:** Dedicated dashboards and workflows for **Startups** and **Investors**.
- **Authentication:** Secure JWT-based signup/login with role selection.
- **Profiles:** Detailed profiles with specific fields for startups (Stage, Team Size, Pitch Deck) and investors (Thesis, Budget).

### Networking & Opportunities
- **Opportunity Board:** Startups can browse funding opportunities posted by investors; Investors can create listings.
- **Applications:** Streamlined application process with status tracking (Submitted -> Viewed -> Accepted/Rejected).
- **Matchmaking:** "Send Interest" feature allowing focused interactions.
- **Save & Bookmark:** Users can save opportunities for later review.

### Real-Time Interaction
- **Live Chat:** One-to-one messaging powered by **Socket.io**.
- **Notifications:**
  - **In-App:** Real-time toast notifications for messages and interests.
  - **System (Native):** Desktop notifications for critical alerts even when the app is backgrounded.
- **Social Feed:** Post text, images, and carousels to engage with the community.

### Advanced Tech
- **AI Integration:** Uses **Google Gemini 1.5 Flash** to summarize interest requests and interactions.
- **3D UI:** Immersive background effects using `react-three-fiber` and shaders (Liquid Chrome).
- **Media Handling:** **Cloudinary** integration for efficient image and video management (Pitch Decks, Profile Pics).

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite**
- **TailwindCSS v4** for styling
- **Framer Motion** for animations
- **Three.js / React Three Fiber** for 3D visuals
- **Zustand** for state management
- **React Router DOM** for navigation
- **Socket.io Client** for real-time events

### Backend
- **Node.js** & **Express**
- **MongoDB** with **Mongoose**
- **Socket.io** for real-time bidirectional communication
- **JWT** for authorization
- **Multer** & **Cloudinary** for file uploads
- **Google Generative AI** SDK

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Cloudinary Account
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd StarCop
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` with the following variables:
```env
PORT=3002
MONGO_URL=mongodb://127.0.0.1:27017/StarCop  # or your Atlas URL
JWT_SECRET=your_super_secret_key_123
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend:
```bash
npm run dev
# Server will run on port 3002
```

### 3. Frontend Setup
Navigate to the frontend folder and install dependencies:
```bash
cd ../Frontend
npm install
```

Create a `config.js` or `.env` if required (Default API URL is configured to `http://localhost:3002`):

Run the frontend:
```bash
npm run dev
# App will run on http://localhost:5173
```

## 📂 Project Structure

```
d:/3rd/
├── Backend/                 # Express Server & API
│   ├── controllers/         # Logic for Users, Posts, Chat, Opportunities
│   ├── models/              # Mongoose Schemas
│   ├── routes/              # API Endpoints
│   ├── middleware/          # Auth & File Handling
│   ├── socket/              # (if separated) Socket logic
│   └── server.js            # Entry Point
│
├── Frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI Components
│   │   ├── context/         # Auth & Notification Contexts
│   │   ├── pages/           # Main Views (Dashboard, Login, Feed)
│   │   ├── socket/          # Socket Client Config
│   │   └── App.jsx          # Validation & Routing
│   └── public/              # Static Assets & Service Workers
```

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
Built with ❤️ by the StarCop Team
