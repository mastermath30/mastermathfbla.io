"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  Trash2,
  Download,
  Undo,
  Redo,
  Minus,
  Plus,
  X,
  Palette,
  MousePointer,
  Move,
  PenTool,
  Users,
  Share2,
  Save,
  FolderOpen,
  Grid3X3,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: "path" | "rectangle" | "circle" | "text" | "line";
  points?: Point[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: boolean;
}

interface SavedBoard {
  id: string;
  name: string;
  elements: DrawingElement[];
  timestamp: Date;
}

const COLORS = [
  "#000000", // Black
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#FFFFFF", // White
];

const TOOLS = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "pen", icon: PenTool, label: "Pen" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "text", icon: Type, label: "Text" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export function InteractiveWhiteboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved boards
  useEffect(() => {
    const saved = localStorage.getItem("mm_whiteboard_boards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedBoards(parsed.map((b: SavedBoard) => ({
          ...b,
          timestamp: new Date(b.timestamp)
        })));
      } catch (e) {
        console.error("Failed to load boards:", e);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        if (textPosition) {
          setTextPosition(null);
          setTextInput("");
        } else {
          setIsOpen(false);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, textPosition]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (element.type) {
        case "path":
          if (element.points && element.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach((point) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case "line":
          if (element.startX !== undefined && element.startY !== undefined && 
              element.endX !== undefined && element.endY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(element.startX, element.startY);
            ctx.lineTo(element.endX, element.endY);
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (element.startX !== undefined && element.startY !== undefined && 
              element.width !== undefined && element.height !== undefined) {
            if (element.fill) {
              ctx.fillRect(element.startX, element.startY, element.width, element.height);
            } else {
              ctx.strokeRect(element.startX, element.startY, element.width, element.height);
            }
          }
          break;
        case "circle":
          if (element.startX !== undefined && element.startY !== undefined && element.radius !== undefined) {
            ctx.beginPath();
            ctx.arc(element.startX, element.startY, element.radius, 0, 2 * Math.PI);
            if (element.fill) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
          break;
        case "text":
          if (element.text && element.startX !== undefined && element.startY !== undefined) {
            ctx.font = `${element.strokeWidth * 6}px Inter, sans-serif`;
            ctx.fillText(element.text, element.startX, element.startY);
          }
          break;
      }
    });

    // Draw current element being drawn
    if (currentElement) {
      ctx.strokeStyle = currentElement.color;
      ctx.fillStyle = currentElement.color;
      ctx.lineWidth = currentElement.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (currentElement.type) {
        case "path":
          if (currentElement.points && currentElement.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentElement.points[0].x, currentElement.points[0].y);
            currentElement.points.forEach((point) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case "line":
          if (currentElement.startX !== undefined && currentElement.startY !== undefined && 
              currentElement.endX !== undefined && currentElement.endY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(currentElement.startX, currentElement.startY);
            ctx.lineTo(currentElement.endX, currentElement.endY);
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (currentElement.startX !== undefined && currentElement.startY !== undefined && 
              currentElement.width !== undefined && currentElement.height !== undefined) {
            ctx.strokeRect(currentElement.startX, currentElement.startY, currentElement.width, currentElement.height);
          }
          break;
        case "circle":
          if (currentElement.startX !== undefined && currentElement.startY !== undefined && currentElement.radius !== undefined) {
            ctx.beginPath();
            ctx.arc(currentElement.startX, currentElement.startY, currentElement.radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
      }
    }
  }, [elements, currentElement, showGrid]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (canvas && container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          redrawCanvas();
        }
      }, 100);
    }
  }, [isOpen, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (currentTool === "text") {
      setTextPosition(pos);
      return;
    }

    setIsDrawing(true);

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: currentTool === "pen" || currentTool === "eraser" ? "path" : 
            currentTool === "line" ? "line" :
            currentTool === "rectangle" ? "rectangle" : "circle",
      color: currentTool === "eraser" ? "#FFFFFF" : currentColor,
      strokeWidth: currentTool === "eraser" ? strokeWidth * 3 : strokeWidth,
      points: currentTool === "pen" || currentTool === "eraser" ? [pos] : undefined,
      startX: pos.x,
      startY: pos.y,
      endX: pos.x,
      endY: pos.y,
      width: 0,
      height: 0,
      radius: 0,
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;
    
    const pos = getMousePos(e);

    if (currentElement.type === "path") {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), pos],
      });
    } else if (currentElement.type === "line") {
      setCurrentElement({
        ...currentElement,
        endX: pos.x,
        endY: pos.y,
      });
    } else if (currentElement.type === "rectangle") {
      setCurrentElement({
        ...currentElement,
        width: pos.x - (currentElement.startX || 0),
        height: pos.y - (currentElement.startY || 0),
      });
    } else if (currentElement.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(pos.x - (currentElement.startX || 0), 2) +
        Math.pow(pos.y - (currentElement.startY || 0), 2)
      );
      setCurrentElement({
        ...currentElement,
        radius,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    
    setIsDrawing(false);
    const newElements = [...elements, currentElement];
    setElements(newElements);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setCurrentElement(null);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || !textPosition) return;

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: "text",
      text: textInput,
      startX: textPosition.x,
      startY: textPosition.y,
      color: currentColor,
      strokeWidth,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setTextInput("");
    setTextPosition(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const saveBoard = () => {
    if (!boardName.trim()) return;

    const newBoard: SavedBoard = {
      id: Date.now().toString(),
      name: boardName,
      elements: [...elements],
      timestamp: new Date(),
    };

    const updatedBoards = [newBoard, ...savedBoards.slice(0, 9)];
    setSavedBoards(updatedBoards);
    localStorage.setItem("mm_whiteboard_boards", JSON.stringify(updatedBoards));
    
    setBoardName("");
    setShowSaveModal(false);
  };

  const loadBoard = (board: SavedBoard) => {
    setElements(board.elements);
    setHistory([[...board.elements]]);
    setHistoryIndex(0);
    setShowLoadModal(false);
  };

  const deleteBoard = (id: string) => {
    const updatedBoards = savedBoards.filter(b => b.id !== id);
    setSavedBoards(updatedBoards);
    localStorage.setItem("mm_whiteboard_boards", JSON.stringify(updatedBoards));
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-[156px] z-[88] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 touch-manipulation"
        aria-label="Open Interactive Whiteboard"
        title="Interactive Whiteboard (Alt+W)"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Pencil className="w-6 h-6 text-white" />
      </motion.button>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-[300] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Interactive Whiteboard</h2>
                  <p className="text-xs text-slate-500">Collaborate and draw together</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Grid Toggle */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-colors ${showGrid ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}
                  title="Toggle Grid"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>

                {/* Undo/Redo */}
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />

                {/* Save/Load */}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Save Board"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Load Board"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>

                {/* Download */}
                <button
                  onClick={downloadCanvas}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Download as PNG"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Clear */}
                <button
                  onClick={clearCanvas}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
              {/* Toolbar */}
              <div className="w-16 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-2">
                {/* Tools */}
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    className={`p-3 rounded-xl transition-all ${
                      currentTool === tool.id
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    title={tool.label}
                  >
                    <tool.icon className="w-5 h-5" />
                  </button>
                ))}

                <div className="flex-1" />

                {/* Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                    title="Color"
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: currentColor }}
                    />
                  </button>

                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute left-16 bottom-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 grid grid-cols-3 gap-1"
                      >
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setCurrentColor(color);
                              setShowColorPicker(false);
                            }}
                            className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                              currentColor === color ? "border-emerald-500 ring-2 ring-emerald-500" : "border-slate-200 dark:border-slate-600"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stroke Width */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setStrokeWidth(Math.min(strokeWidth + 1, 20))}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{strokeWidth}</div>
                  <button
                    onClick={() => setStrokeWidth(Math.max(strokeWidth - 1, 1))}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div ref={containerRef} className="flex-1 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />

                {/* Text Input Overlay */}
                {textPosition && (
                  <div
                    className="absolute"
                    style={{ left: textPosition.x, top: textPosition.y }}
                  >
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTextSubmit();
                        if (e.key === "Escape") {
                          setTextPosition(null);
                          setTextInput("");
                        }
                      }}
                      autoFocus
                      className="px-2 py-1 border-2 border-emerald-500 rounded-lg bg-white text-slate-900 text-sm focus:outline-none"
                      placeholder="Type text..."
                      style={{ color: currentColor }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Modal */}
            <AnimatePresence>
              {showSaveModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
                  onClick={() => setShowSaveModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-80 shadow-2xl"
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Save Board</h3>
                    <input
                      type="text"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      placeholder="Enter board name..."
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveBoard}
                        disabled={!boardName.trim()}
                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load Modal */}
            <AnimatePresence>
              {showLoadModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
                  onClick={() => setShowLoadModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-96 max-h-96 shadow-2xl"
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Load Board</h3>
                    {savedBoards.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No saved boards</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {savedBoards.map((board) => (
                          <div
                            key={board.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700"
                          >
                            <button
                              onClick={() => loadBoard(board)}
                              className="flex-1 text-left"
                            >
                              <p className="font-medium text-slate-900 dark:text-white">{board.name}</p>
                              <p className="text-xs text-slate-500">{board.elements.length} elements</p>
                            </button>
                            <button
                              onClick={() => deleteBoard(board.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setShowLoadModal(false)}
                      className="w-full mt-4 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
