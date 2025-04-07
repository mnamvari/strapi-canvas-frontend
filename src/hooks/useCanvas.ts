import { useState, useRef } from "react";
import useRealTimeCanvas from "./useRealTimeCanvas";
import {BACKEND_STRAPI_BASE_URL} from "../constants";
import { v4 as uuidv4 } from 'uuid';

interface Point {
  x: number;
  y: number;
}

export type Tool = "pen" | "eraser" | "rectangle" | "circle" | "arrow" | "text";

export interface ShapeProps {
  id: string;
  type: Tool;
  zIndex: number;
  stroke: string;
  strokeWidth: number;
  tension?: number;
  lineCap?: "round" | "butt" | "square";
  linejoin?: string;
  globalCompositeOperation?: string;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  dash?: number[];
}

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
  const currentShapeIdRef = useRef<string | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [textValue, setTextValue] = useState("Sample Text");
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState("Arial");
  const [textWeight, setTextWeight] = useState("normal");

  const {
    shapes,
    participantCount,
    participantId,
    isConnected,
    drawShape,
    updateShape,
    clearCanvas: clearCanvasServer,
    participants,
    canvasOwner,
    canvasSettings,
    accessRequest,
    accessPending,
    updateCanvasSettings,
    handleAccessApproval,
  } = useRealTimeCanvas({ canvasId, strapiBaseUrl });

  const startDrawing = (point: Point) => {
    if (!isConnected) return;

    setIsDrawing(true);

    setStartPoint(point);

    currentShapeIdRef.current = generateGuid();

    if (tool === "text") {
      // For text, we immediately create the text shape
      const newText: ShapeProps = {
        id: currentShapeIdRef.current,
        zIndex: 1,
        type: "text",
        stroke: color,
        strokeWidth,
        x: point.x,
        y: point.y,
        text: textValue,
        fontSize: textSize,
        fontFamily: textFont,
        fontStyle: textWeight
      };

      drawShape(newText);
      setIsDrawing(false);
      return;
    }

    const newShape: ShapeProps = {
      id: currentShapeIdRef.current,
      zIndex: 1,
      type: tool,
      stroke: tool === "eraser" ? "#FFFFFF" : color,
      strokeWidth,
      tension: 0.5,
      lineCap: "round",
      linejoin: "round",
      globalCompositeOperation: tool === "eraser" ? "destination-out" : "source-over",
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      points: tool === "pen" || tool === "eraser" || tool === "arrow" ? [point.x, point.y] : undefined,
    };

    // Send the new shape to the server
    drawShape(newShape);
  };

  const draw = (point: Point) => {
    if (!isDrawing || !isConnected || currentShapeIdRef.current === null  || !startPoint) return;

    const currentIndex = shapes.findIndex(s => s.id === currentShapeIdRef.current);
    if (currentIndex === -1) return;
    const shape = shapes[currentIndex];
    if (!shape) return;

    let updatedShape: ShapeProps;

    //Update based on the tool
    switch (tool) {
      case "pen":
      case "eraser": {
        // Add to points array
        if (!shape.points) shape.points = [];
        const updatedPoints = [...shape.points, point.x, point.y];
        updatedShape = {...shape, points: updatedPoints};
        break;
      }

      case "rectangle": {
        // Calculate width and height from start point
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        updatedShape = {...shape, width, height};
        break;
      }

      case "circle": {
        // Calculate radius from start point
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        updatedShape = {...shape, radius};
        break;
      }

      case "arrow": {
        // Update points for arrow (start and end)
        updatedShape = {...shape, points: [startPoint.x, startPoint.y, point.x, point.y]};
        break;
      }

      default:
        return;
    }
   // Send the update to the server
   updateShape(currentShapeIdRef.current, updatedShape);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    currentShapeIdRef.current = null;
    setStartPoint(null);
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
    shapes,
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
    textValue,
    setTextValue,
    textSize,
    setTextSize,
    textFont,
    setTextFont,
    textWeight,
    setTextWeight,
    participants,
    canvasOwner,
    canvasSettings,
    accessRequest,
    accessPending,
    updateCanvasSettings,
    handleAccessApproval,
  };
};

export default useCanvas;
