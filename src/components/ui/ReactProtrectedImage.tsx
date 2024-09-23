//src/components/ui/ReactProtectedImage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";

import { createPortal } from "react-dom";
import { Maximize2, ChevronLeft, ChevronRight, X, Info } from "lucide-react";

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
  disableOverlay?: boolean;
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

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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
  disableOverlay = false,
}: ProtectedImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogImageIndex, setDialogImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setDialogImageIndex(allImages.findIndex((img) => img.src === src));
  }, [src, allImages]);

  const handleScroll = useCallback(() => {
    if (containerRef.current && isMobile && !disableOverlay) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const shouldShowOverlay =
        rect.top <= viewportHeight * 0.2 || rect.bottom >= viewportHeight * 0.8;
      setShowOverlay(shouldShowOverlay);
    }
  }, [isMobile, disableOverlay]);

  const debouncedHandleScroll = useCallback(debounce(handleScroll, 100), [
    handleScroll,
  ]);

  useEffect(() => {
    if (isMobile && !disableOverlay) {
      window.addEventListener("scroll", debouncedHandleScroll);
      debouncedHandleScroll(); // Check initial state
    } else {
      setShowOverlay(false);
    }

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [isMobile, debouncedHandleScroll, disableOverlay]);

  const openModal = () => {
    setIsModalOpen(true);
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

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`protected-image-container relative overflow-hidden cursor-pointer ${containerClassName}`}
        style={{ width, height, ...style }}
        onClick={openModal}
        onContextMenu={preventContextMenu}
        onDragStart={preventDragStart}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full  object-contain not-prose ${className}`}
        />
        {!disableOverlay && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col items-start justify-between transition-opacity duration-300 ${
              isMobile
                ? showOverlay
                  ? "opacity-100"
                  : "opacity-0"
                : "opacity-0 hover:opacity-100"
            }`}
          >
            <div className="flex justify-end w-full p-2">
              <div className="text-white">
                <Maximize2 className="h-6 w-6" />
              </div>
            </div>
            {caption && (
              <div className="text-white w-full font-bold p-2">
                <div dangerouslySetInnerHTML={{ __html: caption }}></div>
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
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
            className={`absolute ${
              isMobile ? "left-4 bottom-20" : "left-4 top-1/2 -translate-y-1/2"
            } text-white bg-black bg-opacity-50 p-2 rounded-full z-10`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Contenedor de la imagen y el texto */}
          <div className="flex md:flex-row flex-col items-start max-w-[90vw] max-h-[90vh]">
            {/* Imagen */}
            <div className="relative">
              <img
                src={allImages[dialogImageIndex].src}
                alt={allImages[dialogImageIndex].alt}
                className="max-w-[70vw] max-h-[70vh] object-contain"
                onContextMenu={preventContextMenu}
                onDragStart={preventDragStart}
              />
            </div>

            {allImages[dialogImageIndex].caption && (
              <div className="m-4 text-white text-2xl font-bold self-start">
                <div
                  className="space-y-4"
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
            className={`absolute ${
              isMobile
                ? "right-4 bottom-20"
                : "right-4 top-1/2 -translate-y-1/2"
            } text-white bg-black bg-opacity-50 p-2 rounded-full z-10`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </Dialog>
    </>
  );
}
