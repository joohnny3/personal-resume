import { getPublicResume } from "@/data/resume";

/**
 * 步驟 2:無樣式資料 dump 頁——驗證資料管線與個資過濾。
 * 步驟 3 會把這裡拆成五區塊元件並套上和紙視覺。
 */
export default function Home() {
  const resume = getPublicResume();
  const { basics, work, education, skills, projects, languages } = resume;

  return (
    <main>
      {/* 簡介 */}
      <section>
        <h1>
          {basics.name.zh}({basics.nickname.zh})
        </h1>
        <p>{basics.label.zh}</p>
        <p>{basics.summary.zh}</p>
        <ul>
          <li>
            Email:<a href={`mailto:${basics.email}`}>{basics.email}</a>
          </li>
          <li>城市:{basics.location.city.zh}</li>
          {basics.profiles
            .filter((p) => p.url !== "")
            .map((p) => (
              <li key={p.network}>
                {p.network}:<a href={p.url}>{p.url}</a>
              </li>
            ))}
        </ul>
      </section>

      {/* 技能 */}
      <section>
        <h2>技能</h2>
        {skills.map((group) => (
          <article key={group.name.zh}>
            <h3>{group.name.zh}</h3>
            <p>{group.keywords.join("・")}</p>
            <ul>
              {group.details.map((d) => (
                <li key={d.zh}>{d.zh}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* 經歷 */}
      <section>
        <h2>經歷</h2>
        {work.map((job) => (
          <article key={`${job.company.zh}-${job.startDate}`}>
            <h3>
              {job.position.zh}|{job.company.zh}
            </h3>
            <p>
              {job.startDate} ~ {job.endDate || "至今"}|{job.location.zh}
            </p>
            {job.summary.zh !== "" && <p>{job.summary.zh}</p>}
            {job.highlights.length > 0 && (
              <ul>
                {job.highlights.map((h) => (
                  <li key={h.zh}>{h.zh}</li>
                ))}
              </ul>
            )}
            {job.projects.map((proj) => (
              <section key={proj.name.zh}>
                <h4>
                  {proj.name.zh}({proj.startDate} ~ {proj.endDate || "至今"})
                </h4>
                <p>{proj.purpose.zh}</p>
                <ul>
                  {proj.highlights.map((h) => (
                    <li key={h.zh}>{h.zh}</li>
                  ))}
                </ul>
              </section>
            ))}
          </article>
        ))}
      </section>

      {/* 專案作品集 */}
      <section>
        <h2>專案作品集</h2>
        {projects.map((proj) => (
          <article key={proj.name.zh}>
            <h3>
              {proj.name.zh}({proj.startDate} ~ {proj.endDate || "仍在進行"})
            </h3>
            {proj.url !== "" && <a href={proj.url}>{proj.url}</a>}
            <p>{proj.description.zh}</p>
            <ul>
              {proj.highlights.map((h) => (
                <li key={h.zh}>{h.zh}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* 學歷 */}
      <section>
        <h2>學歷</h2>
        {education.map((edu) => (
          <article key={edu.institution.zh}>
            <h3>{edu.institution.zh}</h3>
            <p>
              {edu.area.zh}|{edu.studyType.zh}|{edu.startDate} ~ {edu.endDate}
            </p>
          </article>
        ))}
      </section>

      {/* 語言 */}
      <section>
        <h2>語言能力</h2>
        <ul>
          {languages.map((lang) => (
            <li key={lang.language.zh}>
              {lang.language.zh}:{lang.fluency.zh}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
