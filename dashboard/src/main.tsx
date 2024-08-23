import { createRoot } from "react-dom/client";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/layout.tsx";
import { File } from "./pages/file/index.tsx";
import { Home } from "./pages/home.tsx";
import { FileUpload } from "./pages/file/upload.tsx";
import { PlayerProvider } from "./components/player.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/file/:id",
    element: <File />,
  },
  {
    path: "/file/upload",
    element: <FileUpload />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <ChakraProvider>
    <PlayerProvider>
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </PlayerProvider>
  </ChakraProvider>
);
