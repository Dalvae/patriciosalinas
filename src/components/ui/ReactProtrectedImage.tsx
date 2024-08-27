import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!isMounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-90"
      aria-modal="true"
      role="dialog"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>,
    document.body
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

function DialogContent({ children, className = "" }: DialogContentProps) {
  return <div className={`${className}`}>{children}</div>;
}

export default function ProtectedImage({
  src,
  alt,
  width = "auto",
  height = "auto",
}: ProtectedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadImage();
  }, [src]);

  const loadImage = () => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = function () {
      drawImageOnCanvas(canvasRef.current, img);
    };
  };

  const drawImageOnCanvas = (
    canvas: HTMLCanvasElement | null,
    img: HTMLImageElement,
    maxWidth?: number,
    maxHeight?: number
  ) => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let newWidth = img.width;
        let newHeight = img.height;

        if (maxWidth && maxHeight) {
          const aspectRatio = img.width / img.height;
          if (img.height > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        addWatermark(ctx, newWidth, newHeight);
      }
    }
  };

  const addWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const text = "© Patricio Salinas";
    const fontSize = Math.max(12, width * 0.02);
    const margin = fontSize;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, width - textWidth - margin, height - margin);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && modalCanvasRef.current && canvasRef.current) {
      const img = new Image();
      img.src = canvasRef.current.toDataURL();
      img.onload = function () {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        drawImageOnCanvas(modalCanvasRef.current, img, maxWidth, maxHeight);
      };
    }
  }, [isModalOpen]);

  return (
    <>
      <div
        className="protected-image-container relative overflow-hidden cursor-pointer mx-auto"
        style={{ maxWidth: width, maxHeight: height }}
        onClick={openModal}
      >
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
        <div className="image-overlay absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-start justify-end opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="text-white m-2">
            <Maximize2 className="h-6 w-6" />
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 flex items-center justify-center">
          <canvas
            ref={modalCanvasRef}
            className="max-w-full max-h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
