# 🌾 Krishi Mithr AI — Smart Farming Assistant

💡 **Overview**
Krishi Mithr AI is a powerful AI-powered solution for farmers that combines Gemini LLM, Google Vertex AI, Firebase, Pinecone, and a highly interactive UI. Built using modern tools like Next.js and Tailwind, it provides six intelligent, easy-to-use features to make farming smarter.

## ✨ Features & Tech Stack

### 🔐 Home Page & Firebase Authentication
- Secure Gmail sign-in using Firebase Auth
- User info stored in Firebase Firestore  
- Visual logic and route design using Firebase Studio (UI Builder)
- **Tech Used:** Firebase Auth, Firestore, Firebase Studio, React, TypeScript

### 🧭 Feature Dashboard
- Centralized access to all 6 smart farming features
- Designed with Firebase Studio for seamless page flows and backend triggers
- **Tech Used:** Firebase Studio, React, TailwindCSS, Radix UI

### 🌱 Feature 1: Crop Disease Detection & Prevention
- Image upload analyzed using Vertex AI AutoML
- Disease passed to Gemini LLM for explanation and solutions
- **Tech Used:** Vertex AI, Gemini LLM, Firebase Storage, TypeScript

### 🧠 Feature 2: Multilingual AI Assistant with 3D Avatar
- Chat and voice via Gemini LLM
- Avatar created using Three.js
- Audio replies from Google TTS
- Language selection and translation included
- **Tech Used:** Gemini LLM, Google TTS, Three.js, Framer Motion, React

### 🌍 Feature 3: Soil Analysis & Crop Recommendation
- Upload soil image → auto-detects location with Geocoding API
- Gemini LLM offers soil-specific recommendations
- **Tech Used:** Gemini LLM, Geocoding API, React Hook Form, Zod

### 🗺️ Feature 4: Smart Farming Maps
- Natural language questions like "Where to buy seeds nearby?"
- Results shown on interactive map using Google Maps API
- **Tech Used:** Maps API, Places API, Tailwind, Lucide Icons

### 📄 Feature 5: Government Scheme Advisor (RAG-based)
- Natural language Q&A about schemes
- Uses Gemini Embedding + Pinecone for retrieval
- Upload PDFs or documents to get context-aware responses
- **Tech Used:** Gemini LLM, text-embedding-004, Pinecone DB, Firebase

### 📊 Feature 6: Market Price Analysis
- Real-time crop pricing by region, market, date
- Filterable interactive dashboard powered by Looker Studio
- **Tech Used:** Agmarknet API, BigQuery, Looker Studio

## 🛠 Full Tech Stack

### 🔧 Backend
- Firebase Auth & Firestore
- Firebase Studio (for UI & flow design)
- Google Vertex AI (AutoML + LLM)
- Gemini LLM (text, chat, embedding)
- Pinecone Vector DB
- Agmarknet API
- BigQuery
- Looker Studio
- Google Maps & Places APIs

### 🎨 Frontend
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Radix UI, ShadCN UI
- Framer Motion, GSAP
- Three.js (3D avatars)
- Lucide Icons
- React Hook Form, Zod
- Date-FNS, Recharts

### 📦 Dev Tools & Infra
- Firebase Studio for low-code visual flows
- Vercel for deployment
- dotenv, postcss, jsonrepair
- tailwindcss-animate, clsx

## 🧪 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏁 Final Note

**Krishi Mithr AI** is more than an app—it's a full ecosystem for modern agriculture. With AI tools, multilingual chat, disease prevention, and data dashboards, this app empowers farmers to grow smarter and earn better.

Built with 💚 for the farmers of tomorrow.
