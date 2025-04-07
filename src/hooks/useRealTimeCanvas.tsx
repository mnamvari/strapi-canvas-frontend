import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ShapeProps } from "./useCanvas";
import {TOKEN_KEY} from "../constants";

interface UseRealTimeCanvasProps {
  canvasId: string;
  strapiBaseUrl: string;
}

interface CanvasState {
  shapes: ShapeProps[];
  participantCount: number;
}

interface Participant {
  id: string;
  email: string;
  isOwner: boolean;
}


const useRealTimeCanvas = ({ canvasId, strapiBaseUrl }: UseRealTimeCanvasProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [shapes, setShapes] = useState<ShapeProps[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [participantId, setParticipantId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [canvasOwner, setCanvasOwner] = useState<string | null>(null);


  // Initialize socket connection
  useEffect(() => {
    console.log(`Connecting to ${strapiBaseUrl}`);
    const token = localStorage.getItem(TOKEN_KEY);

    const socketInstance = io(`${strapiBaseUrl}`, {
      transports: ["websocket"],
      reconnection: true,
      auth: { token }
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

    socketInstance.on("participants-updated", (data: {
      participants: { id: string; email: string; isOwner: boolean }[],
      owner: string | null
    }) => {
      setParticipants(data.participants);
      setCanvasOwner(data.owner);
    });

    socketInstance.on("canvas-state", (state: CanvasState & {
      participants: Participant[],
      owner: string | null
    }) => {
      console.log("Received canvas state:", state);
      setShapes(state.shapes);
      setParticipantCount(state.participantCount);
      setParticipants(state.participants || []);
      setCanvasOwner(state.owner);
    });

    socketInstance.on("participants-updated", (data: {
      participants: Participant[],
      owner: string | null
    }) => {
      console.log("Participants updated:", data);
      setParticipants(data.participants);
      setCanvasOwner(data.owner);
    });

    socketInstance.on("participant-count", (count: number) => {
      console.log("Participant count:", count);
      setParticipantCount(count);
    });

    socketInstance.on("shape-added", (shape: ShapeProps) => {
      console.log("Shape added:", shape);
      setShapes(prevShapes => [...prevShapes, shape]);
    });

    socketInstance.on("shape-updated", ({ shapeId, updatedShape }: { shapeId: string; updatedShape: ShapeProps }) => {
      console.log("Shape updated:", shapeId, updatedShape);
      setShapes(prevShapes => {
        const newShapes = [...prevShapes];
        const shapeIndex = newShapes.findIndex(s => s.id === shapeId);
        if (newShapes[shapeIndex]) {
          newShapes[shapeIndex] = updatedShape;
        }
        return newShapes;
      });
    });


    socketInstance.on('shape-z-index-assigned', ({ shapeId, zIndex }) => {
      console.log("z-index assigned:", zIndex);
      setShapes(prevShapes =>
          prevShapes.map(shape =>
              shape.id === shapeId ? { ...shape, zIndex } : shape
        )
      );
    });

    socketInstance.on("canvas-cleared", () => {
      console.log("Canvas cleared");
      setShapes([]);
    });

    return () => {
      console.log("Disconnecting socket");
      socketInstance.disconnect();
    };
  }, [canvasId, strapiBaseUrl]);

  // Send drawing events to the server
  const drawShape = useCallback(
      (shape: ShapeProps) => {
        if (socket && isConnected) {
          setShapes(prevShapes => [...prevShapes, shape]);

          console.log("Sending draw-shape event to server:", shape);
          socket.emit("draw-shape", { canvasId, shape });
        }
      },
      [socket, isConnected, canvasId]
  );

  // Update an existing shape
  const updateShape = useCallback(
      (shapeId: string, updatedShape: ShapeProps) => {
        if (socket && isConnected) {
          setShapes(prevShapes => {
            const shapeIndex = prevShapes.findIndex(s => s.id === shapeId);
            if (shapeIndex !== -1) {
              const newShapes = [...prevShapes];
              if (newShapes[shapeIndex]) {
                newShapes[shapeIndex] = updatedShape;
              }
              return newShapes;
            }
            return prevShapes;
          });

          console.log("Sending update-shape event:", shapeId, updatedShape);
          socket.emit("update-shape", { canvasId, shapeId, updatedShape });
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
    shapes,
    participantCount,
    participantId,
    isConnected,
    drawShape,
    updateShape,
    clearCanvas,
    participants,
    canvasOwner,
  };
};

export default useRealTimeCanvas;
