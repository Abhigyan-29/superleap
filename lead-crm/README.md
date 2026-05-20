# Superleap CRM

A high-performance, aesthetically striking Lead Management CRM built with a custom Neon Cyberpunk design system. Superleap CRM is designed to handle thousands of records effortlessly while enforcing strict business logic through an intuitive drag-and-drop Kanban board and virtualized list views.

## 🚀 Tech Stack

### Core Frontend
*   **React 18** - UI Library
*   **TypeScript** - Static Typing
*   **Vite** - Build Tool & Dev Server
*   **Vanilla CSS** - Completely bespoke, zero-dependency custom design system utilizing CSS variables for extreme performance.

### Architecture & Libraries
*   **@tanstack/react-query** - Server state management, caching, and optimistic UI updates.
*   **react-router-dom** - Dynamic, deep-linkable nested routing.
*   **@dnd-kit/core** - Lightweight, performant drag-and-drop interactions for the Kanban board.
*   **@tanstack/react-virtual** - Headless UI virtualization for rendering massive data tables (5,000+ rows) without DOM lag.
*   **lucide-react** - Crisp, modern iconography.

### Backend Mock
*   **json-server** - Full fake REST API handling high-volume CRUD operations.
*   **concurrently** - Runs the API and Frontend servers seamlessly with a single command.

---

## 🛠️ Setup Steps

1. **Install Dependencies**
   Navigate to the project directory and install the required npm packages:
   ```bash
   npm install
   ```

2. **Generate the Mock Database**
   The application requires a mock database to run. We have provided a script that instantly generates a 5,000-record dataset for stress testing:
   ```bash
   node generate_db.cjs
   ```
   *(This creates a `db.json` file in your root directory).*

3. **Run the Development Server**
   Start both the Vite frontend and the json-server backend simultaneously:
   ```bash
   npm run dev
   ```

4. **View the App**
   Open your browser and navigate to: `http://localhost:5173`

---

## 🎨 Design & Architecture Decisions

*   **Performance-First Kanban**: To solve the DOM-crushing issue of rendering 5,000 draggable nodes at once, the Kanban columns are strictly capped at rendering the 100 most recently updated leads. The List View utilizes full virtualization to render all 5,000 without lag.
*   **Cyberpunk Aesthetic**: We consciously moved away from heavy GPU-blocking effects (like full-screen `backdrop-filter: blur`) in favor of flat, high-contrast pure black and Neon Green. This creates a visually arresting "hacker/matrix" aesthetic that renders effortlessly at 60 FPS.
*   **Strict State Machine**: Business logic is strictly enforced on the frontend. Leads can only flow logically (`NEW` -> `CONTACTED` -> `QUALIFIED` -> `CONVERTED` or `LOST`). The drag-and-drop interface provides real-time visual feedback (red/green glows) to prevent invalid drops.
*   **Deep-Linkable Modals**: Modals are driven by the URL (e.g., `/leads/:id/edit`). This allows users to bookmark specific leads, refresh the page without losing context, and share direct links with team members.

---

## 🤖 AI Usage Note

This project was rapidly developed and iterated upon in collaboration with an advanced AI coding assistant. The AI was utilized to:
1. Scaffold the core Vite/React/TypeScript architecture.
2. Implement complex libraries like `@dnd-kit` and `@tanstack/react-virtual`.
3. Rapidly prototype and pivot through multiple complete design system overhauls (from colorful Glassmorphism, to austere Enterprise SaaS, to the final highly-optimized Neon Cyberpunk aesthetic).
4. Identify and resolve complex DOM rendering bottlenecks during stress testing.
