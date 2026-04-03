# Ronny's TODO List

整理自 2025-2026 年回憶錄訪談。背景：ronnywang，台灣公民科技開發者，g0v 社群參與者，歐噴有限公司（openfunltd）負責人。

---

## 一、回憶錄補完（ronny-github 網站）

### 故事細節待補充

- [ ] **twcompany / company-graph**：三個故事待加入
  - 資料被內容農場拿去架站的事件
  - 被「發票小幫手」和「simpany」接去加值成商業服務
  - 打包檔公開在 g0v 社群引發的論戰（開放資料授權爭議）
  - 爬蟲方式：從統編 00000000 爬到 99999999，一秒一頁，花兩三個月完成初次抓取

- [ ] **middle2**：故事細節已記錄於 memory，待補充到故事文章
  - 原名 hisoku 的命名由來
  - 中二（PaaS 雲端架構中間第二層）的雙關命名邏輯
  - 是所有公民科技專案的基礎建設這件事
  - 得到 g0v 公民科技創新獎助金

### 尚未有故事的 repos

以下是訪談中提到但故事還不夠完整，或完全沒有故事的方向，可以在下一個 session 挑選繼續訪談：

- [ ] **fidb-crawler**（從 2022 年短講知道有這個，但故事還沒寫）
- [ ] **GovCash**（政府現金，提過但沒展開）
- [ ] **heroku-ircbot**（早期 IRC bot，g0v 通訊基礎建設的一環）
- [ ] 其他在「那些年我在 g0v 放棄的程式碼」投影片裡提到但還沒展開的項目

---

## 二、舊專案復活（AI 時代可以重新挑戰）

### 北市豪宅通 / 台北市開放空間

- [ ] **tpe-building-license 重啟評估**
  - 當年卡關原因：建築執照是掃描圖檔，OCR 處理不了結構化資料
  - 現在：LLM 可以讀取圖片、PDF，提取結構化欄位
  - 可能的做法：用 Claude / GPT Vision 批量處理掃描建照，提取容積獎勵項目和開放空間義務
  - 價值：找出台北市哪些「被盆栽擋住的開放空間」
  - 相關 repo：tpe-building-license、taipei-open-space

### twcompany 自動化

- [ ] **twcompany 每日更新自動化**
  - 現狀：每天手動執行 30 秒的儀式已進行超過十年
  - TODO：把這個每日更新流程做成 cron job 或 GitHub Actions，終結手動習慣
  - 這是已知可以做、一直懶得花一個小時解決的事

### lysayit 現代化

- [ ] **lysayit 現代化**
  - 原版是 2016 年 hackath22n 的成果（立院議案資料結構化）
  - 現在立院資料更豐富，介面可以重做
  - 與 lyhub 可以整合——lyhub 的立委發言資料可以 link 到 lysayit

---

## 三、新專案持續開發

### lyhub（立委 Mastodon）

- [ ] **lyhub 核心功能開發**（2026-03-29 hackath72n 建立，目前只有 25 個 commit）
  - 自動同步立委在立法院的行為：發言紀錄、提案、出席
  - 讓選民可以在 Mastodon 追蹤選區立委
  - 考慮與 lysayit 資料整合
  - ActivityPub / Mastodon API 實作完整度待確認

- [ ] **lyhub 資料來源整合**
  - lyapi 立法院 API 資料的完整度
  - 立委在院外的公開行為（如社群媒體發文）要不要納入？

### g0v-database（g0v 大松資料庫）

- [ ] **g0v-database 功能擴充**（2026-04-03 建立）
  - 加入歷年提案數量趨勢圖（Chart.js 或純 SVG）
  - 加入「同一個專案跨多屆出現」的追蹤視圖（project continuity）
  - 提案者 leaderboard（累計最多提案的前幾名）
  - 搜尋加上 type filter（只看提案 / 只看短講）

- [ ] **g0v-database 資料更新機制**
  - 目前資料需要手動從 ronny-github 複製過來
  - 考慮改成 git submodule 或 GitHub Actions 自動同步

### openfunltd 公司方向

- [ ] **整理 openfunltd 50 個 public repo 的現況**
  - 哪些是活躍維護中？哪些是 archived？
  - 哪些有商業潛力可以繼續投入？
  - data/openfunltd-repos.json 已有基礎資料

---

## 四、長期/策略性

### political-candidate（選立委）

- [ ] **political-candidate 專案評估**
  - 訪談中提到這是一個認真考慮的方向
  - 技術面：候選人資訊透明化工具
  - 個人面：作為公民科技人參與政治的可能路徑
  - 目前 repo 已存在，待進一步規劃

### 公民科技 × AI 的新可能

- [ ] **盤點哪些過去「做不到」的事現在可以做**
  - tpe-building-license（掃描圖檔結構化）是一個例子
  - 其他卡在「資料需要人工閱讀」的專案？
  - pcc 標案資料：大量 PDF，AI 現在可以讀

- [ ] **建立 AI 輔助公民科技的工作流程**
  - 用 Claude / AI 加速資料清理、故事撰寫、程式碼生成
  - 這份文件本身就是一個實驗

### 歐噴公司方向

- [ ] **OpenFun 作為「公民科技基礎設施公司」的定位**
  - 從「憤怒開發者」到「讓社群夥伴更有力量」的轉變
  - 考慮建立一套可重用的公民科技 SaaS 基礎（如 middle2 當年的角色）

---

## 五、快速可做清單

這些是評估後覺得「用 AI 輔助，一兩個 session 就能做完」的事：

- [ ] twcompany 每日更新自動化（cron job）
- [ ] g0v-database 加入年份趨勢圖
- [ ] twcompany.md 補充內容農場、加值服務、社群論戰三段故事
- [ ] middle2.md 補充命名由來和基礎建設角色
- [ ] lyhub 功能盤點：目前實際上線了什麼、下一步是什麼
- [ ] 整理 openfunltd 50 個 repo 的狀態表

---

*最後更新：2026-04-03，整理自 ronny-github 回憶錄訪談 session*
