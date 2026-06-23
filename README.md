# Resume Studio

A premium, interactive full-stack resume builder featuring dynamic templates, custom design customization, live zooming, and PDF exports.

## 🚀 Key Features

* **Premium Layout Templates:** Choose from various professional designs, including the custom high-contrast *Black Minimalist Structural* template tailored for engineers and architects.
* **Real-time Customization:** Dynamically adjust theme colors, typography fonts, line spacing, and profile photo shape (circle, square, squircle)/border styling.
* **Profile Image Upload:** Easily upload and position profile pictures on supported templates.
* **High-Fidelity PDF Export:** Exports pixel-perfect PDFs using Puppeteer.
* **Autosave Progress:** Automatically saves inputs to local storage.

---

## 🛠️ Project Structure

The project is split into two folders:
* `/frontend`: React application built with Vite and styled using Tailwind CSS.
* `/backend`: Node.js Express server running Sequelize, SQLite, and Puppeteer for PDF generation.

---

## 💻 Getting Started (Local Setup)

To run the application locally on your machine, follow these instructions:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

---

### 1. Setup & Run the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   node server.js
   ```
The backend server will run at `http://localhost:3001`.

---

### 2. Setup & Run the Frontend

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The frontend dev server will launch at `http://localhost:5173`. Open this URL in your web browser.

---

## 📦 Deployment Instructions

To host your full-stack application online:

1. **Host Backend:** Connect your repository to [Render](https://render.com/) or [Railway](https://railway.app/). Set the root directory to `backend`, configuration build command to `npm install`, and start command to `node server.js`.
2. **Host Frontend:** Deploy to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Select the `frontend` directory and set the build settings for Vite (`npm run build`). Update the backend API URL environment variable to point to your live backend endpoint.
