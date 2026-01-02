import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResizableDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const ResizableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResizableDialogContentProps
>(({ 
  className, 
  children, 
  defaultWidth = 600,
  defaultHeight = 500,
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1200,
  maxHeight = 900,
  ...props 
}, ref) => {
  const [size, setSize] = React.useState({ width: defaultWidth, height: defaultHeight });
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeRef = React.useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

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

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
  };

  const modalWidth = isMaximized ? "95vw" : `${size.width}px`;
  const modalHeight = isMaximized ? "90vh" : `${size.height}px`;

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl flex flex-col",
          className
        )}
        style={{
          width: modalWidth,
          height: modalHeight,
          maxWidth: "95vw",
          maxHeight: "90vh",
        }}
        {...props}
      >
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Maximize/Minimize button */}
        <button
          onClick={toggleMaximize}
          className="absolute right-12 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
        
        {/* Close button */}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

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
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
ResizableDialogContent.displayName = "ResizableDialogContent";

export { ResizableDialogContent };
