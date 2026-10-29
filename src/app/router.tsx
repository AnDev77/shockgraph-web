import { createBrowserRouter } from "react-router";
import { AppLayout } from "./AppLayout";
import { HomePage } from "../pages/HomePage";
import { AssetPage } from "../pages/AssetPage";
import { RoomPage } from "../pages/RoomPage";

export const router = createBrowserRouter([{
  element: <AppLayout />,
  children: [
    { path: "/", element: <HomePage /> },
    { path: "/assets/:symbol", element: <AssetPage /> },
    { path: "/rooms/:symbol", element: <RoomPage /> },
    { path: "*", element: <HomePage /> },
  ],
}]);
