import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNotificationService } from "./services/notificationService";

// Initialize notification service to reschedule pending reminders
initNotificationService();

createRoot(document.getElementById("root")!).render(<App />);
