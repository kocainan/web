interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

interface ProjectCardProps {
  projects: Project[];
}

export default function ProjectCard({ projects }: ProjectCardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mb-2">
      {projects.map((project, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col gap-2"
        >
          <p className="text-white font-medium text-sm leading-snug">
            {project.title}
          </p>
          <p className="text-[#888] text-xs leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.tags.map((tag, j) => (
              <span
                key={j}
                className="text-[10px] text-[#888] border border-[#333] rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3b82f6] text-xs mt-1 hover:underline"
            >
              View project →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
