目前進度:步驟 4 完成(已自驗),請你照清單驗證,通過後進入步驟 5(/print + PDF)

# 個人履歷網站 — 實作小計畫

> 依據 [PRD.md](PRD.md)(2026-07-02 定案)拆解。每一步做完立即可自行驗證,驗證通過才進下一步。
> 每完成一步:回到最上面更新「目前進度」,並把該步打勾。

---

## 已定案決策(2026-07-02 討論收斂)

| 項目 | 決定 |
|---|---|
| 視覺主題 | 墨流し(Suminagashi)互動流體水墨;極簡、安靜、高級感 |
| 動效技術 | Three.js + WebGL shader 真流體模擬(規格見步驟 4),不用 CSS 假動畫 |
| 字體 | 思源宋體(子集化控制載入量) |
| 深淺色 | 跟隨系統 + 頁面手動切換鈕 |
| Repo | `personal-resume`(本機 git 已初始化,GitHub repo 於步驟 6 建立) |
| PDF 檔名 | `chang-yu-cheng-resume.pdf`(英文,羅馬拼音 Chang Yu-Cheng) |
| 個資分級實作 | **檔案邊界分級**:`resume.yaml`(公開欄位,進 git)+ `resume.private.yaml`(電話/地址/生日,gitignored)。原因:GitHub Pages 免費方案 repo 必須公開,個資放同一份 yaml 會直接暴露在版本庫;拆檔後「網站 build 根本讀不到 private 檔」,分級由檔案系統強制。CI 產 PDF 時以 GitHub Actions Secret 注入 private 內容(步驟 6)。 |

## 前端架構

- **框架**:Next.js(App Router)+ TypeScript,`output: 'export'` 純靜態輸出,`basePath = /personal-resume` 對應 GitHub Pages 子路徑。
- **樣式**:Tailwind CSS + CSS variables 做主題 tokens(淡米色和紙/夜墨 兩套),手動切換鈕 + 預設跟隨系統。
- **動效**:
  - **墨流し流體層**:`<SuminagashiCanvas>` 獨立元件,fixed 全螢幕墊在內容底下,Three.js + 自寫 GLSL;內容浮在上層。
  - **區塊進場**:IntersectionObserver 淡入即可,安靜為主,不搶流體的戲。
  - 遵守 `prefers-reduced-motion`、偵測無 WebGL:皆退回靜態和紙紋理背景。
- **資料流**:`resume.yaml`(+ PDF 建置時合併 `resume.private.yaml`)→ build time 以 js-yaml 解析 + zod schema 驗證 → 傳入頁面元件。網站頁面的載入路徑**不 import** private 檔,分級由程式與檔案邊界雙重強制。
- **PDF**:`/print` 路由排 A4 單欄 ATS 版型 → Playwright 腳本印成 `public/chang-yu-cheng-resume.pdf`(先本機跑通,再搬進 GitHub Actions)。
- **部署**:GitHub Actions:build → 產 PDF → 部署 GitHub Pages。

```
personal-resume/
├─ resume.yaml              # 唯一資料源(公開欄位)
├─ resume.private.yaml      # 電話/地址/生日(gitignored,CI 用 Secret 注入)
├─ src/
│  ├─ data/                 # yaml 載入、zod schema、public/print 兩種資料組裝
│  ├─ components/           # 五區塊元件、SuminagashiCanvas
│  ├─ app/
│  │  ├─ page.tsx           # 一頁式中文履歷(public 資料)
│  │  └─ print/page.tsx     # A4/ATS 版(public + private)
├─ scripts/export-pdf.ts    # Playwright 產 PDF
└─ .github/workflows/       # build + PDF + deploy
```

---

## 步驟(依序執行)

### 為什麼這樣排

1 是一切的資料源,PRD 明定「校對完成才開發頁面」,所以排最前。2 建立架構與**個資分級管線**,是 3~5 每一頁的地基。3 先把內容版面做對(可讀性是底線),4 的流體層才疊得上去——先有素顏再上妝,也才有效能基準可對比。5 的 /print 只依賴 2 的資料管線和 3 的定稿內容,與 4 無關。6 需要前面全部產物,故最後。

### 清單

- [x] **步驟 1:舊履歷 → `resume.yaml`(資料轉換與校對)**(2026-07-02 本人校對通過;GitHub/Medium/OpenClaw 連結仍為 TODO,補上後自動出現於網站)
  已從舊履歷 PDF 轉出 `resume.yaml`(公開欄位,對齊 JSON Resume、`{zh, en}` 雙語結構、en 留空)與 `resume.private.yaml`(電話、地址等,不進 git)。
  **做完怎麼確認**:打開兩份 yaml 與舊 PDF 並排逐欄核對——經歷年份、職稱、專案數字(80%、40%、30%、15%)都正確;確認電話地址只在 private 檔。**並補齊檔內標記 TODO 的欄位:GitHub / Medium 連結、OpenClaw 專案連結、(若 PDF 要放)完整地址與生日。你本人校對簽核後才進步驟 2。**

