import { createRoot } from "react-dom/client";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/layout.tsx";
import { File } from "./pages/files/[id].tsx";
import { Files } from "./pages/files/index.tsx";
import { FileUpload } from "./pages/files/upload.tsx";
import { PlayerProvider } from "./components/player.tsx";
import { Home } from "./pages/home.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/files/:id",
    element: <File />,
  },
  {
    path: "/files/upload",
    element: <FileUpload />,
  },
  {
    path: "/files",
    element: <Files />,
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
