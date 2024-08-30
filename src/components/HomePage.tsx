//src/compones/HomePage.tsx
import React, { useEffect, useRef, useState } from "react";
import ProtectedImage from "./ui/ReactProtrectedImage.tsx";
import type { Lang } from "../types/types";

interface HomePageProps {
  content: string;
  projects: {
    title: string;
    images: string[];
    link: string;
  }[];
  lang: Lang;
}

const HomePage: React.FC<HomePageProps> = ({ content, projects }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Debug: Log projects data
  // console.log("Projects data:", projects);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Content Column */}
      <div className="w-full md:w-1/3 p-12 mt-9">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {/* Project Gallery */}
      <div className="w-full md:w-2/3 overflow-hidden" ref={galleryRef}>
        <div className="py-6">
          <h2 className="text-3xl font-semibold mb-4 px-6">Projects</h2>
          <div className="space-y-8">
            {projects.map((project, projectIndex) => (
              <div
                key={projectIndex}
                className="project-row"
                style={{
                  transform: `translateX(${
                    scrollPosition * (projectIndex % 2 === 0 ? -0.3 : 0.3)
                  }px)`,
                  transition: "transform 0.5s ease-out",
                }}
              >
                <h3 className="text-2xl font-semibold mb-2 px-6">
                  {project.title}
                </h3>
                <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                  {project.images.map((image, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="flex-shrink-0 w-64 h-64 mx-2"
                    >
                      <ProtectedImage
                        src={image}
                        alt={`${project.title} - Image ${imageIndex + 1}`}
                        allImages={project.images}
                        width={"250px"}
                        height={"250px"}
                      />
                      {/* <img src={image} alt="" /> */}
                    </div>
                  ))}
                </div>
                {/* <a
                  href={project.link}
                  className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  View Project
                </a> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
