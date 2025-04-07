import { Refine } from "@refinedev/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CanvasPage from "./pages/CanvasPage";
import LoginPage from "./pages/Login";
import CheckEmailPage from "./pages/CheckEmail";
import VerifyToken from "./pages/VerifyToken";
import AccessDenied from "./pages/AccessDenied";
import { authProvider } from "./authProvider";

const App = () => {
    return (
      <Router>
      <Refine authProvider={authProvider}>
      <div className="p-6 h-screen bg-gray-50">
          <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/check-email" element={<CheckEmailPage />} />
              <Route path="/auth/verify" element={<VerifyToken />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/" element={<CanvasPage />} />
          </Routes>
      </div>
    </Refine>
    </Router>

  );
};

export default App;
