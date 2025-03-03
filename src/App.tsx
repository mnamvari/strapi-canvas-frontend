import { Refine } from "@refinedev/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CanvasPage from "./pages/CanvasPage";


const App = () => {
    return (
      <Router>
      <Refine>
      <div className="p-6 h-screen bg-gray-50">
        <h1 className="text-xl font-bold mb-4">Real-Time Canvas App</h1>
          <Routes>
              {/* Default route for the Canvas */}
              <Route path="/" element={<CanvasPage />} />
          </Routes>
      </div>
    </Refine>
    </Router>

  );
};

export default App;
