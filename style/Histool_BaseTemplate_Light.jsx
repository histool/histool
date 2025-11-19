import React from "react";
import theme from "../theme/theme.json";

export default function HistoolBaseTemplateLight() {
  const c = theme.colors;
  const t = theme.typography;
  const l = theme.layout;
  const m = theme.motion;

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: c.background,
        color: c.foreground,
        fontFamily: t.fontFamily,
        transition: m.transition
      }}
    >
      {/* Navigation Bar */}
      <nav
        className="w-full flex justify-between items-center py-8 text-xs uppercase tracking-wider border-b"
        style={{
          borderColor: c.line,
          maxWidth: l.maxWidth,
          margin: `0 ${l.marginHorizontal}`,
          color: c.muted
        }}
      >
        <span>© 2025 HISTOOL</span>
        <div className="flex gap-8">
          <a href="#projects" className="hover:text-[#3B7EFF] transition-colors">
            Projects
          </a>
          <a href="#about" className="hover:text-[#3B7EFF] transition-colors">
            About
          </a>
          <a href="#archive" className="hover:text-[#3B7EFF] transition-colors">
            Archive
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        className="flex flex-col justify-center text-center my-32"
        style={{ maxWidth: l.maxWidth, margin: `0 ${l.marginHorizontal}` }}
      >
        <h1
          className="mb-6"
          style={{
            fontSize: t.heading.h1.fontSize,
            fontWeight: t.heading.h1.fontWeight,
            lineHeight: t.heading.h1.lineHeight,
            color: c.foreground
          }}
        >
          HISTOOL: Researching the Aesthetics of Time
        </h1>
        <p
          className="opacity-80"
          style={{
            fontSize: t.body.fontSize,
            lineHeight: t.body.lineHeight,
            color: c.muted
          }}
        >
          Archival design, visual epistemology, and the interface of history.
        </p>
      </header>

      {/* Project Grid */}
      <section
        id="projects"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-40"
        style={{ maxWidth: l.maxWidth, margin: `0 ${l.marginHorizontal}` }}
      >
        {["AI Archive", "Cultural Atlas", "Temporal Scripts"].map((title, i) => (
          <ProjectCard key={i} title={title} index={i + 1} />
        ))}
      </section>

      {/* Footer */}
      <footer
        className="w-full text-xs py-8 border-t"
        style={{
          textAlign: "center",
          borderColor: c.line,
          color: c.muted
        }}
      >
        <p>Histool © 2025 · Archival Clarity Edition</p>
      </footer>
    </div>
  );
}

// Sub-component
function ProjectCard({ title, index }) {
  const c = theme.colors;
  const t = theme.typography;
  const m = theme.motion;
  return (
    <div
      className="flex flex-col justify-between border hover:shadow-sm transition-all p-6"
      style={{
        borderColor: c.line,
        backgroundColor: "#FFFFFF",
        transition: m.imageTransition
      }}
    >
      <div>
        <h2
          style={{
            fontSize: t.heading.h2.fontSize,
            fontWeight: t.heading.h2.fontWeight,
            color: c.foreground
          }}
        >
          {index.toString().padStart(2, "0")}. {title}
        </h2>
        <p
          className="mt-2"
          style={{
            fontSize: t.body.fontSize,
            lineHeight: t.body.lineHeight,
            color: c.muted
          }}
        >
          Experimental interface exploring the visual structures of memory.
        </p>
      </div>
      <div
        className="mt-8 text-right"
        style={{
          fontSize: t.caption.fontSize,
          color: c.accent
        }}
      >
        View Project →
      </div>
    </div>
  );
}
