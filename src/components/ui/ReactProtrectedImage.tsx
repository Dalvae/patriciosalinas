//src/components/ui/ReactProtectedImage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  allImages: string[];
  style?: React.CSSProperties;
  className?: string;
  containerClassName?: string;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      aria-modal="true"
      role="dialog"
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
  allImages,
  style,
  className = "",
  containerClassName = "",
}: ProtectedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadImage(src, canvasRef.current, false);
    setDialogImageIndex(allImages.indexOf(src));
  }, [src, allImages]);

  const loadImage = (
    imageSrc: string,
    canvas: HTMLCanvasElement | null,
    isModal: boolean
  ) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = function () {
      drawImageOnCanvas(canvas, img, isModal);
    };
  };

  const drawImageOnCanvas = (
    canvas: HTMLCanvasElement | null,
    img: HTMLImageElement,
    isModal: boolean
  ) => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let newWidth, newHeight;

        if (isModal) {
          const maxWidth = window.innerWidth * 0.9;
          const maxHeight = window.innerHeight * 0.9;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          newWidth = img.width * scale;
          newHeight = img.height * scale;
        } else {
          const aspectRatio = img.width / img.height;
          newWidth = parseInt(width, 10) || img.width;
          newHeight = parseInt(height, 10) || img.height;

          if (width === "auto" && height !== "auto") {
            newWidth = newHeight * aspectRatio;
          } else if (height === "auto" && width !== "auto") {
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
    loadImage(allImages[dialogImageIndex], modalCanvasRef.current, true);
  };

  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const changeImage = (direction: "next" | "prev") => {
    const newIndex =
      direction === "next"
        ? (dialogImageIndex + 1) % allImages.length
        : (dialogImageIndex - 1 + allImages.length) % allImages.length;
    setDialogImageIndex(newIndex);
    loadImage(allImages[newIndex], modalCanvasRef.current, true);
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      changeImage("prev");
    } else if (x > rect.width * 0.7) {
      changeImage("next");
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      loadImage(allImages[dialogImageIndex], modalCanvasRef.current, true);
    }
  }, [isModalOpen, dialogImageIndex, allImages]);

  return (
    <>
      <div
        className={`protected-image-container relative overflow-hidden cursor-pointer ${containerClassName}`}
        style={{ width, height, ...style }}
        onClick={openModal}
      >
        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto block ${className}`}
        />
        <div className="image-overlay absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-start justify-end opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="text-white m-2">
            <Maximize2 className="h-6 w-6" />
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleDialogClick}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeImage("prev");
            }}
            className="absolute left-[1%] md:top-1/2 top-[85%] transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <canvas
            ref={modalCanvasRef}
            className="max-w-[90vw] max-h-[90vh] my-auto object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeImage("next");
            }}
            className="absolute right-[1%] md:top-1/2 top-[85%] transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Dialog>
    </>
  );
}
