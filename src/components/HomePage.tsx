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

const HomePage: React.FC<HomePageProps> = ({ content, projects, lang }) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Function to determine if a project should be included
  const shouldIncludeProject = (title: string) => {
    return title === "Atacama" || title === "Walter Benjamin";
  };

  // Filter projects to show only Atacama and Walter Benjamin
  const projectsToShow = projects.filter(
    (project) =>
      project.images.length > 0 && shouldIncludeProject(project.title)
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
            {projectsToShow.map((project, projectIndex) => (
              <React.Fragment key={projectIndex}>
                <h3 className="text-2xl font-semibold mb-2 px-6">
                  {project.title}
                </h3>
                <InfiniteLooper
                  speed={40}
                  direction={projectIndex % 2 === 0 ? "left" : "right"}
                >
                  <div className="flex">
                    {project.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="flex-shrink-0 h-1/2 mx-2"
                      >
                        <ProtectedImage
                          src={image}
                          alt={`${project.title} - Image ${imageIndex + 1}`}
                          allImages={project.images}
                          width="auto"
                          height="350px"
                          style={{
                            height: "350px",
                            objectFit: "cover",
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
