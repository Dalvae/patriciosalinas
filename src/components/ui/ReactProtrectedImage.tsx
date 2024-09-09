//src/components/ui/ReactProtectedImage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";

import { createPortal } from "react-dom";
import { Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";

type HTMLString = string;

interface ImageInfo {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  caption?: string;
  className?: string;
}

interface ProtectedImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  allImages: ImageInfo[];
  style?: React.CSSProperties;
  className?: string;
  containerClassName?: string;
  caption?: string;
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
  caption,
}: ProtectedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    loadImage(src, canvasRef.current, false);
    setDialogImageIndex(allImages.findIndex((img) => img.src === src));
  }, [src, allImages]);

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
          const containerWidth = parseInt(width, 10) || img.width;
          const containerHeight = parseInt(height, 10) || img.height;
          const containerAspectRatio = containerWidth / containerHeight;
          const imageAspectRatio = img.width / img.height;

          if (containerAspectRatio > imageAspectRatio) {
            newHeight = containerHeight;
            newWidth = newHeight * imageAspectRatio;
          } else {
            newWidth = containerWidth;
            newHeight = newWidth / imageAspectRatio;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        addWatermark(ctx, newWidth, newHeight);

        setImageDimensions({ width: newWidth, height: newHeight });
      }
    }
  };

  const loadImage = (
    imageSrc: string,
    canvas: HTMLCanvasElement | null,
    isModal: boolean
  ) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      drawImageOnCanvas(canvas, img, isModal);
    };
    img.onerror = function (e) {
      console.error("Error loading image:", imageSrc, e);
    };
    img.src = imageSrc;
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
    loadImage(allImages[dialogImageIndex].src, modalCanvasRef.current, true);
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
    loadImage(allImages[newIndex].src, modalCanvasRef.current, true);
  };

  useEffect(() => {
    if (isModalOpen) {
      loadImage(allImages[dialogImageIndex].src, modalCanvasRef.current, true);
    }
  }, [isModalOpen, dialogImageIndex, allImages]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      changeImage("prev");
    } else if (x > rect.width * 0.7) {
      changeImage("next");
    }
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div
        className={`protected-image-container relative overflow-hidden cursor-pointer ${containerClassName}`}
        style={{
          width:
            imageDimensions.width > 0 ? `${imageDimensions.width}px` : width,
          height:
            imageDimensions.height > 0 ? `${imageDimensions.height}px` : height,
          ...style,
        }}
        onClick={openModal}
        onContextMenu={preventContextMenu}
        onDragStart={preventDragStart}
      >
        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto block ${className}`}
          style={{
            visibility: imageDimensions.width > 0 ? "visible" : "hidden",
          }}
        />
        <div className="image-overlay absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-start justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="text-white m-2 self-end">
            <Maximize2 className="h-6 w-6" />
          </div>
          {caption && (
            <div className="text-white ml-2 w-full font-bold bg-opacity-50 p-2">
              <div dangerouslySetInnerHTML={{ __html: caption }}></div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleDialogClick}
          onContextMenu={preventContextMenu}
          onDragStart={preventDragStart}
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-start max-w-[90vw] max-h-[90vh]">
            <div className="relative">
              <canvas
                ref={modalCanvasRef}
                className="max-w-[80vw] max-h-[90vh] object-contain"
                onContextMenu={preventContextMenu}
                onDragStart={preventDragStart}
              />
            </div>
            {allImages[dialogImageIndex].caption && (
              <div className="ml-4 max-w-[20vw] text-white text-2xl  font-bold">
                <div
                  className="space-y-4 mb-10"
                  dangerouslySetInnerHTML={{
                    __html: allImages[dialogImageIndex].caption,
                  }}
                ></div>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeImage("next");
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Dialog>
    </>
  );
}
