//src/components/ui/ReactProtectedImage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";

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
  allImages?: ImageInfo[];
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
  const imageArray = allImages || [{ src, alt, caption }];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setDialogImageIndex(imageArray.findIndex((img) => img.src === src));
  }, [src, imageArray]);

  const handleScroll = useCallback(() => {
    if (containerRef.current && isMobile && !disableOverlay) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setShowOverlay(
        rect.top <= viewportHeight * 0.2 || rect.bottom >= viewportHeight * 0.8
      );
    }
  }, [isMobile, disableOverlay]);

  const debouncedHandleScroll = useCallback(debounce(handleScroll, 100), [
    handleScroll,
  ]);

  useEffect(() => {
    if (isMobile && !disableOverlay) {
      window.addEventListener("scroll", debouncedHandleScroll);
      debouncedHandleScroll();
    } else {
      setShowOverlay(false);
    }
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [isMobile, debouncedHandleScroll, disableOverlay]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const changeImage = (direction: "next" | "prev") => {
    if (imageArray.length > 1) {
      setDialogImageIndex((prevIndex) =>
        direction === "next"
          ? (prevIndex + 1) % imageArray.length
          : (prevIndex - 1 + imageArray.length) % imageArray.length
      );
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageArray.length > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      changeImage(
        x < rect.width * 0.3 ? "prev" : x > rect.width * 0.7 ? "next" : null
      );
    }
  };

  const preventDefaultActions = (e: React.MouseEvent | React.DragEvent) =>
    e.preventDefault();

  return (
    <>
      <div
        ref={containerRef}
        className={`protected-image-container relative overflow-hidden cursor-pointer ${containerClassName}`}
        style={{ width, height, ...style }}
        onClick={openModal}
        onContextMenu={preventDefaultActions}
        onDragStart={preventDefaultActions}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full ${className} object-cover not-prose`}
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
              <Maximize2 className="h-6 w-6 text-white" />
            </div>
            {caption && (
              <div
                className="text-white w-full p-2"
                dangerouslySetInnerHTML={{ __html: caption }}
              />
            )}
          </div>
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleDialogClick}
          onContextMenu={preventDefaultActions}
          onDragStart={preventDefaultActions}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <X className="h-6 w-6" />
          </button>
          {imageArray.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  changeImage("prev");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  changeImage("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="flex items-center justify-center w-full h-full">
            <div className="relative flex items-center">
              <img
                src={imageArray[dialogImageIndex].src}
                alt={imageArray[dialogImageIndex].alt}
                className="max-w-[70vw] max-h-[80vh] object-contain"
                onContextMenu={preventDefaultActions}
                onDragStart={preventDefaultActions}
              />
              {imageArray[dialogImageIndex].caption && (
                <div className="absolute left-full top-0 ml-4 max-w-[20vw] text-white text-lg">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: imageArray[dialogImageIndex].caption,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
