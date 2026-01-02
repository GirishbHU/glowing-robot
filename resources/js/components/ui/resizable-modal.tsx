import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, GripVertical } from "lucide-react";

interface ResizableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function ResizableModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  defaultWidth = 450,
  defaultHeight = 500,
  minWidth = 320,
  minHeight = 300,
  maxWidth = 900,
  maxHeight = 800,
}: ResizableModalProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
    }
  }, [isOpen]);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;

      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;

      if (direction.includes("e")) {
        newWidth = Math.min(maxWidth, Math.max(minWidth, resizeRef.current.startWidth + deltaX * 2));
      }
      if (direction.includes("w")) {
        newWidth = Math.min(maxWidth, Math.max(minWidth, resizeRef.current.startWidth - deltaX * 2));
      }
      if (direction.includes("s")) {
        newHeight = Math.min(maxHeight, Math.max(minHeight, resizeRef.current.startHeight + deltaY * 2));
      }
      if (direction.includes("n")) {
        newHeight = Math.min(maxHeight, Math.max(minHeight, resizeRef.current.startHeight - deltaY * 2));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const modalWidth = isMaximized ? "95vw" : `${size.width}px`;
  const modalHeight = isMaximized ? "90vh" : `${size.height}px`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]"
            style={{
              width: modalWidth,
              height: modalHeight,
              maxWidth: "95vw",
              maxHeight: "90vh",
            }}
          >
            <div className="relative h-full bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/20 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleMaximize}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title={isMaximized ? "Restore" : "Maximize"}
                  >
                    {isMaximized ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>

              {/* Resize handles - only show when not maximized */}
              {!isMaximized && (
                <>
                  {/* Right edge */}
                  <div
                    className="absolute right-0 top-12 bottom-4 w-2 cursor-e-resize hover:bg-violet-500/20 transition-colors group"
                    onMouseDown={(e) => handleResizeStart(e, "e")}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>

                  {/* Bottom edge */}
                  <div
                    className="absolute bottom-0 left-12 right-12 h-2 cursor-s-resize hover:bg-violet-500/20 transition-colors"
                    onMouseDown={(e) => handleResizeStart(e, "s")}
                  />

                  {/* Left edge */}
                  <div
                    className="absolute left-0 top-12 bottom-4 w-2 cursor-w-resize hover:bg-violet-500/20 transition-colors"
                    onMouseDown={(e) => handleResizeStart(e, "w")}
                  />

                  {/* Bottom-right corner */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-violet-500/30 transition-colors rounded-bl-lg"
                    onMouseDown={(e) => handleResizeStart(e, "se")}
                  >
                    <svg
                      className="absolute bottom-1 right-1 h-2 w-2 text-slate-500"
                      viewBox="0 0 6 6"
                      fill="currentColor"
                    >
                      <circle cx="5" cy="5" r="1" />
                      <circle cx="5" cy="2" r="1" />
                      <circle cx="2" cy="5" r="1" />
                    </svg>
                  </div>

                  {/* Bottom-left corner */}
                  <div
                    className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-violet-500/30 transition-colors rounded-br-lg"
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                  />
                </>
              )}

              {/* Resize indicator */}
              {isResizing && (
                <div className="absolute inset-0 bg-violet-500/5 pointer-events-none rounded-2xl border-2 border-violet-500/50" />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
