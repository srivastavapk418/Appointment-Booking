# Appointment Booking App

A full-stack appointment booking application built with React, Node.js/Express, and Supabase.

## Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Frontend   | React 18 + Vite       |
| Backend    | Node.js + Express     |
| Database   | Supabase (PostgreSQL) |
| AI Feature | Grok API              |

## Features

- 📋 Book appointments (patient name, mobile, doctor, date, time)
- 📊 View all appointments in a responsive table with status
- ✅ Mark appointments as **Completed**
- ❌ **Cancel** appointments
- 🗑️ **Delete** appointments
- 🤖 **AI-generated summaries** via xAI Grok (when reason for visit is provided)
- 💾 Persistent storage — data survives page refresh
- ✔️ Form validation with inline error messages
- 🔔 Toast notifications for all actions
- 📱 Fully responsive design

---

## Setup Instructions

### 1. Database Setup (Supabase)

In your Supabase project, go to **SQL Editor** and run the contents of `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name     TEXT        NOT NULL,
  mobile_number    TEXT        NOT NULL,
  doctor_name      TEXT        NOT NULL,
  appointment_date DATE        NOT NULL,
  appointment_time TIME        NOT NULL,
  reason_for_visit TEXT,
  ai_summary       TEXT,
  status           TEXT        NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

Server starts at `http://localhost:3001`

### 3. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Client starts at `http://localhost:5173`

---

## Project Structure

```
appointment-app/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentForm.jsx
│   │   │   ├── AppointmentTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── useAppointments.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── index.html
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── middleware/
│   │   └── validate.js
│   ├── routes/
│   │   └── appointments.js
│   ├── supabase.js
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── README.md
```

## API Endpoints

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/api/appointments`            | Fetch all appointments |
| POST   | `/api/appointments`            | Create new appointment |
| PATCH  | `/api/appointments/:id/status` | Update status          |
| DELETE | `/api/appointments/:id`        | Delete appointment     |

## Environment Variables

### Server (`server/.env`)

```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
XAI_API_KEY=...
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:3001
```
