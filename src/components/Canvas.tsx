import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import useCanvas from "../hooks/useCanvas";
import ParticipantDisplay from "./ParticipantDisplay";

const MAX_PARTICIPANTS = 4;

const Canvas: React.FC = () => {
    const {
        lines,
        tool,
        color,
        strokeWidth,
        participantCount,
        participantId,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        changeTool,
        changeColor,
        changeStrokeWidth,
    } = useCanvas();

//    const { participantCount, participantId } = useCanvasContext();

    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 120 });

    // Handle resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

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
        console.log("handleMouseDown");
        const pos = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
        startDrawing(pos);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const point = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
        draw(point);
    };

    return (
        <div className="flex flex-col h-screen">
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
                        />
                    ))}
                </div>

                <div className="hidden md:block border-l border-gray-300 h-8 mx-1" />

                <div className="flex gap-1">
                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "pen" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("pen")}
                    >
                        Pen
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "eraser" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("eraser")}
                    >
                        Eraser
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
                >
                    Clear
                </button>
            </div>

            {/* Canvas1 */}
            <div className="flex-grow bg-white" ref={containerRef}>
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={stopDrawing}
                    // onTouchStart={handleMouseDown}
                    // onTouchMove={handleMouseMove}
                    onTouchEnd={stopDrawing}
                    ref={stageRef}
                    className="border border-gray-200"
                >
                    <Layer>
                        {lines.map((line, i) => (
                            <Line
                                key={i}
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
                </Stage>
            </div>

            {/* Status bar */}
            <div className="bg-gray-100 p-2 flex items-center text-sm text-gray-600">
                <div>
                    Participant ID: {participantId}
                </div>
                <div className="flex-grow" />
                <div>
                    {participantCount < MAX_PARTICIPANTS ?
                        `${MAX_PARTICIPANTS - participantCount} more participants can join` :
                        "Maximum participants reached"}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
