import React, { useEffect, useRef, useState } from "react";
import styles from "./ProtectedImage.module.css";

interface Props {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  className?: string;
}

const ProtectedImage: React.FC<Props> = ({
  src,
  alt,
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

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

  const loadImage = (canvas: HTMLCanvasElement, isModal: boolean = false) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      img.onload = function () {
        let newWidth, newHeight;

        if (!isModal) {
          newWidth = width ? parseInt(width) : img.width;
          newHeight = height ? parseInt(height) : img.height;
        } else {
          const aspectRatio = img.width / img.height;
          newWidth = window.innerWidth;
          newHeight = window.innerHeight;

          if (newWidth / aspectRatio > newHeight) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        addWatermark(ctx, newWidth, newHeight);

        if (!isModal) {
          setImageDimensions({ width: newWidth, height: newHeight });
        }
      };
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      loadImage(canvasRef.current);
    }
  }, [src, width, height]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && modalCanvasRef.current) {
      loadImage(modalCanvasRef.current, true);
    }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`${styles.protectedImageContainer} ${className || ""}`}
        style={{
          width: "100%",
          paddingBottom: "100%", // Esto crea un cuadrado perfecto
          // paddingBottom: `${
          //   (parseInt(height || "0") / parseInt(width || "1")) * 100
          // }%`,
          position: "relative",
        }}
        onClick={openModal}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div className={styles.imageOverlay}>
          <span className={styles.expandIcon}>⤢</span>
        </div>
      </div>

      {isModalOpen && (
        <div
          className={`${styles.imageModal} ${styles.open}`}
          onClick={closeModal}
        >
          <div className={`${styles.modalContent} ${styles.open}`}>
            <canvas ref={modalCanvasRef} className={styles.modalCanvas} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedImage;
