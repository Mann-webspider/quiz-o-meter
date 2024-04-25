import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
// import Home from './routes/home';
import Login from './routes/login';
import Join from './routes/join';
import Teacher from './routes/Teacher';
import CreateRoom from './routes/teacherRoom';
import { CookiesProvider } from 'react-cookie';
import Start from './routes/start';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path:"/login",
    element: <Login/>
  },
  {
    path:"/join",
    element: <Join/>
  },
  {
    path:"/teacher",
    element: <Teacher/>
  },
  { 
    path:"/create",
    element:<CreateRoom/>
  },
  {
    path:"/start",
    element:<Start/>
  }
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CookiesProvider defaultSetOptions={{ path: '/' }}>

  {/* <React.StrictMode> */}
     {/* <App /> */}
    <RouterProvider router={router} />
  {/* </React.StrictMode> */}
  </CookiesProvider>
);

