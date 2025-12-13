import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./routes/login";
import Join from "./routes/join";
import Teacher from "./routes/Teacher";
import CreateRoom from "./routes/teacherRoom";
import { CookiesProvider } from "react-cookie";
import Start from "./routes/start";
import WaitingRoom from "./routes/WaitingRoom";
import QuizLive from "./routes/QuizLive";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/join",
    element: <Join />,
  },
  {
    path: "/teacher",
    element: <Teacher />,
  },
  {
    path: "/create",
    element: <CreateRoom />,
  },
  {
    path: "/start",
    element: <Start />,
  },
  {
    path: "/waiting",
    element: <WaitingRoom />,
  },
  {
    path: "/quiz-live",
    element: <QuizLive />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CookiesProvider defaultSetOptions={{ path: "/" }}>
    <RouterProvider router={router} />
  </CookiesProvider>
);
