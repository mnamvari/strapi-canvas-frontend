import React, {useEffect} from "react";
import { useAuthenticated } from "@refinedev/core";
import { Navigate } from "react-router-dom";
import Canvas from "../components/Canvas";

const CanvasPage: React.FC = () => {
  const { data, isLoading } = useAuthenticated();

  useEffect(() => {
    console.log("Canvas page authentication:", data?.authenticated);
  }, [data]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (!data?.authenticated) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <Canvas />;
};


export default CanvasPage;
