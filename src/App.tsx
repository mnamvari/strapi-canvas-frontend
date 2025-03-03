import { Refine } from "@refinedev/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Canvas from "./components/Canvas";
import TestPage from "./pages/TestPage"; 
import CanvasPage from "./pages/CanvasPage";

const App = () => {
  return (
      <Router>
      <Refine>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Real-Time Canvas App12</h1>
          <Routes>
              {/* Default route for the Canvas */}
              <Route path="/" element={<CanvasPage />} />

              {/* New route for the TestPage */}
              <Route path="/test" element={<TestPage />} />
          </Routes>
      </div>
    </Refine>
    </Router>

  );
};

export default App;
