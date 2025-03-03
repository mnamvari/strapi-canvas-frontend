// src/pages/TestPage.tsx

import React from "react";

const TestPage: React.FC = () => {
    const handleClick = () => {
        alert("Button clicked!");
    };

    return (
        <div>
            <h1>Test Page</h1>
            <p>This is a simple test page in TSX for your Refine project.</p>
            <button onClick={handleClick}>Click Me</button>
        </div>
    );
};

export default TestPage;
