# Project Nexus – Unified Dashboard

A **personalized, unified dashboard** that brings together your most-used widgets in one place.  
Built with **Django REST Framework** (backend) and **React + Vite** (frontend), Project Nexus allows you to log in, add widgets, and interact with real-time data from external APIs.

---

## 🚀 Features

- 🔑 **User Authentication** (JWT, Token-based, Google Social Login)
- 🧩 **Customizable Widgets**:
  - GitHub Stats (user profile, repos, stars)
  - Weather (via OpenWeather API)
  - News (via NewsAPI)
  - Todo List (user-specific)
- 🎛️ **Widget Management** – Add, remove, configure, and reorder widgets via drag-and-drop
- 🌐 **External Integrations** – GitHub API, OpenWeather, NewsAPI
- 💾 **Persistent Dashboard** – Widget layout & data stored per user in backend DB

---

## 🛠️ Tech Stack

- **Backend**: Django, Django REST Framework, JWT Authentication
- **Frontend**: React 19, Vite, Axios, dnd-kit (drag & drop)
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Other**: CORS, Redis caching (optional), Environment-based configs

---

## 📂 Project Structure

project_nexus/
├── backend/ # Django project (settings, urls, wsgi/asgi)
├── core/ # Main app (models, views, serializers, APIs)
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Widgets & UI components
│ │ ├── api/ # Axios API layer
│ │ └── App.jsx # Main app entry
└── manage.py

yaml
Copy code

---

## ⚙️ Setup Instructions

### 1️⃣ Backend (Django)

# Navigate to project root

cd project_nexus

# Create virtual environment

python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

# Install dependencies

pip install -r requirements.txt

# Run migrations

python manage.py migrate

# Start backend server

python manage.py runserver
Backend runs on: http://localhost:8000

### 2️⃣ Frontend (React + Vite)

bash
Copy code
cd frontend

# Install dependencies

npm install

# Start frontend dev server

npm run dev
Frontend runs on: http://localhost:5173

🔑 Environment Variables
Create a .env file in the project root with:

SECRET_KEY=your_django_secret_key
DEBUG=True

# API Keys

GITHUB_API_TOKEN=your_github_token
OPENWEATHER_API_KEY=your_openweather_key
NEWS_API_KEY=your_newsapi_key
▶️ Usage
Register/Login to the app

Add widgets (GitHub, Weather, News, Todo)

Configure widgets (e.g., GitHub username, city name)

Drag & drop to reorder dashboard layout

📌 Future Improvements
📊 Add more widgets (Finance, Calendar, Notes, etc.)

☁️ Deployment with Docker + Cloud (Heroku/Vercel)

🗂️ PostgreSQL support with Redis caching

🤝 Contributing
Feel free to fork this repo, raise issues, and submit PRs!

📜 License
MIT License. Free to use and modify.
