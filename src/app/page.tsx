import { Header } from "@/components/Header";
import { PaperBackground } from "@/components/PaperBackground";
import { Section } from "@/components/Section";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { SuminagashiCanvas } from "@/components/suminagashi/SuminagashiCanvas";
import { getPublicResume } from "@/data/resume";

export default function Home() {
  const resume = getPublicResume();
  const { basics, work, skills } = resume;

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
          {/* 作品集暫時隱藏(元件保留在 sections/Portfolio.tsx,資料在 resume.yaml,
              要恢復時把 Section#portfolio 加回來、Header 補回作品 anchor 即可) */}
        </div>
      </main>
      {/* 靠左:右下角有墨色盤,置中文字會跟它打架 */}
      <footer className="border-t border-line py-8 text-xs text-ink-muted">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          Copyright © {new Date().getFullYear()} Chang Yu Cheng. All rights
          reserved.
        </div>
      </footer>
    </>
  );
}