- [x] **步驟 2:專案骨架 + 資料管線(Next.js 靜態輸出 + 個資分級)**(2026-07-02 完成;dev 網址為 http://localhost:3000/personal-resume/)
  建 Next.js + TS + Tailwind 專案,設定 `output: 'export'` 與 basePath;寫 yaml 載入 + zod 驗證 + public/print 兩種資料組裝;先用「無樣式」頁面把 public 資料全部吐到畫面上。
  **做完怎麼確認**:`npm run dev` 開 localhost 看到履歷資料(未美化);**在頁面原始碼搜尋電話號碼——必須找不到**;`npm run build` 成功產出 `out/`;`git status` 確認 `resume.private.yaml` 不在追蹤清單。

- [x] **步驟 3:一頁式五區塊版面(和紙基底 + RWD + 深淺色,先不做流體)**(2026-07-02 完成)
  排出 簡介/技能/經歷/專案作品集(主角)/學歷 五區塊;思源宋體、淡米色和紙/夜墨 tokens;完成響應式、深淺色手動切換鈕;背景先放靜態和紙紋理佔位(即步驟 4 的退場方案)。
  **做完怎麼確認**:瀏覽器逐區塊對照 `resume.yaml` 內容無缺漏;DevTools 切 375px 手機寬,無橫向捲軸、字可讀;點切換鈕深淺色正確翻轉、重整後記住選擇。

- [x] **步驟 4:墨流し(Suminagashi)互動流體層**(2026-07-02 完成;Lighthouse 正式跑分留待你驗證,實測 144Hz 滿刷新率)
  - [x] **4a. GPU 流體求解器核心**:Three.js + GLSL、ping-pong 雙 FBO,完整管線 advection → curl / vorticity confinement → divergence → pressure solve(Jacobi)→ gradient subtract;velocity field 與 dye field 分離解析度;pointer 拖曳注入 splat(速度 + 染料)。先用直接 RGB 顯示驗證流體行為。
    **怎麼確認**:拖動畫面出現真實流體感——漩渦捲曲(curl 生效)、墨流推擠、慢慢消散;快速甩動有慣性尾流,不是貼圖位移。
  - [x] **4b. 減法混色 + 和紙 display shader**:四墨色 墨 `#1a1a1f`/藍 `#16407a`/朱 `#c8372d`/松葉 `#2e6e52` 轉 absorption vector(≈ `-log(inkRGB)`),dye field 累積吸收量,display 以 `paperColor * exp(-absorption)` 合成;疊高/中/低頻三層纖維 noise + 極淡 vignette,底色淡米色和紙;四色極簡選擇 UI(小墨點);深色模式換夜墨紙色並調校墨色顯示。
    **怎麼確認**:墨看起來是「沉進紙裡」——兩色交疊處變深變沉(減法),不會變亮;近看紙面有纖維顆粒不是平滑純色;邊緣有極淡暗角。
  - **效能與退場(4a/4b 共同)**:手機降 DYE_RES、限制 devicePixelRatio;分頁隱藏暫停模擬;`prefers-reduced-motion` 或無 WebGL 退回步驟 3 的靜態和紙。
    **怎麼確認**:桌機拖曳穩 60fps;手機模擬不卡頓;開系統「減少動態效果」後流體關閉、內容照常;Lighthouse 與步驟 3 基準相比 LCP 無明顯退步。

  **求解參數基準**(調校起點,可微調):`SIM_RES 256`・`DYE_RES 1280`・`PRESSURE_ITER 28`・`VEL_DISSIPATION 0.16`・`DYE_DISSIPATION 0.07`・`CURL 14`・`SPLAT_RADIUS 0.0026`・`SPLAT_FORCE 5200`

- [ ] **步驟 5:`/print` 頁 + 本機 PDF 產出(個資分級生效)**
  做 A4 單欄、ATS 友善的 `/print` 頁(合併 private 欄位);Playwright 腳本 `npm run pdf` 輸出 `public/chang-yu-cheng-resume.pdf`;主頁加下載連結。
  **做完怎麼確認**:本機跑 `npm run pdf` 得到 PDF;打開後為 A4、文字可反白選取(非圖片,ATS 可讀)、電話地址存在;回到主網站原始碼再搜一次電話——依然找不到;點主頁下載連結拿得到檔案。

- [ ] **步驟 6:GitHub Pages 上線 + Actions 自動化**
  建 GitHub repo `personal-resume`(公開);private 內容設為 Actions Secret;workflow:build → Playwright 產 PDF → 部署 Pages;確認 basePath 下所有資源正常。
  **做完怎麼確認**:手機和電腦直接開 `https://<帳號>.github.io/personal-resume/`,五區塊、流體互動、深淺色都正常;從線上網站下載 PDF,打開含電話地址;在 GitHub 網頁介面搜整個 repo——搜不到電話號碼;改 `resume.yaml` 一個字 → push → 幾分鐘後網站與 PDF 都更新。**此步完成 = PRD v1 驗收全數打勾。**
