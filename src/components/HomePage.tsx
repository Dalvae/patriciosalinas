import React, { useRef } from "react";
import ProtectedImage from "./ui/ReactProtrectedImage";
import InfiniteLooper from "./ui/InfiniteLooper";
import type { Lang } from "../types/types";

interface ImageInfo {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  caption?: string;
  className?: string;
}

interface HomePageProps {
  content: string;
  projects: {
    title: string;
    images: string[];
    link: string;
  }[];
  lang: Lang;
}

const HomePage: React.FC<HomePageProps> = ({ content, projects, lang }) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  const shouldIncludeProject = (title: string) => {
    return title === "Atacama" || title === "Walter Benjamin";
  };

  const projectsToShow = projects.filter(
    (project) =>
      project.images.length > 0 && shouldIncludeProject(project.title)
  );

  const createImageInfo = (src: string, alt: string): ImageInfo => ({
    src,
    alt,
    width: "auto",
    height: "250px",
  });

  return (
    <div className="flex flex-col h-[85%] md:flex-row ">
      {/* Content Column */}
      <div className="w-full md:w-1/3 lg:ml-9 lg:mr-3 p-3 my-9 text-justify bg-white">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      {/* Project Gallery */}
      <div className="w-full md:w-2/3 overflow-hidden" ref={galleryRef}>
        <div className="pt-3">
          <div className="">
            {projectsToShow.map((project, projectIndex) => (
              <React.Fragment key={projectIndex}>
                <div className=" outline-primary-600 ">
                  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight drop-shadow-md   my-2 md:mx-6">
                    {project.title}
                  </h3>
                </div>
                <div className="bg-white shadow-sm  md:mx-6">
                  <InfiniteLooper
                    speed={40}
                    direction={projectIndex % 2 === 0 ? "left" : "right"}
                  >
                    <div className="flex ">
                      {project.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="flex-shrink-0  mx-2">
                          <ProtectedImage
                            src={image}
                            alt={`${project.title} - Image ${imageIndex + 1}`}
                            allImages={project.images.map((img) =>
                              createImageInfo(img, `${project.title} - Image`)
                            )}
                            width="auto"
                            height="300px"
                            style={{
                              height: "300px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </InfiniteLooper>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
