import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Login from './components/Login/Login';
import LoginSuccess from './components/Login/LoginSuccess';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login_success',
    element: <LoginSuccess />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      //   {
      //     path: "authorization-success",
      //     element: <AuthSuccess />
      //   }
    ],
  },
]);
const Router = () => <RouterProvider router={router} />;

export default Router;
