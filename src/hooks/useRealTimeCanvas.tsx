import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { LineProps } from "./useCanvas";

interface UseRealTimeCanvasProps {
  canvasId: string;
  strapiBaseUrl: string;
}

interface CanvasState {
  lines: LineProps[];
  participantCount: number;
}

const useRealTimeCanvas = ({ canvasId, strapiBaseUrl }: UseRealTimeCanvasProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lines, setLines] = useState<LineProps[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [participantId, setParticipantId] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    console.log(`Connecting to ${strapiBaseUrl}`);
    const socketInstance = io(`${strapiBaseUrl}`, {
      transports: ["websocket"],
      reconnection: true
    });

    setSocket(socketInstance);
    
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      setParticipantId(socketInstance.id || `user-${Math.floor(Math.random() * 1000)}`);
      
      // Join the canvas room
      socketInstance.emit("join-canvas", canvasId);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("canvas-state", (state: CanvasState) => {
      console.log("Received canvas state:", state);
      setLines(state.lines);
      setParticipantCount(state.participantCount);
    });

    socketInstance.on("participant-count", (count: number) => {
      console.log("Participant count:", count);
      setParticipantCount(count);
    });

    socketInstance.on("line-added", (line: LineProps) => {
      console.log("Line added from server:", line);
      setLines(prevLines => [...prevLines, line]);
    });

    socketInstance.on("line-updated", ({ lineId, points }: { lineId: string; points: number[] }) => {
      console.log("Line updated:", lineId, points);
      setLines(prevLines => {
        const lineIndex = prevLines.findIndex(line => line.id === lineId);
        if (lineIndex !== -1) {
          const newLines = [...prevLines];
          newLines[lineIndex] = { ...newLines[lineIndex], points };
          return newLines;
        }
        return prevLines;
       });
    });

    socketInstance.on("canvas-cleared", () => {
      console.log("Canvas cleared");
      setLines([]);
    });

    return () => {
      console.log("Disconnecting socket");
      socketInstance.disconnect();
    };
  }, [canvasId, strapiBaseUrl]);

  // Send drawing events to the server
  const drawLine = useCallback(
    (line: LineProps) => {
      if (socket && isConnected) {
        console.log("Sending draw event to server:", line);
        socket.emit("draw", { canvasId, line });

        setLines(prevLines => [...prevLines, line]);
      }
    },
    [socket, isConnected, canvasId]
  );

  // Update an existing line
  const updateLine = useCallback(
    (lineId: string, points: number[]) => {
      if (socket && isConnected) {
        setLines(prevLines => {
          const lineIndex = prevLines.findIndex(line => line.id === lineId);
          if (lineIndex !== -1) {
            const newLines = [...prevLines];
            newLines[lineIndex] = { ...newLines[lineIndex], points };
            return newLines;
          }
          return prevLines;
        });    
        console.log("Sending update-line event:", lineId, points);
        socket.emit("update-line", { canvasId, lineId, points });
      }
    },
    [socket, isConnected, canvasId]
  );

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    if (socket && isConnected) {
      console.log("Sending clear-canvas event");
      socket.emit("clear-canvas", canvasId);
    }
  }, [socket, isConnected, canvasId]);

  return {
    lines,
    participantCount,
    participantId,
    isConnected,
    drawLine,
    updateLine,
    clearCanvas,
  };
};

export default useRealTimeCanvas;