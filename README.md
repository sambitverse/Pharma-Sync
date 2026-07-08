# Pharma Sync 🏥✨

Pharma Sync is a modern, responsive, and full-stack **Smart Health Management System** designed to connect patients, doctors, and clinic administrators. The application simplifies medical workflows such as scheduling visits, managing digital prescriptions, tracking medicine stocks, and checking wellness topics using an integrated **Gemini AI Health Assistant**.

Live Deployment: **[pharma-sync-five.vercel.app](https://pharma-sync-five.vercel.app/)**

---

## 🌟 Core Features

### 👤 Patient Portal
*   **Smart Booking**: Request, schedule, and track clinic appointments dynamically.
*   **E-Prescriptions**: View digital prescriptions issued by doctors, including instructions and notes.
*   **AI Health Assistant**: Ask questions about symptoms, wellness, or medications in a conversational chat window.
*   **Personal Profile**: Manage contact info, age, gender, and medical history.

### 🩺 Doctor Area
*   **Schedule Management**: View today's appointments, confirm pending slots, or mark appointments as completed.
*   **Prescription Compiler**: Generate digital prescriptions for patients directly from the dashboard.
*   **Patient Database**: View clinical patient records, ages, gender, and past medical history charts.

### 🔑 Administrator Dashboard
*   **Clinic Overview**: View system metrics (total patients, active doctors, total appointments, and inventory warnings).
*   **Inventory Tracking**: Add new medicines, edit quantity indicators, and get automatic "Low" or "Critical" stock alerts.
*   **Clinic Database**: Keep a full-width log of recent appointments and stock records.

### 🤖 Google Gemini Assistant
*   Powered by the **Gemini 2.5 Flash** model (`gemini-2.5-flash`) via the Google GenAI SDK.
*   Provides structured health advice, symptoms check suggestions, and medication instructions.
*   *Note: AI suggestions are for informational purposes and always append formal medical disclaimers.*

---

## 🛠️ Technology Stack

*   **Frontend**: React, Vite, Lucide React (Icons), Vanilla CSS (glassmorphism/curated color palettes).
*   **Backend**: Node.js, Express.js (REST APIs, CORS middleware, JWT security).
*   **Database**: PostgreSQL (hosted on **Supabase**).
*   **AI Integration**: Google Generative AI (Gemini APIs).
*   **Hosting**: Vercel (Front-end SPA + Back-end Serverless Functions).

---

## ⚙️ Configuration & Environment Variables

To run the application locally or deploy it to production, create a `.env` file inside the `server/` directory containing the following:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=your_supabase_pooled_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

*   **Database Note**: Ensure you use Supabase's **IPv4 Connection Pooler** (typically port `6543`) for Vercel serverless function compatibility to prevent IPv6 DNS resolution issues.

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Database Initialization
Deploy the schema and seed default logins to your PostgreSQL instance:
```bash
cd server
npm install
node init_db.js
```

### 2. Start the Backend API Server
```bash
npm run dev
# The API will be listening at http://localhost:5000
```

### 3. Start the Frontend Client
```bash
cd ../client
npm install
npm run dev
# The Client will be running at http://localhost:5173
```

---

## 🔒 Default Test Logins (Password: `password123`)
*   **Patient Account**: `patient@health.com`
*   **Doctor Account**: `doctor@health.com`
*   **Admin Account**: `admin@health.com`

---

## 📦 Deployment on Vercel

### Client Configuration (`client/vercel.json`)
Allows React Router client-side path handling for SPA:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Server Configuration (`server/vercel.json`)
Routes backend API calls to serverless execution:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

Deploy both projects using Vercel CLI:
```bash
# Inside client directory
npx vercel --prod

# Inside server directory
npx vercel --prod
```
## Contributors
* Sambit Moharana
* Rohan Kumar Muduli
* Saumyajeet Pradhan
* Omm Prakash Behera