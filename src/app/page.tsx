import { Header } from "@/components/Header";
import { PaperBackground } from "@/components/PaperBackground";
import { Section } from "@/components/Section";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Skills } from "@/components/sections/Skills";
import { SuminagashiCanvas } from "@/components/suminagashi/SuminagashiCanvas";
import { getPublicResume } from "@/data/resume";

export default function Home() {
  const resume = getPublicResume();
  const { basics, work, skills, projects } = resume;

  return (
    <>
      <PaperBackground />
      <SuminagashiCanvas />
      <Header name={basics.name.zh} profiles={basics.profiles} />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-24 sm:px-8">
        <Hero basics={basics} />
        <div className="mt-20 space-y-20">
          <Section id="skills" title="技能">
            <Skills skills={skills} />
          </Section>
          <Section id="experience" title="經歷">
            <Experience work={work} />
          </Section>
          <Section id="portfolio" title="專案作品集">
            <Portfolio projects={projects} />
          </Section>
        </div>
      </main>
      <footer className="border-t border-line py-8 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} {basics.name.zh} — 網站與 PDF 皆由 resume.yaml
        單一資料源生成
      </footer>
    </>
  );
}
