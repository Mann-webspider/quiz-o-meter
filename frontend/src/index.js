import ReactDOM from "react-dom/client";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Join from "./routes/join";
import Login from "./routes/login";
import QuizLive from "./routes/QuizLive";
import Start from "./routes/start";
import Teacher from "./routes/Teacher";
import CreateRoom from "./routes/teacherRoom";
import WaitingRoom from "./routes/WaitingRoom";

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
	</CookiesProvider>,
);
