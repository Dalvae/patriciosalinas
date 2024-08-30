import React, { useRef } from "react";
import ProtectedImage from "./ui/ReactProtrectedImage";
import InfiniteLooper from "./ui/InfiniteLooper";
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

  // Filter projects with images
  const projectsWithImages = projects.filter(
    (project) => project.images.length > 0
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Content Column */}
      <div className="w-full md:w-1/3 p-12 mt-9">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      {/* Project Gallery */}
      <div className="w-full md:w-2/3 overflow-hidden" ref={galleryRef}>
        <div className="py-16">
          <div className="space-y-8">
            {projectsWithImages.map((project, projectIndex) => (
              <React.Fragment key={projectIndex}>
                <h3 className="text-2xl font-semibold mb-2 px-6">
                  {project.title}
                </h3>
                <InfiniteLooper
                  speed={50}
                  direction={projectIndex % 2 === 0 ? "left" : "right"}
                >
                  <div className="flex">
                    {project.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="flex-shrink-0 h-64 mx-2"
                        style={{ maxWidth: "400px" }} // Add this to limit maximum width
                      >
                        <ProtectedImage
                          src={image}
                          alt={`${project.title} - Image ${imageIndex + 1}`}
                          allImages={project.images}
                          width="auto"
                          height="250px"
                          style={{
                            width: "auto",
                            height: "250px",
                            objectFit: "cover",
                            maxWidth: "100%",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </InfiniteLooper>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
