import { useState, useRef } from "react";
import useRealTimeCanvas from "./useRealTimeCanvas";

interface Point {
  x: number;
  y: number;
}

export interface LineProps {
  points: number[];
  stroke: string;
  strokeWidth: number;
  tension: number;
  lineCap: "round" | "butt" | "square";
  linejoin: string;
  globalCompositeOperation: string;
}

type Tool = "pen" | "eraser";

interface UseCanvasProps {
  canvasId?: string;
  strapiBaseUrl?: string;
}

const useCanvas = (props?: UseCanvasProps) => {
  const canvasId = props?.canvasId || "global-canvas";
  const strapiBaseUrl = props?.strapiBaseUrl || "http://localhost:1337";

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const currentLineIndexRef = useRef<number | null>(null);

  const {
    lines,
    participantCount,
    participantId,
    isConnected,
    drawLine,
    updateLine,
    clearCanvas: clearCanvasServer
  } = useRealTimeCanvas({ canvasId, strapiBaseUrl });

  const startDrawing = (point: Point) => {
    if (!isConnected) return;
    
    setIsDrawing(true);

    const newLine: LineProps = {
      points: [point.x, point.y],
      stroke: tool === "eraser" ? "#FFFFFF" : color,
      strokeWidth,
      tension: 0.5,
      lineCap: "round",
      linejoin: "round",
      globalCompositeOperation: tool === "eraser" ? "destination-out" : "source-over",
    };

      // Add line locally first for responsive UI
        const newLineIndex = lines.length;
        currentLineIndexRef.current = newLineIndex;

    // Send the new line to the server
    drawLine(newLine);
    // currentLineIndexRef.current = lines.length;
  };

  const draw = (point: Point) => {
    if (!isDrawing || !isConnected || currentLineIndexRef.current === null) return;
    
  // Create updated points array including the new point
  const updatedPoints = [
    ...lines[currentLineIndexRef.current]?.points || [],
    point.x,
    point.y
  ];
  
  // Send the update to the server
  updateLine(currentLineIndexRef.current, updatedPoints);

    // // For local points update (faster response)
    // if (currentLineIndexRef.current !== null && currentLineIndexRef.current < lines.length) {
    //   // Create updated points array including the new point
    //   const updatedPoints = [
    //     ...lines[currentLineIndexRef.current].points,
    //     point.x,
    //     point.y
    //   ];

    //   // Send the update to the server
    //   updateLine(currentLineIndexRef.current, updatedPoints);
    // }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    currentLineIndexRef.current = null;
  };

  const clearCanvas = () => {
    clearCanvasServer();
  };

  const changeTool = (newTool: Tool) => {
    setTool(newTool);
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    if (tool === "eraser") {
      setTool("pen");
    }
  };

  const changeStrokeWidth = (width: number) => {
    setStrokeWidth(width);
  };

  return {
    lines,
    isDrawing,
    tool,
    color,
    strokeWidth,
    participantCount,
    participantId,
    isConnected,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    changeTool,
    changeColor,
    changeStrokeWidth,
  };
};

export default useCanvas;