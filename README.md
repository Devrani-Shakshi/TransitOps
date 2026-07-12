# 🚚 TransitOps - Fleet Management & Dispatch Operations

TransitOps is a modern, real-time fleet management and dispatch operations platform. It features an Angular-based responsive frontend and a containerized FastAPI backend with asynchronous database connections, real-time WebSocket feeds, and automated background workers.

---

## 🏗️ System Architecture

TransitOps is organized into a microservices-inspired architecture managed via Docker Compose:

* **Frontend (`Angular 18`)**: Implements the fleet dashboard, driver logs, trip dispatcher, and SVG analytics visualization. Runs on an Nginx proxy.
* **Backend (`FastAPI`)**: High-performance asynchronous REST API handling data management, authentication, reports generation, and WebSocket connections.
* **Database (`PostgreSQL`)**: Persistent storage for all core relational data (Trips, Vehicles, Drivers, Fuel Logs, Maintenance, etc.).
* **Cache & Message Broker (`Redis`)**: Powers real-time state caching, WebSockets coordination, and Celery background task queuing.
* **Background Workers (`Celery`)**: Asynchronous worker pool handling long-running processes like reporting pipelines and alerts.

---

## ✨ Features

* **Real-time Fleet Dashboard**: Live KPIs (Active/Available/Maintenance Vehicles, Active/Pending Trips, Duty Drivers, Utilization) updating instantly via WebSockets.
* **Interactive Fleet Distribution**: Interactive widgets detailing availability ratios across Trucks, Vans, and Containers.
* **Trip Dispatcher**: Schedule routes, weight loads, distances, and track transit statuses.
* **Maintenance Ledger**: Track vehicle logs, schedule checkups, and update shop logs.
* **Offline Mock Mode**: Local developers can bypass server dependency using local mock authentication (`Demo@123`).
* **Interactive OpenAPI Docs**: Standardized schema representations available out-of-the-box.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: Angular 18 (Standalone Components, Signals)
* **Styling**: Tailwind CSS
* **WebSocket client**: RxJS WebSockets

### Backend
* **Framework**: FastAPI (Python 3.10+)
* **ORM / Database**: SQLAlchemy (Asyncpg) + PostgreSQL
* **Migrations**: Alembic
* **Task Queue**: Celery + Redis
* **Testing**: PyTest

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Option 1: Running with Docker Compose (Recommended)

1. Clone and navigate to the project directory:
   ```bash
   cd TransitOps
   ```
2. Build and start the entire stack:
   ```bash
   docker-compose up --build
   ```
3. Once the services are initialized:
   * **Frontend Application**: Access at `http://localhost/` (or port mapped in your compose file).
   * **FastAPI Swagger Docs**: Access at `http://localhost:8000/docs` or `http://localhost:8000/redoc`.

---

### Option 2: Running Locally for Development

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run migrations and seed the SQLite / PostgreSQL database:
   ```bash
   alembic upgrade head
   python seed.py
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Start the Angular dev server:
   ```bash
   npm start  # or: ng serve
   ```
4. Open your browser and navigate to `http://localhost:4200/`.
