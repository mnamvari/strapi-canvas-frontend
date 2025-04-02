import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line } from "react-konva";
import useCanvas from "../hooks/useCanvas";
import ParticipantDisplay from "./ParticipantDisplay";
import { FaPencilAlt, FaEraser } from "react-icons/fa";

const MAX_PARTICIPANTS = 4;

const Canvas: React.FC = () => {
    const {
        lines,
        tool,
        color,
        strokeWidth,
        participantCount,
        isConnected,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        changeTool,
        changeColor,
        changeStrokeWidth,
    } = useCanvas();

    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: window.innerHeight });
    const [reconnecting, setReconnecting] = useState(false);
    const [reconnectTimer, setReconnectTimer] = useState(30);

    // Handle resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const toolbarHeight = 165; // Approximate height of toolbar
                const availableHeight = window.innerHeight - toolbarHeight;

                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: availableHeight,
                });
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    // Handle connection status changes
    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        
        if (!isConnected && !reconnecting) {
            setReconnecting(true);
            setReconnectTimer(30);
            
            intervalId = setInterval(() => {
                setReconnectTimer(prev => {
                    if (prev <= 1) {
                        if (intervalId) clearInterval(intervalId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        if (isConnected && reconnecting) {
            setReconnecting(false);
            if (intervalId) clearInterval(intervalId);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isConnected, reconnecting]);    

    const colors = [
        "#000000", // Black
        "#FF0000", // Red
        "#00FF00", // Green
        "#0000FF", // Blue
        "#FFFF00", // Yellow
        "#FF00FF", // Magenta
        "#00FFFF", // Cyan
        "#FFA500", // Orange
        "#800080", // Purple
        "#008000", // Dark Green
    ];

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isConnected) return;
        const pos = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
        startDrawing(pos);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isConnected) return;
        const point = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
        draw(point);
    };

    const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
        if (!isConnected) return;
        e.evt.preventDefault(); // Prevent scrolling
        const touch = e.evt.touches[0];
        const stage = e.target.getStage();
        if (stage) {
            const pos = stage.pointerPos || { x: 0, y: 0 };
            startDrawing(pos);
        }
    };

    const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
        if (!isConnected) return;
        e.evt.preventDefault(); // Prevent scrolling
        const touch = e.evt.touches[0];
        const stage = e.target.getStage();
        if (stage) {
            const pos = stage.pointerPos || { x: 0, y: 0 };
            draw(pos);
        }
    };


    return (
        <div className="flex flex-col">
            {/* Toolbar */}
            <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-2 md:gap-4">
                <div className="flex flex-wrap gap-1 md:gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => changeColor(c)}
                            aria-label={`Color ${c}`}
                            disabled={!isConnected}
                        />
                    ))}
                </div>

                <div className="hidden md:block border-l border-gray-300 h-8 mx-1" />

                <div className="flex gap-1">
                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "pen" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("pen")}
                        disabled={!isConnected}
                    >
                    <FaPencilAlt size={20} />
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "eraser" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("eraser")}
                        disabled={!isConnected}
                    >
                    <FaEraser size={20} />
                    </button>
                </div>

                <div className="hidden md:block border-l border-gray-300 h-8 mx-1" />

                <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-sm text-gray-600">Size:</span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => changeStrokeWidth(parseInt(e.target.value))}
                        className="w-16 md:w-24"
                        disabled={!isConnected}
                    />
                    <span className="text-xs md:text-sm w-4 md:w-6">{strokeWidth}</span>
                </div>

                <div className="flex-grow" />

                <ParticipantDisplay
                    participantCount={participantCount}
                    maxParticipants={MAX_PARTICIPANTS}
                />

                <button
                    className="px-2 py-1 text-sm md:text-base md:px-3 rounded bg-red-500 text-white"
                    onClick={clearCanvas}
                    disabled={!isConnected}
                >
                    Clear
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-grow bg-white relative" ref={containerRef}>
                {/* Disconnection Overlay */}
                {!isConnected && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 text-white">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl mb-3">Disconnected from server</h3>
                            {reconnectTimer > 0 ? (
                                <p>Attempting to reconnect... ({reconnectTimer}s)</p>
                            ) : (
                                <div className="space-y-3">
                                    <p>Connection timed out.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                                    >
                                        Reload Page
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {stageSize.width > 0 && stageSize.height > 0 && (
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={stopDrawing}
                    // onTouchStart={handleTouchStart}
                    // onTouchMove={handleTouchMove}
                    onTouchEnd={stopDrawing}
                    ref={stageRef}
                    className="border border-gray-200"
                >
                    <Layer>
                    {[...lines]
                        .sort((a, b) => a.zIndex - b.zIndex)
                        .map((line, i) => (
                            <Line
                                key={line.id || i}
                                points={line.points}
                                stroke={line.stroke}
                                strokeWidth={line.strokeWidth}
                                tension={line.tension}
                                lineCap={line.lineCap}
                                // lineJoin={line.linejoin}
                                globalCompositeOperation={
                                    line.stroke === "#ffffff" ? "destination-out" : "source-over"
                                }
                            />
                        ))}
                    </Layer>
                </Stage>)}
            </div>
        </div>
    );
};

export default Canvas;
