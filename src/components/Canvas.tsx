import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Rect, Circle, Arrow, Text } from "react-konva";
import useCanvas, {ShapeProps} from "../hooks/useCanvas";
import ParticipantDisplay from "./ParticipantDisplay";
import {
    FaPencilAlt,
    FaEraser,
    FaSquare,
    FaCircle,
    FaLongArrowAltRight,
    FaFont,
    FaDownload,
    FaTrash
} from "react-icons/fa";

const MAX_PARTICIPANTS = 4;

const Canvas: React.FC = () => {
    const {
        shapes,
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
        textValue,
        setTextValue,
        textSize,
        setTextSize,
        textFont,
        setTextFont,
        textWeight,
        setTextWeight,
    } = useCanvas();

    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: window.innerHeight });
    const [reconnecting, setReconnecting] = useState(false);
    const [reconnectTimer, setReconnectTimer] = useState(30);
    const [showTextControls, setShowTextControls] = useState(false);

    // Handle resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const toolbarHeight = tool === "text" ? 210 : 165; // Extra height for text controls
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

    // Toggle text controls visible when text tool selected
    useEffect(() => {
        setShowTextControls(tool === "text");
    }, [tool]);

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

    const fontFamilies = [
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Courier New",
        "Verdana",
        "Georgia"
    ];

    const fontWeights = [
        "normal",
        "bold",
        "italic",
        "bold italic"
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

    const downloadImage = () => {
        if (!stageRef.current) return;
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `canvas-drawing-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // Render the appropriate shape based on type
    const renderShape = (shape: ShapeProps, i: number) => {
        switch (shape.type) {
            case "pen":
            case "eraser":
                return (
                    <Line
                        key={shape.id || i}
                        points={shape.points}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        tension={shape.tension}
                        lineCap={shape.lineCap}
                        globalCompositeOperation={
                            shape.stroke === "#ffffff" ? "destination-out" : "source-over"
                        }
                    />
                );
            case "rectangle":
                return (
                    <Rect
                        key={shape.id || i}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        dash={shape.dash}
                    />
                );
            case "circle":
                return (
                    <Circle
                        key={shape.id || i}
                        x={shape.x}
                        y={shape.y}
                        radius={shape.radius}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case "arrow":
                return (
                    <Arrow
                        key={shape.id || i}
                        points={shape.points || []}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        pointerLength={10}
                        pointerWidth={10}
                    />
                );
            case "text":
                return (
                    <Text
                        key={shape.id || i}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={shape.fontSize}
                        fontFamily={shape.fontFamily}
                        fontStyle={shape.fontStyle}
                        fill={shape.stroke}
                    />
                );
            default:
                return null;
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
                        title="Pen"
                    >
                        <FaPencilAlt size={20} />
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "eraser" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("eraser")}
                        disabled={!isConnected}
                        title="Eraser"
                    >
                        <FaEraser size={20} />
                    </button>
                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "rectangle" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("rectangle")}
                        disabled={!isConnected}
                        title="Rectangle"
                    >
                        <FaSquare size={20} />
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "circle" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("circle")}
                        disabled={!isConnected}
                        title="Circle"
                    >
                        <FaCircle size={20} />
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "arrow" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("arrow")}
                        disabled={!isConnected}
                        title="Arrow"
                    >
                        <FaLongArrowAltRight size={20} />
                    </button>

                    <button
                        className={`px-2 py-1 text-sm md:text-base md:px-3 rounded ${tool === "text" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => changeTool("text")}
                        disabled={!isConnected}
                        title="Text"
                    >
                        <FaFont size={20} />
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
                <div className="border-l border-gray-300 h-8 mx-1 hidden md:block" />

                <button
                    className="px-2 py-1 text-sm md:text-base md:px-3 rounded bg-green-500 text-white flex items-center gap-1"
                    onClick={downloadImage}
                    disabled={!isConnected}
                    title="Download as PNG"
                >
                    <FaDownload size={16} />
                    <span className="hidden md:inline">PNG</span>
                </button>

                <button
                    className="px-2 py-1 text-sm md:text-base md:px-3 rounded bg-red-500 text-white flex items-center gap-1"
                    onClick={clearCanvas}
                    disabled={!isConnected}
                    title="Clear Canvas"
                >
                    <FaTrash size={16} />
                    <span className="hidden md:inline">Clear</span>
                </button>
            </div>

            {/* Text Controls */}
            {showTextControls && (
                <div className="bg-gray-100 p-4 border-t border-gray-300">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="text-input" className="text-sm font-medium">Text:</label>
                            <input
                                id="text-input"
                                type="text"
                                className="border border-gray-300 rounded px-2 py-1 w-40 md:w-60"
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                placeholder="Enter text here"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="font-size" className="text-sm font-medium">Size:</label>
                            <input
                                id="font-size"
                                type="number"
                                min="8"
                                max="72"
                                className="border border-gray-300 rounded px-2 py-1 w-16"
                                value={textSize}
                                onChange={(e) => setTextSize(Number(e.target.value))}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="font-family" className="text-sm font-medium">Font:</label>
                            <select
                                id="font-family"
                                className="border border-gray-300 rounded px-2 py-1"
                                value={textFont}
                                onChange={(e) => setTextFont(e.target.value)}
                            >
                                {fontFamilies.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="font-weight" className="text-sm font-medium">Style:</label>
                            <select
                                id="font-weight"
                                className="border border-gray-300 rounded px-2 py-1"
                                value={textWeight}
                                onChange={(e) => setTextWeight(e.target.value)}
                            >
                                {fontWeights.map(weight => (
                                    <option key={weight} value={weight}>{weight}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

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
                        {shapes
                            .sort((a, b) => a.zIndex - b.zIndex)
                            .map((shape, i) => renderShape(shape, i))}
                    </Layer>
                </Stage>)}
            </div>
        </div>
    );
};

export default Canvas;
