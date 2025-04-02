import { useState, useRef } from "react";
import useRealTimeCanvas from "./useRealTimeCanvas";
import {BACKEND_STRAPI_BASE_URL} from "../constants";
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

export interface LineProps {
  id: string;
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

const generateGuid = (): string => {
  return uuidv4();
};

const useCanvas = (props?: UseCanvasProps) => {
  const canvasId = props?.canvasId || "global-canvas";
  const strapiBaseUrl = props?.strapiBaseUrl || BACKEND_STRAPI_BASE_URL;

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const currentLineIdRef = useRef<string | null>(null);

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

    const lineId = generateGuid();
    currentLineIdRef.current = lineId;

    const newLine: LineProps = {
      id: lineId,
      points: [point.x, point.y],
      stroke: tool === "eraser" ? "#FFFFFF" : color,
      strokeWidth,
      tension: 0.5,
      lineCap: "round",
      linejoin: "round",
      globalCompositeOperation: tool === "eraser" ? "destination-out" : "source-over",
    };

    // Send the new line to the server
    drawLine(newLine);
  };

  const draw = (point: Point) => {
    if (!isDrawing || !isConnected || currentLineIdRef.current === null) return;

    const lineIndex = lines.findIndex(line => line.id === currentLineIdRef.current);
    if (lineIndex === -1) return;

  // Create updated points array including the new point
  const updatedPoints = [
    ...lines[lineIndex].points,
    point.x,
    point.y
  ];

  // Send the update to the server
    updateLine(currentLineIdRef.current, updatedPoints);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    currentLineIdRef.current = null;
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
