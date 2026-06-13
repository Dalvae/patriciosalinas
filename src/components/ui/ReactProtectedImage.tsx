//src/components/ui/ReactProtectedImage.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  allImages?: (ImageInfo | string)[];
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

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function isMostlyOutOfView(rect: DOMRect, viewportHeight: number): boolean {
  const margin = rect.height * 0.1;
  return rect.top < -margin || rect.bottom > viewportHeight + margin;
}

function useScrollOverlay(
  containerRef: React.RefObject<HTMLDivElement>,
  isMobile: boolean,
  disableOverlay: boolean
) {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isMobile || disableOverlay) return;

    const rect = containerRef.current.getBoundingClientRect();
    setShowOverlay(isMostlyOutOfView(rect, window.innerHeight));
  }, [isMobile, disableOverlay]);

  const debouncedHandleScroll = useCallback(
    debounce(handleScroll, 100),
    [handleScroll]
  );

  useEffect(() => {
    if (isMobile && !disableOverlay) {
      window.addEventListener("scroll", debouncedHandleScroll);
      debouncedHandleScroll();
    } else {
      setShowOverlay(false);
    }
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [isMobile, debouncedHandleScroll, disableOverlay]);

  return showOverlay;
}

function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function ImageOverlay({
  showOverlay,
  isMobile,
  caption,
}: {
  showOverlay: boolean;
  isMobile: boolean;
  caption?: string;
}) {
  return (
    <div
      className={`absolute inset-0 bg-black/60 flex flex-col items-start justify-between transition-opacity duration-150 ${
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
  );
}

function ModalNavigation({
  onPrev,
  onNext,
  hasMultiple,
}: {
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
}) {
  if (!hasMultiple) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        className="absolute left-4 xl:top-1/2 xl:-translate-y-1/2 top-[80%] text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        className="absolute right-4 xl:top-1/2 xl:-translate-y-1/2 top-[80%] text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </>
  );
}

function ModalContent({
  imageArray,
  dialogImageIndex,
  onClose,
  onPrev,
  onNext,
  onDialogClick,
  preventDefaultActions,
}: {
  imageArray: ImageInfo[];
  dialogImageIndex: number;
  onClose: (e: React.MouseEvent) => void;
  onPrev: () => void;
  onNext: () => void;
  onDialogClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  preventDefaultActions: (e: React.MouseEvent | React.DragEvent) => void;
}) {
  const currentImage = imageArray[dialogImageIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDialogClick}
      onContextMenu={preventDefaultActions}
      onDragStart={preventDefaultActions}
    >
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
      >
        <X className="h-6 w-6" />
      </button>
      <ModalNavigation onPrev={onPrev} onNext={onNext} hasMultiple={imageArray.length > 1} />
      <div className="relative flex flex-col xl:flex-row items-center justify-center w-full h-full px-4">
        <div className="flex items-center justify-center w-full max-w-[1024px]">
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-[80vh] object-contain"
            onContextMenu={preventDefaultActions}
            onDragStart={preventDefaultActions}
          />
        </div>
        {currentImage.caption && (
          <div className="w-full text-center mt-4 mb-4 xl:text-left xl:mt-0 xl:mb-0 xl:ml-4 xl:w-1/4 max-w-[200px]">
            <div
              className="text-white text-lg "
              dangerouslySetInnerHTML={{ __html: currentImage.caption }}
            />
          </div>
        )}
      </div>
    </div>
  );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();

  const imageArray: ImageInfo[] = useMemo(
    () =>
      (allImages || [{ src, alt, caption }]).map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img
      ),
    [allImages, src, alt, caption]
  );

  const objectFitClass = className?.includes("object-") ? "" : "object-contain";
  const showOverlay = useScrollOverlay(containerRef, isMobile, disableOverlay);

  useEffect(() => {
    setDialogImageIndex(imageArray.findIndex((img) => img.src === src));
  }, [src, imageArray]);

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
      if (x < rect.width * 0.3) {
        changeImage("prev");
      } else if (x > rect.width * 0.7) {
        changeImage("next");
      }
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
          className={`w-full ${className} ${objectFitClass} not-prose`}
        />
        {!disableOverlay && (
          <ImageOverlay
            showOverlay={showOverlay}
            isMobile={isMobile}
            caption={caption}
          />
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent
          imageArray={imageArray}
          dialogImageIndex={dialogImageIndex}
          onClose={closeModal}
          onPrev={() => changeImage("prev")}
          onNext={() => changeImage("next")}
          onDialogClick={handleDialogClick}
          preventDefaultActions={preventDefaultActions}
        />
      </Dialog>
    </>
  );
}
