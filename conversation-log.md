# 開源回憶錄訪談對話紀錄

這是使用 Claude Code 建立個人開源回憶錄的完整對話過程。

---

## 使用者

我的 github repo 有 210 個 public repository，因為十幾年來參與 g0v 做了很多公民科技的開源專案，有的題目挑戰過很多次砍掉重練幾次（例如 pdf 資料抓取好像就寫了六七次，最後一次終於寫出一個很滿意的版本，後來也被很多人引用），有些可能是因為去 g0v 黑客松提案後做出來的工具，有些是 fork 別人的來改

我現在想要做一個我的過去回顧，把我這 210 個 public repostiroy 串成一個我的回憶錄，把每一個 repository 都變成一個故事（為什麼要做這個？成果在哪裡），變成一個我的開源成果網站，可以幫我規劃一下作法嗎

---

## Claude

很好，資訊都夠了。讓我寫出完整計畫。

---

## Claude

現在來建立 Astro 網站。

---

## Claude

現在加一個 `.gitignore` 並測試 build 能否通過（先不需要有故事內容）。

---

## Claude

Build 成功。接著設定 GitHub Actions。

---

## Claude

全部完成了。讓我確認一下最終的檔案結構：

---

## Claude

全部架構完成，build 測試通過。以下是你接下來的使用流程：

---

## 如何開始

### 第一步：準備環境變數

```bash
export GITHUB_TOKEN=ghp_xxxxx      # GitHub Personal Access Token（建議設定，避免 rate limit）
export ANTHROPIC_API_KEY=sk-ant-xxx # 必要
```

### 第二步：抓資料

```bash
npm run fetch-repos       # 抓 210 個 repo 清單 → data/repos.json
npm run fetch-readmes     # 抓所有 README → data/readmes/（有 GITHUB_TOKEN 快很多）
```

### 第三步：開始訪談（核心體驗）

```bash
npm run interview                        # 訪談下一個優先 repo（依 stars 排序）
npm run interview -- --repo pdf-parser   # 指定特定 repo
npm run interview -- --list              # 看目前進度
npm run interview -- --skip some-repo   # 跳過某個 repo
```

訪談流程：Claude 會根據 README 問你 3~5 個有針對性的問題 → 你逐題回答 → Claude 生成 300~500 字繁體中文故事 → 儲存到 `content/stories/`

### 第四步：預覽網站

```bash
npm run dev    # http://localhost:4321/ronny-github
```

### 第五步：部署

把這個 repo push 到 `github.com/ronnywang/ronny-github`，然後在 GitHub repo Settings → Pages → Source 選 **GitHub Actions**，之後每次 push 就會自動部署。

---

> 建議先從 stars 最多的 10~20 個 repo 開始訪談，讓網站先有內容能看，再慢慢補完剩下的。

---

## 使用者

請帶我一步一步來做吧

---

## Claude

好，我們從第一步開始——抓取你的 repo 清單。

先確認環境變數是否已設定：

---

## Claude

兩個環境變數都未設定。在繼續之前需要先設定它們。

**GITHUB_TOKEN**（可選但強烈建議）
沒有的話 GitHub API 每小時只能打 60 次請求，抓 210 個 repo 的 README 會卡住。

**ANTHROPIC_API_KEY**（必要）
訪談腳本需要呼叫 Claude API。

---

## Claude

好問題！其實有個更好的方式——**直接在 Claude Code 這個對話裡做訪談**，完全不需要 ANTHROPIC_API_KEY。

## 兩種方式比較

| | 在 Claude Code 對話中做 | 用腳本呼叫 API |
|---|---|---|
| 需要 ANTHROPIC_API_KEY | 不需要 | 需要 |
| 流程 | 告訴我「訪談 repo-name」，我問問題，你回答，我直接存檔 | 在終端機互動 |
| 品質 | 更高（我能看到完整脈絡） | 也可以 |
| 彈性 | 可以即時修改故事 | 較自動化 |

**推薦做法：在 Claude Code 裡直接進行訪談。**

流程是：
1. 先跑腳本抓 repo 資料（不需要任何 key）
2. 每次想做一個 repo，就叫我「訪談 [repo-name]」
3. 我讀資料、問問題、你回答、我寫故事存檔
4. 完全不需要額外的 API key

`interview.js` 這個腳本我可以改成純管理用途（列清單、標記跳過、看進度），把問答這塊交給我們的對話。

---

先來完成第一件事：抓 repo 清單。這只需要 GitHub Token 避免 rate limit，但沒有的話其實也能跑（只是比較慢）。

你要先去產生一個 GitHub Token 嗎，還是先不管 token 直接試跑看看？

---

## 使用者

請幫我評估沒有 github token 的話，是否可以先抓列表（只有210筆，應該兩三頁可以抓完，只需要兩三個 requests），而 README 的部份可以用 git clone 或是從 https://github.com/ronnywang/{repo} 直接讀取，這樣就不需要 token 了？

---

## Claude

評估如下：

**抓 repo 清單（API）：可以，完全沒問題**
- 210 筆 ÷ 100/頁 = 3 次 request
- 未認證限制 60次/小時，3 次根本不影響 ✓

**抓 README：用 `raw.githubusercontent.com` 最好**

| 方式 | 評估 |
|---|---|
| GitHub API `/repos/.../readme` | 210 次 API call，超過 60次/hr 限制 ✗ |
| `git clone` | 要 clone 整個 repo，210 個很重，而且慢 ✗ |
| 爬 `github.com/ronnywang/{repo}` | 違反 ToS，會被擋 ✗ |
| `raw.githubusercontent.com/ronnywang/{repo}/main/README.md` | **不走 API，走 CDN，沒有 rate limit 問題** ✓ |

Raw content URL 是最佳解。只需處理 `main` vs `master` branch 名稱差異，以及少數沒有 README 的 repo 回傳 404 的情況。

來把 `fetch-readmes.js` 改成用這個方式：

---

## Claude

改好了。現在直接跑第一步，不需要任何 token：

---

## Claude

3 次 request 就搞定了，211 個 repo（多了 1 個）。現在抓 README，這步會花幾分鐘：

---

## Claude

好主意！我先去抓那個 Google Sheets 資料，同時 README 在背景下載中。

Google Sheets 可以直接用 CSV export URL 抓：

---

## Claude

抓到了，1544 筆。來看看欄位結構和有哪些是 ronnywang 提案的：

---

## Claude

豐富資料！從 2012 年到 2021 年，找到約 30 筆 ronnywang 的提案，每筆都有簡報連結和影片連結。先把這份資料存起來：

---

## Claude

README 下載還在進行中（106/211）。趁這時候來寫一個腳本，把 g0v 黑客松資料跟 repo 做交叉比對：

---

## Claude

URL 精確比對只有 2 個，因為大部分提案用 hackpad 連結，不是直接 GitHub repo URL。來分析提案資料，找更多配對線索：

---

## Claude

還有 `ronnywang.github.io/{repo}` 和 `*.g0v.ronny.tw` 可以比對。來改進腳本：

---

## Claude

6 個精確比對了。你的建議很好——不要自動判斷，而是在訪談時把「這次的提案可能是哪一場黑客松」的候選選項**秀給你看**，再由你確認。這樣最準確。

來調整訪談流程的設計。我會修改 `interview.js`，讓它在訪談時顯示相關黑客松候選：

---

## Claude

README 下載還在跑（145/211）。趁這個機會，來把 `interview.js` 改成純管理工具——`--list`、`--skip`、`--stats`——把問答全部移到 Claude Code 這邊來做：

---

## Claude

系統運作正常。可以看到 `pdf-table-extractor` 是你 stars 最多的 repo（212 stars！），黑客松連結是日期鄰近比對，訪談時我會問你「這個是在哪場黑客松做的嗎？」來確認。

來確認 README 下載是否完成了：

---

## Claude

README 全部下載完成，**146 個有 README，65 個沒有**。

現在來整理一下目前的狀態：

```
211 個 repo
├── README 有：146 個
├── README 無：65 個
└── g0v 黑客松連結：38 筆提案（6 個 URL 精確比對）
```

---

## 準備好開始訪談了

所有資料都就位了，可以開始做第一篇故事。建議從你最有名的 repo 開始：

```
1. pdf-table-extractor  ★212  （你說這個是寫了很多次才滿意的版本）
2. company-graph        ★64
3. jobhelper           ★46
```

你想從哪一個開始？直接說「訪談 pdf-table-extractor」就可以了，我會秀出資料、問你問題、把故事存檔。

---

## Claude

README 下載任務完成，結果已確認：146 個有 README，65 個無 README，全部下載成功。

現在所有資料都備妥了，可以開始第一篇訪談。要從哪個 repo 開始？

---

## 使用者

就照你的順序來吧

---

## Claude

---

# 訪談：`pdf-table-extractor` ★212

**你說這個是 PDF 資料抓取寫了六七次後，「終於寫出一個很滿意的版本，後來也被很多人引用」——正是這個！**

基本資料：
- JavaScript，2016-04-16 建立，最後更新 2025-11-29（還在維護！）
- 212 stars、72 forks

黑客松配對是「日期鄰近」，配到了同一個月的「地址轉經緯度 API」提案，**應該不是同一件事**。

---

先問幾個問題，你慢慢回答就好（一題一題來）：

**Q1：這是你第幾次嘗試做 PDF 表格抓取？前幾次失敗或不滿意的原因是什麼？這次用了什麼不同的方法讓你覺得終於對了？**

---

## 使用者

確切次數我也不記得了，不過每一次嘗試都有留下 public repository ，所以也許你可以幫我看看有哪些 repo 名稱有包含 pdf 關鍵字，就有可能是之前的嘗試結果，之前不滿意是因為有些無法處理合併儲存格的案例，有些只能透過 php 或是終端機使用難以給別一般人使用，確切原因可能要一個一個查詢才能記得，也許你也可以幫我找找之前的 pdf 相關的 repo ，把他也變一個單獨的時間軸
最後這次我會滿意是因為他處理掉了合併儲存格，並且透過 javascript 純前端處理，因此人人都可以開瀏覽器直接使用，也可以透過 nodejs 在終端機大量執行

---

## Claude

很好找到了！`pdf-to-table` 的 README 直接寫著「此專案已停止維護，可改用 pdf-table-extractor」，還記錄了起源：

> **2014/2/22 台灣零時政府第柒次自由時代黑客松**，為了處理農委會農藥使用手冊所寫的 parser

所以有清楚的兩代演進：

| 時間 | repo | 語言 | 黑客松 | 問題 |
|------|------|------|--------|------|
| 2014-05 | `pdf-to-table` | PHP | 第7次（農藥手冊） | 只能 PHP 命令列，無法處理合併儲存格 |
| 2016-04 | `pdf-table-extractor` | JavaScript | — | 解決了！純前端可用、Node.js 批次皆可 |

---

繼續訪談：

**Q2：`pdf-to-table` 是在第 7 次黑客松為農委會農藥手冊做的，那 `pdf-table-extractor` 是怎麼觸發的？是又碰到新的資料需求，還是一直放在心裡想把這件事做好？** 

（另外確認一下：兩者之間你有沒有其他嘗試但沒有留 repo，或是有其他 repo 我沒找到的？）

---

## 使用者

沒有留 readme 的 pdf-table-cut, php-table-spitter 應該也是過去失敗的紀錄，也請幫我加入時間軸中，中間也有試過採用 tablue 或是一些其他工具，但因為沒 repo 就沒有紀錄了
最早的 pdf-to-table 觸發是農委會農藥手冊沒有錯，但是 pdf-table-extractor 怎麼啟動的我也忘了，可以給我準確的第一個 commit 的時間讓我來回想看看嗎

---

## Claude

GitHub API rate limit 用完了（因為之前抓 fork 來源時多打了幾十次）。不過最關鍵的資訊已經有了：

**第一個 commit：2016-04-16**，commit 訊息是 `add gitignore`（就是初始化專案）

這個時間點正好在**第 18 次黑客松（2016-03-15）的一個月後**。那次黑客松你做的是「地址轉經緯度 API」（`taiwan-address-lookup`），但 pdf-table-extractor 是同期建立的，可能是黑客松前後遇到的某個資料需求觸發的。

同時，PDF 相關 repo 的時間軸已經可以整理出來了：

| 時間 | repo | 語言 | 背景 |
|------|------|------|------|
| 2013-05 | `php-table-splitter` | PHP | — |
| 2014-05 | `pdf-to-table` | PHP | **第 7 次黑客松**，農委會農藥手冊 |
| 2016-04 | `pdf-table-extractor` | JavaScript | **最終版**，212 stars |
| 2023-07 | `pdf-table-cut` | — | 後續衍生工具 |

還有中間試過 Tabula 等工具但沒留 repo 的過程。

---

**Q2（接續）：** 2016-04-16 這個日期，加上前一個月剛做了第 18 次黑客松——看到這個日期，你記得起來當時是為了什麼資料來源才重新動手做 PDF 抓取嗎？

---

## 使用者

我好像不太記得當初是為了什麼資料來源而做的，目前查 g0v slack 的對話紀錄（https://g0v-slack-archive.g0v.ronny.tw/index/channel/C02G2SXKX/2016-04#ts-1460795723.001656） 我好像也只有在完成貼了一句「這一次終於搞出很滿意的 PDF 轉表格函式了 XD」，但沒提到我是為了什麼。不然原因就先幫我留空，等我之後找到再說，我也會去找找那個日期臉書或是其他軟體的對話紀錄，看看能不能找到，我們先問其他問題吧

---

## Claude

等等，你找到了 Slack 存檔連結！讓我去看看那個時間點前後的對話，也許上下文有線索：

---

## Claude

頁面似乎依日期分頁，但 archive 站的結構讓我無法跳到精確那天。不過你已經記得那則訊息了：**「這一次終於搞出很滿意的 PDF 轉表格函式了 XD」**——這已經夠用了，原因等你之後想起來再補。

繼續下一個問題：

**Q3：`pdf-table-extractor` 後來被很多人引用——你有印象哪些專案或人用了它？有沒有哪個印象深刻的案例，例如有人來開 issue、或你在某個地方發現有人在用？**

---

## 使用者

有被人包成 npm module ，並且因為有被一些資料處理軟體引用，因此他現在在 npm 上面的下載量也很驚人，到現在每週下載人數還是很高，也很多人會在 stackoverflow 或是 blog 推薦這個解決方案，也很多人主動送 pull request  來更新內容或版面設計

---

## Claude

讓我去查一下 npm 的實際數字，數據會讓故事更有力：

---

## Claude

數據很強！

- **每週下載：~1,500 次**
- **每月下載：~7,000 次**
- **近 18 個月總計：90,315 次**（npm API 只能查到這個範圍）

還在持續成長中，2016 年到現在快 10 年了還有這個量。

---

資料收集得差不多了，現在幫你把這篇故事寫出來。PDF 抓取的演進時間軸我也一起整合進去：

---

## Claude

寫好了，給你看一下：

---

**PDF 表格抓取的最終解：pdf-table-extractor**

政府公開資料最惱人的形式，大概就是 PDF 裡的表格。看得到、複製不了，或者複製出來全是亂碼。做台灣開放資料的這幾年，我一次又一次撞上這堵牆。

最早的嘗試是 2014 年，在第 7 次 g0v 黑客松上。當時要處理農委會的農藥使用手冊——一份用藥資訊密密麻麻塞在 PDF 表格裡的文件。我用 PHP 寫了 `pdf-to-table`，靠著 smalot/pdfparser 把文字座標抓出來，再用 Y 軸偏移量判斷換行。勉強能跑，但只能在命令列裡使用，而且一碰到合併儲存格就破功。中間還試過 Tabula 等現成工具，都不能完整滿足需求。`php-table-splitter`、`pdf-table-cut` 這幾個 repo，也都是那段時期留下的嘗試痕跡。

2016 年 4 月，我重新動手。這次換成 JavaScript，讓整個解析邏輯跑在瀏覽器前端。核心突破有兩個：第一，終於把合併儲存格處理對了；第二，不再需要安裝任何環境，任何人打開瀏覽器就能直接貼上 PDF 連結來用……

（後面還有關於 npm 下載量、社群反應的段落）

---

有任何想修改的地方嗎？確認 OK 後我們繼續下一個——`company-graph`（★64）。

---

## 使用者

喔喔，我現在好像想起來了，剛好當時好像正在開發「求職小幫手」這個專案（代碼 jobhelper），他在做的事是把各縣市勞工局公布的違反勞基法的公告收集起來，讓查找違法公司更快速，因為有些縣市是透過 PDF 公布資料，當時才想開發 pdf-table-extractor 來處理勞基法資料，所以這樣兩個專案就被串起來了

---

## Claude

這個連結太有價值了！讓我快速確認一下時間對不對：

---

## Claude

時間完全吻合！

- `pdf-table-extractor` 建立：**2016-04-16**
- `jobhelper-backend` 建立：**2016-05-02**（16 天後！）

而原版 `jobhelper`（Chrome Extension）早在 2013 年就有了，2016 年是在重新開發後端版本，為了處理各縣市勞工局用 PDF 發布的違法公告，才觸發了 pdf-table-extractor 的誕生。兩個專案完全串起來了。

來更新故事，把這個背景補進去：

---

## Claude

完整的故事脈絡現在是這樣：

```
2013 農委會農藥手冊（第7次黑客松）
  → pdf-to-table（PHP，有合併儲存格問題）
  → php-table-splitter、pdf-table-cut 等嘗試
  → 試過 Tabula 等工具

2016-04 要收集各縣市勞工局「違反勞基法公告」
  → 有些縣市用 PDF 發布
  → pdf-table-extractor（JavaScript，終於解決了！）
  → 16 天後 jobhelper-backend 跟著完成
```

這樣兩個 repo 的故事就有了互相呼應的關係，訪談時可以交叉引用。

這篇故事確認 OK 嗎？要繼續下一個 repo，還是先把 `jobhelper` / `jobhelper-backend` 也一起做了，趁記憶正熱？

---

## 使用者

好，我們先來做 jobhelper 吧

---

## Claude

部落格連結壞了，不過我找到一個有意思的關連：

---

## Claude

資料很豐富，背景已經很清楚了：

- **`LSA-CSV`（2013-04-01）**：收集各縣市違反勞基法公告名單的 CSV 資料集，README 說「多數縣市資料更新後舊資料就無法被搜尋檢索」——你在幫政府留存歷史紀錄
- **`jobhelper` Chrome Extension（2013-03-23）**：正好是第 2 次黑客松當天
- **`jobhelper-backend`（2016-05-02）**：三年後重新動工
- **第 28 次黑客松（2018-01-13）**：再次提案

---

# 訪談：`jobhelper` × `jobhelper-backend`

**Q1：jobhelper 最初的想法是什麼？是在第 2 次黑客松現場起頭的嗎？還是那天是提了別的案（建築使用執照），jobhelper 是另外的動機？**

---

## 使用者

blog 連結因為 https 憑證的關係無法讀取，你可以試著透過 curl 抓取略過憑證錯誤看看嗎

---

## Claude

抓到了！讓我讀完整內容：

---

## Claude

部落格全文抓到了！非常精彩，有很多重要細節：

**起源不是 g0v 黑客松，而是 Open Data Day（2013-03 月）**，然後 2 天後寫了這篇部落格文章。

最關鍵的一段（你當年自己寫的）：

> 「各勞工局公開方式不同，**有寫在網頁上、有 PDF**」

**2013 年就看到 PDF 問題了**，但當時解決不了，所以求職小幫手一直停在「有殼沒有資料」的狀態。三年後 2016 年做出 `pdf-table-extractor`，才真正打通這個死結。

整個故事弧線非常完整，我現在有足夠的資料可以直接把故事寫出來了：

---

## Claude

寫好了。這篇故事的核心是一個很動人的弧線：

**2013 年看到問題 → 卡在 PDF 三年 → 2016 年解決 PDF → 求職小幫手復活**

而且這兩個 repo 的故事現在互相呼應：`pdf-table-extractor` 說「為了 jobhelper 才重新動手」，`jobhelper` 說「PDF 問題擱置了三年，直到 pdf-table-extractor 才解開」。

這篇可以，還是有什麼要調整的？

---

## 使用者

https://docs.google.com/spreadsheets/d/1dL6_ulpjMQyBTulh946i4QcHlu8vL8VVUJ8S4odn6UM/edit?gid=0#gid=0
這邊是 2013年opendata day 的提案網址，也可以把這個網址放進故事中當作參考

---

## Claude

找到了！第 4 號提案，Ronny Wang，當天簡報用的是 `http://company.g0v.ronny.tw/`（商業司公司資料），關鍵字是「勞資資訊對稱」。

把連結和這個背景補進故事：

---

## Claude

更新好了。順帶一提，從提案表格裡有個有趣的細節：你當天 demo 的連結是 `company.g0v.ronny.tw`，可見「公司資料查詢」跟「求職小幫手」在概念上是連在一起的——勞基法違法名單＋商業司公司資料，組合起來就是勞資資訊對稱的完整圖像。

---

目前完成了三篇：
- ✓ `pdf-table-extractor`
- ✓ `jobhelper`（含 `jobhelper-backend` 的故事脈絡）

`jobhelper-backend` 要單獨再寫一篇嗎，還是就讓它從 `jobhelper` 的故事裡被帶到就好？繼續的話，下一個是 `company-graph`（★64）。

---

## 使用者

求職小幫手還可以講更多，因為他有上電視媒體，甚至中天新聞還有因此把我稱為「佛心工程師」

---

## Claude

讓我去找那則新聞：

---

## Claude

找到了！而且不只中天，連民視也報了。來把兩則都抓下來：

---

## Claude

中天：`https://www.youtube.com/watch?v=oYwyr5BUNF8`（20130414 佛心工程師求職程式 揭露血汗工廠）
民視：`https://www.youtube.com/watch?v=2KvPG-xIThU`（佛心求職程式 揪黑心血汗公司）

兩則都是 2013 年 4 月，距離 Open Data Day 提案只過了三週就上了電視。來把媒體這段補進故事：

---

## Claude

現在這篇故事的結構是：

**Open Data Day 提案 → 三週後上電視（中天＋民視）→ 卡在資料問題三年 → 2016 年 pdf-table-extractor 解開 → 求職小幫手後端復活 → 2018 再次黑客松提案**

這樣豐富多了。有上電視還被封「佛心工程師」，這是很難得的故事細節，日後看這篇會很有感。

還有什麼要補充，還是這篇可以了，繼續下一個？

---

## 使用者

其實中間沒有卡資料問題三年，中間我都是用工人智慧清理資料，後來是因為想要降低人力成本，才開發了 pdf-table-extractor

---

## Claude

重要更正！把故事改對：

---

## Claude

改好了。故事的核心邏輯現在是：

**工具沒有停擺 → 靠工人智慧維持運作 → 想降低人力成本 → 才去解決 PDF 問題**

這比「卡住三年」更真實，也更符合你的做事方式——遇到問題不是放棄，而是先用人力頂著，再找機會自動化。這個細節其實很能說明公民科技做事的韌性。

這篇可以了嗎？

---

## 使用者

另外也附上 20130803 coscup 分享求職小幫手的演講連結 https://docs.google.com/presentation/d/1jmZnPD_qHqnjTdvwr5D264_uYaPwr8CSPHzq-YuP62o/edit?slide=id.p#slide=id.p
和 20171223 科技業站出來團結日 的演講連結，這些連結也可以幫我放進去

---

## Claude

第二個連結你沒貼上來，讓我先搜一下，同時看看 COSCUP 簡報的內容：

---

## Claude

YouTube 搜不到影片。第二個簡報連結你剛貼過來了，把兩個簡報都直接放進故事：

---

## Claude

補進去了。這篇故事現在的完整時間線是：

| 時間 | 事件 |
|------|------|
| 2013-03 | Open Data Day 提案，三週後中天、民視報導「佛心工程師」 |
| 2013-08 | COSCUP 演講分享 |
| 2013～2016 | 工人智慧維持資料更新 |
| 2016-04 | pdf-table-extractor 做出來，自動化降低人力 |
| 2016-05 | jobhelper-backend 建立 |
| 2017-12-23 | 科技業站出來團結日演講 |
| 2018-01 | 第 28 次 g0v 黑客松再次提案 |

這篇可以了嗎？

---

## 使用者

好，這篇就先這樣，我想到其他的再補進來

---

## Claude

好，故事隨時可以補充，直接告訴我就行，我幫你更新檔案。

目前進度：
- ✓ `pdf-table-extractor`（★212）
- ✓ `jobhelper`（★46）

下一個按優先順序是 `company-graph`（★64），要繼續嗎？

---

## 使用者

我可以先看看現在的成果網站嗎

---

## Claude

網站已啟動，請打開瀏覽器前往：

**http://localhost:4321/ronny-github**

有三個頁面可以看：
- **首頁** `/ronny-github/` — 統計卡＋精選故事
- **時間軸** `/ronny-github/timeline` — 依年份排列
- **主題分類** `/ronny-github/topics` — 依語言和 topic 分群

點進去每篇故事也可以看完整內文和相關 repo 推薦。

看完有什麼想調整的地方（排版、顏色、欄位等）都可以說。

---

## 使用者

jobhelper 可以補充一個，在 https://www.mol.gov.tw/1607/1632/2665/13507/post 2017年12月29日勞動部終於推出統一公布平台，不需要再人力收集整理各縣市資料，當初做 jobhelper-backend 也是為了利用群眾協力整理資料

---

## Claude

抓到了，正式名稱是「**違反勞動法令事業單位（雇主）查詢系統**，106年12月29日正式上線**」。把這個收尾段補進故事：

---

## Claude

補好了。這個結尾很有力——2013 年你先做，2017 年政府跟上，這是公民科技最理想的結局之一：**用行動倒逼政府把事情做好**。

繼續 `company-graph`（★64）嗎？

---

## 使用者

好，我們來開始 company-graph 吧，他跟 twcompany 是一起的

---

## Claude

`ronny.tw/data` 這頁超有用！這是你作品的完整目錄，先把它存起來，之後訪談其他 repo 可以直接引用：

---

## Claude

存好了。現在來看 company-graph 的完整背景——從 data 頁可以看出兩個 repo 的關係：

- **`twcompany`**（台灣公司資料）= 後端，爬經濟部商業司，月更新，含公司名單、資本額、董監事名單
- **`company-graph`**（台灣公司關係圖）= 前端，把董監事名單轉成圖，輸入統一編號就能看公司關係網路

---

# 訪談：`company-graph` × `twcompany`

**Q1：company-graph 建立於 2014-01-10，正好在第 6 次黑客松（2013-12-21）的 20 天後——你是在那次黑客松上提案的嗎？還是這個想法更早就有了？當初是什麼情境下想到要把公司董監事關係畫成圖的？**

---

## 使用者

先另外提一下我在 2023 年成立了歐噴有限公司，有些新的開源故事就發生在歐噴有限公司內了，你也可以幫我抓一下 https://github.com/openfunltd/ 的 public repo 下來

---

## Claude

`twcompany` 在 openfunltd 帳號下，**★170**！而且這個帳號有 50 個 repo，包含很多 2023-2025 年的新作品。先全部存起來：

---

## Claude

也幫你抓一下 openfunltd 的 README：

---

## Claude

很好。`twcompany`（★170）原來一直在 openfunltd 帳號下，而且 2012 年就建立了，比 `company-graph` 還早。

先把這件事記下來：

---

## Claude

存好了。現在整體資料規模：
- **ronnywang** 個人帳號：211 個 repo
- **openfunltd** 公司帳號：50 個 repo（含 twcompany ★170）

回到訪談，現在有了 `twcompany` 的完整背景——它 2012-12 就建立了，比 `company-graph`（2014-01）早了一年多，是先有公司資料庫才有關係圖的。

**Q1：`twcompany` 是在 2012 年底就開始爬經濟部商業司資料了，這麼早——是什麼動機讓你想建這個資料庫？是為了某個具體應用，還是覺得「這份資料應該要開放」而先把它存起來？**

---

## 使用者

https://docs.google.com/presentation/d/1BoDNXKL2kRUPKwH8LjU9wYxN2LskXTTnz84UA2jRURM/edit?slide=id.g52ef4640e_087#slide=id.g52ef4640e_087
這邊有一個 2014-11-21  我去交大統研所演講的投影片，裡面有提到台灣公司資料的故事是「因為塑化劑事件，想抵制統一集團」，可以幫我抓下來參考一下嗎

---

## Claude

完整投影片內容抓到了！故事脈絡非常清楚，而且這份演講把你所有作品的起源串在一起：

```
hTC 無年終（2013/2）→ 勞基法違法名單 → 求職小幫手
塑化劑事件        → 想抵制統一集團 → 台灣公司資料 → 公司關係圖
飛魚卵            → 12 月進口飛魚卵？→ 關務署進出口資料
蘭嶼用電爭議      → 真的嗎？        → 家戶用電資料
三星新聞刪除事件  → 新聞被修改刪除  → NewsDiff
```

每個專案背後都有一個「等等，這件事是真的嗎？」的疑惑！現在來寫故事了：

---

## Claude

寫好了。這篇故事的核心句是：

> 「一個從『我想知道哪些東西不能買』開始的疑惑，最後變成台灣公司關係透明化的基礎設施。」

`twcompany` 的故事也一起包含在內了（兩個 repo 合為一篇，就像 `jobhelper` 和 `jobhelper-backend` 那樣）。

這篇有沒有什麼要補充或修改的？

---

## 使用者

也補充一個我今年1月分享的小故事，公司資料從2013年到現在，每天是我人工不間斷手動下指令啟動爬蟲更新資料的，可以參考 https://www.facebook.com/ronny.wang.tw/posts/pfbid02RqEiSbKtkj9Qy56SFprfAujyW1gtQJqCS6XqVUG5TFxQgfcuuRNKixcVtyXG3xuPl

---

## Claude

Facebook 有防爬蟲，但開頭抓到了一段文字：

> **「講一個多年來的小秘密 我維運了幾個開放資料查詢平台，像是 2013 年起的台灣公司資料和 2017...」**

後面被截斷了，但已知道故事的大意。把你說的內容補進去：

---

## Claude

補好了。這個細節非常有力——十幾年每天手動下指令，沒有一天中斷。這跟 jobhelper 的「工人智慧」形成一個呼應：你不是因為無法自動化，而是選擇了這種方式持續維運，直到某個契機才改變。

這篇可以了嗎，還是有其他要補充的？

---

## 使用者

我直接來貼全文
講一個多年來的小秘密
我維運了幾個開放資料查詢平台，像是 2013 年起的台灣公司資料和 2017 年起的開放標案資料，這麼多年來他每日持續更新最新資料，讓大家都可以查到最新資料
這麼多年來，這個每日更新其實是我每天不間斷手動執行的 XD
我每天早上起床第一件事，就是開啟電腦，然後連入伺服器，進入 screen 後在兩個視窗，按下「上」「enter」重覆執行昨天執行的指令，就開始了今天的爬蟲和資料更新作業，大概每天花我 30 秒鐘左右。
剛開始一直想找機會把他自動化，但是覺得要把他自動化可能需要花半個小時到一個小時（因為不是純粹重覆前一日指令，而是也要把抓取失敗的資訊要想辦法通知我，讓我確認是否要調整爬蟲，以免自動化後結果某天突然失敗了幾天都沒發現），就一直覺得每天只花 30 秒時間的事好像會懶得花一個小時把他解決掉。
到後來，這個每日更新已經變成一個我的儀式，每天早上起床當我打開電腦，進去執行了今天的指令，就象徵著我今天開始了。
而且這個每日更新也成為了一個我還活著的證明，之前單身一人住的時候，有時候會想說如果我在家默默離世，第一個被大家發現我離開的原因可能是因為公司資料和標案資料停止更新了 XD
最近歐噴公司因為最近有越來越多計畫需要更多爬蟲，已經不太可能每個都是手動執行了，因此我最近建了一套歐噴公司爬蟲的基礎建設，盡可能讓各爬蟲都自動化，我一直在煩惱公司的爬蟲和標案的爬蟲是否也要加入這個自動化機制中，感覺如果這兩個更新工作被自動化了，我的早上會突然失去一個起床的儀式 XD

---

## Claude

這段文字太好了，原文的溫度和細節遠比我能改寫的更動人，直接保留你的聲音：

---

## Claude

完美。這段文字本身就是最好的故事，不需要任何改寫。

「還活著的證明」這句話，和前面「想知道哪些東西不能買」的出發點放在一起，讓這個技術專案有了非常人性的重量。這篇是目前四篇裡我最喜歡的一篇。

繼續下一個嗎？

---

## 使用者

雖然 twcompany 我還有很多細節故事可以分享，例如被內容農場拿去架站，被發票小幫手和 simpany 接去加值使用者，打包檔公開有在 g0v 社群曾引起一片論戰等，不過我想先求廣再求精，你幫我記著有這些小故事細節，我們先多放一些專案，之後再來回頭把這些小故事補齊

---

## Claude

記下來了，之後補充用：

---

## Claude

記好了，之後說「補充 twcompany」我就知道要找這三個故事。

目前完成四篇：`pdf-table-extractor`、`jobhelper`、`company-graph`、加上 `twcompany` 骨架。

按照 `--list` 的優先順序，接下來是：

| repo | stars | 說明 |
|------|-------|------|
| `twcompany`（openfunltd）| ★170 | 已含在 company-graph 故事中 |
| `PHPMemcacheSASL` | ★44 | PHP Memcache SASL support |
| `twgeojson` | ★47 | 行政區域疆界 |
| `realprice` | ★40 | 實價登錄資料備份 |
| `newsdiff` | ★25 | 新聞被修改刪除追蹤 |
| `pcc.g0v.ronny.tw`（openfunltd）| ★31 | 標案資料 API |

`newsdiff` 在交大演講投影片裡有提到（三星新聞刪除事件），背景已很清楚。`pcc` 是標案資料，跟公司資料的「每日儀式」在同一篇 FB 貼文裡被提到。

你想從哪個繼續？

---

## 使用者

故事的標題可以用 「求職小幫手」取代「jobhelper」，「台灣公司資料」取代「company-graph」嗎？這樣更有故事標題感

---

## Claude

改好了。現在網站卡片上顯示的標題會是：

- `jobhelper` → **求職小幫手**
- `company-graph` → **台灣公司資料**
- `pdf-table-extractor` → **PDF 表格抓取的最終解：pdf-table-extractor**（這個要改嗎？）

---

## 使用者

pdf 也改，但講最終解我覺得太 over ，就用 PDF 資料抓取就好，還是你有建議什麼標題嗎

---

## Claude

有幾個選項：

1. **PDF 資料抓取**（你的建議，簡潔）
2. **PDF 轉表格**（更短）
3. **終於搞出很滿意的 PDF 轉表格**（直接引用你當年在 Slack 說的那句話，有點個性）

我比較喜歡第 3 個——引用原話的標題讀起來有溫度，而且「終於」兩個字本身就說完了這個專案多次嘗試的故事。你覺得呢？

---

## 使用者

我覺得先簡潔好了，因為其實也不完全滿意，其實 pdf-table-extractor 還有很多進步空間

---

## Claude

改好了。三篇標題現在都是：

- **PDF 資料抓取**
- **求職小幫手**
- **台灣公司資料**

簡潔、有識別感，而且保留了「未完成」的誠實感——工具還在繼續改進，故事也還沒結束。

繼續下一個 repo？

---

## 使用者

好，下一個

---

## Claude

`PHPMemcacheSASL` 看起來是一個純技術 library，故事感比較薄；`twgeojson` 更有料——建立於第零次 g0v 黑客松前一天（2012-11-29），跟「人口等資訊地圖化」提案連在一起，而且台灣行政區界 GeoJSON 這份資料後來被非常多專案引用。

---

# 訪談：`twgeojson`

這個 repo 是 2012 年 11 月底建的，正好是**第零次 g0v 黑客松（2012-12-01）的前兩天**，你的提案是「人口等資訊地圖化」。

**Q1：`twgeojson` 是為了那次黑客松準備的資料，還是更早就有這個需求？把政府的行政區界資料轉成 GeoJSON 格式，當時這件事有多麻煩——政府原始資料是什麼格式，轉換過程卡在哪裡？**

---

## 使用者

twgeojson 就是為了那次 g0v 黑客松而準備的，當時政府資料格式是 shapefile ，但是對於 web 出身的工程師根本不知道該如何使用這種格式，因此花心力研究把他轉成 geojson ，並且把他開源希望讓大家更容易用到，也開啟了我對 gis 的研究，後面也很多專案開始會引入 gis

---

## Claude

資料夠了，直接寫：

---

## Claude

寫好了。短、乾淨，把「Web 工程師遇到 Shapefile」這個具體障礙說清楚，收尾點出這是你 GIS 旅程的起點。

這篇 OK？繼續下一個嗎？

---

## 使用者

好，下一個

---

## Claude

這個是 2011 年純技術的 PHP library，跟公民科技比較無關，建議跳過。下一個有故事感的是 `realprice`：

---

## Claude

# 訪談：`realprice`

建立於 2012-10-19，距離**實價登錄制度正式上路（2012 年 8 月）只有兩個月**。README 還提到爬蟲需要手動輸入驗證碼（用 jp2a 把 CAPTCHA 圖片轉成 ASCII 印在 terminal 上）。

**Q1：實價登錄 2012 年 8 月才剛上線，你 10 月就動手爬了——當時的動機是「房價資訊應該要公開」，還是有具體想用這份資料做什麼？而且政府當時有提供下載，為什麼還需要爬蟲？**

---

## 使用者

https://ronny.wang/blog/posts/31391515 可以參考這篇 blog 文

---

## Claude

關鍵細節出來了：**內政部把總價和門牌改成圖片**——政府主動把關鍵欄位藏進圖片，讓爬蟲失效。然後你在洗澡時想到解決方式。這個轉折很好。

資料夠了，直接寫：

---

## Claude

寫好了。這篇的核心節奏是：動手爬 → 政府擋路 → 洗澡想到解法 → 爬完，最後還附上一個資料使用的小提醒，展示了你做資料的細心。

這篇 OK？繼續下一個嗎？

---

## 使用者

可以幫我確認一下，這個是我第一個跟 open gov data 有關的 public repostory 嗎？

---

## Claude

**是的，`realprice`（2012-10-19）就是你第一個跟政府開放資料有關的 public repo。**

在它之前的都是：

- `Angry-Bird-Chrome-Recorder`、`drawsomehack`——玩具性質
- `pixnetapi`、`pixframework`——痞客邦工作相關
- `PHPMemcacheSASL`——純技術 library
- `ptthot`——PTT 熱門記錄（資料收集，但不是 gov data）

`realprice` 是分水嶺，之後 2012 年 11 月一口氣出現 `TWLegislativeYuanData`、`postcode`、`twopendata`、`twgeojson`、`twmap`——整個爆發開來，正好就是衝著第零次 g0v 黑客松（2012-12-01）去的。

可以在故事裡加上這個意義：

> 「這是我第一個跟政府開放資料有關的專案，也是後來一連串公民科技工作的起點。」

要補進去嗎？

---

## 使用者

好，請幫我補一下，因為實價登錄專案讓我開始對 open gov data 感興趣，後面才有機會參與 g0v 第零次黑客松，開始了這十幾年的旅程

---

## Claude

補好了。這篇現在有了明確的「起源」意義——不只是一個爬蟲專案，而是整段旅程的第一步。繼續下一個嗎？

---

## 使用者

好，下一個故事

---

## 使用者

This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

Summary:
1. Primary Request and Intent:
   User (ronnywang) wants to create a personal open-source memoir website showcasing their 211 public GitHub repositories (ronnywang account) plus 50 repos from openfunltd (歐噴有限公司, founded 2023). Each repo should become a "story" with background context (why built, outcomes). The site should have both a timeline view and topic/category view, deployed to GitHub Pages. The interview process happens in Claude Code chat (no ANTHROPIC_API_KEY needed) — Claude reads repo data, asks questions, user answers, Claude writes and saves the story file directly.

2. Key Technical Concepts:
   - **Astro** static site generator + Tailwind CSS for the website
   - **GitHub API** for repo list (3 requests for 211 repos, no auth needed)
   - **raw.githubusercontent.com** for READMEs (CDN, no rate limit, no auth needed)
   - **g0v hackathon CSV** cross-referenced with repos by URL match and date proximity
   - **openfunltd GitHub org** — 50 public repos including twcompany (★170)
   - **Story format**: Markdown with YAML frontmatter (repo, title, date, topics, stars, etc.)
   - **Interview workflow**: Claude Code reads data files, asks targeted questions in chat, writes story to `content/stories/{repo}.md`
   - **GitHub Actions** for automatic deployment to GitHub Pages on push to main

3. Files and Code Sections:
   - **`package.json`**: `type: "module"`, scripts: fetch-repos, fetch-readmes, interview, dev, build, preview. Dependencies: @anthropic-ai/sdk (kept but not used for interviews), astro, @astrojs/tailwind, tailwindcss
   - **`scripts/fetch-repos.js`**: Fetches all public repos from GitHub API (paginated, 100/page), enriches forks with parent info, saves to `data/repos.json`
   - **`scripts/fetch-readmes.js`**: Uses `raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md` (tries main→master→develop→gh-pages), no rate limit issues. Saves to `data/readmes/{repo}.md`. Result: 146 with README, 65 without.
   - **`scripts/link-hackathons.js`**: Cross-references g0v hackathon CSV with repos. Matches by: (1) github.com/ronnywang/ URLs, (2) ronnywang.github.io/{repo} URLs, (3) {repo}.g0v.ronny.tw domains, (4) date proximity (±180 days). Saves to `data/hackathon-links.json`. Result: 6 URL matches, ~195 date proximity candidates.
   - **`scripts/interview.js`** (management only, no API calls): Commands: `--list` (pending repos by stars), `--list --all`, `--stats`, `--skip REPO`, `--unskip REPO`, `--info REPO` (shows full context including hackathon candidates for Claude to use during chat interview)
   - **`astro.config.mjs`**: `site: 'https://ronnywang.github.io'`, `base: '/ronny-github'`, integrations: tailwind
   - **`src/lib/stories.js`**: `getAllStories()`, `getStoryBySlug()`, `getAllTopics()`, `groupByYear()` — reads from `content/stories/*.md`, parses frontmatter manually (no external YAML parser)
   - **`src/layouts/BaseLayout.astro`**: Nav with 時間軸/主題分類/GitHub links, Noto Sans TC font
   - **`src/components/RepoCard.astro`**: Shows repo name, title, year, stars, summary, topics, fork badge. Supports `compact` prop.
   - **`src/pages/index.astro`**: Stats cards (stories count, stars, year range, topics count), featured stories (★≥5), recent stories grid
   - **`src/pages/timeline.astro`**: Grouped by year descending, grid layout per year
   - **`src/pages/topics.astro`**: Quick nav + sections per topic, auto-generated from topics + language fields
   - **`src/pages/repo/[slug].astro`**: Full story page with metadata, links, related repos
   - **`.github/workflows/deploy.yml`**: Build on push to main, upload dist/ as Pages artifact, deploy
   - **`data/repos.json`**: 211 repos from ronnywang account
   - **`data/openfunltd-repos.json`**: 50 repos from openfunltd org
   - **`data/g0v-hackathons.csv`**: 1544 rows of g0v hackathon proposals
   - **`data/hackathon-links.json`**: repo→hackathon cross-reference
   - **`data/ronny-data-page.txt`**: Content of ronny.tw/data (200 lines, catalog of all data projects)

   **Story files in `content/stories/`:**

   - **`pdf-table-extractor.md`**: title "PDF 資料抓取", ★212. Story: Agricultural pesticide manual (7th hackathon, 2014) → php-table-splitter, pdf-to-table → manual data cleaning for jobhelper-backend → 2016 rebuilt in JS to reduce labor costs → handles merged cells, pure frontend → "終於搞出很滿意的 PDF 轉表格函式了 XD" → npm ~1500 downloads/week, 90K+ in 18 months
   - **`jobhelper.md`**: title "求職小幫手", ★46. Story: Open Data Day 2013-03, labor law violations data (2011 amendment), Chrome Extension, 3 weeks later 中天/民視 news "佛心工程師", challenges: PDF format data from some bureaus → manual (工人智慧) for years → 2016 pdf-table-extractor reduced labor → jobhelper-backend rebuilt → COSCUP 2013-08 talk, 科技業站出來團結日 2017-12-23 talk, g0v 28th hackathon 2018-01. Ministry of Labor launched unified platform 2017-12-29.
   - **`company-graph.md`**: title "台灣公司資料", ★64. Story: 2011 塑化劑/統一集團 boycott → twcompany (2012-12, ★170 in openfunltd) scrapes 商業司 monthly → company-graph (2014-01) visualizes director relationships → Gilbert Liu 黨營事業研究 use case. FB post secret: 2013-2025 manually running crawlers every morning (30 seconds, press up+enter) as daily ritual, "proof I'm still alive". Pending side stories: content farm copying, 發票小幫手/simpany adoption, g0v community debate about data packaging.
   - **`twgeojson.md`**: title "台灣行政區界 GeoJSON", ★47. Story: For g0v 0th hackathon (2012-12-01), government data was Shapefile format, web engineers couldn't use it, converted to GeoJSON at multiple precision levels, opened author's GIS journey.
   - **`realprice.md`**: title "實價登錄", ★40. Story: First open gov data repo (2012-10-19). Real price registration system launched 2012-08, no bulk download. Scraped 41,078 records. Mid-way government changed price/address fields to images — thought of workaround in shower (jp2a for ASCII captcha). Notes data trap: unit price includes parking. This was the starting point of entire civic tech journey → led to g0v 0th hackathon.

   **Memory files:**
   - `/Users/wangxiangrong/.claude/projects/.../memory/MEMORY.md`
   - `/Users/wangxiangrong/.claude/projects/.../memory/project_openfunltd.md`
   - `/Users/wangxiangrong/.claude/projects/.../memory/project_twcompany_todos.md` — pending: content farm, 發票小幫手/simpany, g0v論戰
   - `/Users/wangxiangrong/.claude/projects/.../memory/user_profile.md`

4. Errors and fixes:
   - **GitHub API rate limit**: Hit 60 req/hr limit when trying to fetch early commits of pdf-table-extractor. No fix possible without token; worked around by using first commit date already retrieved.
   - **fetch-readmes.js original used GitHub API**: Replaced with raw.githubusercontent.com CDN approach — no rate limit, tries multiple branch names (main/master/develop/gh-pages) and README filename variants.
   - **interview.js originally called Anthropic API**: User asked if ANTHROPIC_API_KEY was necessary. Redesigned: removed all API calls from script, interview now happens entirely in Claude Code chat. Script became management-only tool.
   - **Facebook post scraping**: FB blocks scrapers. Partial content retrieved from page source (first ~150 chars of post visible). User then pasted full post text directly.
   - **Blog TLS certificate**: `ronny.wang` has invalid SSL cert. Fixed with `curl -sk` (skip verification).
   - **Google Slides export**: Used `/export/txt` URL pattern successfully.
   - **Slack archive**: Couldn't reach specific date pages (always returned April 1-11 content). Accepted partial context from user's memory.
   - **Story title feedback**: User said "最終解" in pdf-table-extractor title was "too over" → changed to "PDF 資料抓取". User also changed jobhelper→"求職小幫手", company-graph→"台灣公司資料".
   - **Story factual correction**: Draft said "stuck for 3 years due to PDF problem" for jobhelper. User corrected: they used 工人智慧 (manual labor) throughout, and built pdf-table-extractor to *reduce* that labor cost — not because they were blocked.

5. Problem Solving:
   - Cross-referencing 211 repos with 38 g0v proposals: achieved 6 URL exact matches + date proximity for candidates. User confirmed during interview rather than automated matching.
   - Finding twcompany: not in ronnywang's 211 repos — discovered it was transferred to openfunltd org (★170).
   - Reconstructing story context from multiple sources: blog posts, Slack archives, Facebook posts, Google Slides, hackathon CSV, ronny.tw/data page.

6. All user messages:
   - Initial: Wants memoir site for 210 public repos, 10+ years of g0v civic tech work
   - GitHub: ronnywang; Story: AI asks questions, user answers, AI generates; Style: both timeline and topics; Deploy: GitHub Pages
   - Suggested no ANTHROPIC_API_KEY needed, use Claude Code chat for interviews; asked about pros/cons
   - Evaluated: repo list = 3 API requests (fine), READMEs = use raw.githubusercontent.com (no rate limit)
   - Provided g0v hackathon spreadsheet URL for cross-referencing with repo creation dates
   - Suggested date proximity matching + asking user to confirm rather than auto-matching
   - "請帶我一步一步來做吧" — guide step by step
   - Confirmed GitHub token not set; asked if ANTHROPIC_API_KEY is required
   - "就照你的順序來吧" — start with pdf-table-extractor
   - Recalled pdf-table-extractor was triggered by jobhelper development (縣市勞工局 PDF violation notices)
   - php-table-splitter and pdf-table-cut are also failed attempts; tried Tabula too; asked for first commit time
   - Doesn't remember exact trigger; found Slack message "終於搞出很滿意的 PDF 轉表格函式了 XD"; asked for help finding it
   - npm package, data processing software citations, weekly downloads impressive, PRs from community
   - "好，我們先來做 jobhelper 吧"
   - Blog TLS cert issue — asked to use curl to bypass
   - Confirmed jobhelper story; jobhelper-backend created 16 days after pdf-table-extractor
   - Open Data Day proposal spreadsheet link added
   - Corrected story: NOT stuck 3 years — used 工人智慧 throughout, built pdf-table-extractor to reduce labor costs
   - Added COSCUP 2013-08 slides link and 科技業站出來團結日 2017-12-23 slides link
   - Ministry of Labor unified platform 2017-12-29; jobhelper-backend designed for crowd-sourced data cleaning
   - "好，這篇就先這樣，我想到其他的再補進來"
   - "好，我們來開始 company-graph 吧，他跟 twcompany 是一起的"
   - 歐噴有限公司 founded 2023, asked to fetch openfunltd public repos
   - 交大統研所 2014-11-21 slides with "因為塑化劑事件，想抵制統一集團" story
   - FB post about daily manual crawl ritual; asked to fetch
   - Pasted full FB post text (daily ritual, 30 seconds, proof of being alive, automation dilemma)
   - "雖然 twcompany 我還有很多細節故事..." — save for later, move forward; content farm, 發票小幫手/simpany, g0v論戰
   - Title change requests: jobhelper→"求職小幫手", company-graph→"台灣公司資料"
   - pdf-table-extractor title: "最終解太 over，就用 PDF 資料抓取就好"
   - "好，下一個" — continued to twgeojson
   - twgeojson: for g0v 0th hackathon, Shapefile→GeoJSON, opened GIS research
   - "好，下一個故事"
   - Asked if realprice is first open gov data repo
   - realprice led to interest in open gov data, then g0v 0th hackathon, starting the journey
   - "好，請幫我補一下"
   - "好，下一個故事" — currently on newsdiff

7. Pending Tasks:
   - **newsdiff** interview in progress (just loaded info, haven't started questions yet)
   - **twcompany side stories** to add later: content farm copying, 發票小幫手/simpany adoption, g0v community debate about data packaging
   - **Continue interviewing** remaining ~205 repos from ronnywang + openfunltd accounts
   - **tw-law-corpus** (★44, fork), **taiwan-address-lookup** (★23), **lagnews** (★15), **pcc.g0v.ronny.tw** (★31), etc. in queue
   - **PHPMemcacheSASL** marked as --skip (pure tech library, no civic tech story)

8. Current Work:
   Just loaded info for `newsdiff` repo and was about to start the interview. The `--info` output showed:
   - repo: newsdiff, no description, HTML, ★25, created 2013-08-15
   - Hackathon: 3rd g0v hackathon (2013/6/8), proposal "News Diff 來看看新聞改過了沒?", URL exact match, video: https://youtu.be/ULk6CeFGDQQ
   - README: tracks news modifications, crawls every 10 minutes with parallel processes
   - Context from 交大演講 slides already known: triggered by Samsung news deletion scandal

9. Optional Next Step:
   Start the newsdiff interview. The user just said "好，下一個故事" and the assistant loaded newsdiff's info. The next step is to ask the first interview question about newsdiff. From the conversation context, we already know from the 交大演講 slides that "三星寫手門事件，有媒體貼出新聞後馬上刪除" was the trigger. The first question should be about this context and the technical approach.

If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: /Users/wangxiangrong/.claude/projects/-Users-wangxiangrong-work-ronny-github/db3b7ec3-16a5-4077-a68f-e92585e75b3b.jsonl
Continue the conversation from where it left off without asking the user any further questions. Resume directly — do not acknowledge the summary, do not recap what was happening, do not preface with "I'll continue" or similar. Pick up the last task as if the break never happened.

---

## Claude

**newsdiff** 的背景我已經有了：

- 2013 年 6 月第 3 次 g0v 黑客松提案「News Diff 來看看新聞改過了沒?」
- 從演講投影片知道觸發點是**三星寫手門事件**，有媒體貼出新聞後馬上刪除
- 每 10 分鐘抓一次，用 parallel processes

幾個問題想確認：

1. 三星寫手門事件發生的時間點，跟你開始做 newsdiff 之間的距離大概多久？是當下立刻動手，還是幾週後的黑客松才正式做？

2. 「新聞被改過」這件事你是第一次注意到嗎？還是你早就知道媒體會偷改新聞，只是三星事件讓你覺得「非做不可」？

3. 追蹤的媒體名單是怎麼決定的？有沒有什麼原則（例如只追主流媒體、或者剛開始很少後來加多）？

4. 做完之後有沒有真的抓到哪些「有趣的」修改案例，或者被媒體或公民記者引用過？

---

## 使用者

三星寫手門可以參考 https://zh.wikipedia.org/zh-tw/%E4%B8%89%E6%98%9F%E5%AF%AB%E6%89%8B%E9%96%80 ，應該隔了兩個月，以前就知道新聞可能會改，但是可能因為商業壓力而改是第一次意識到，才覺得這是個可能需要解決的問題，追蹤的媒體一開始是主流媒體，後來也慢慢增加，後來也有好幾個學術界的人有來跟我索取這些資料來做研究
不過因為考量到新聞可能有著作權問題，這個專案我一直採用 robots.txt 阻擋搜尋引擎進來爬的型式，算有點半低調經營

---

## Claude

好，資訊夠了，我來寫故事。

---

## Claude

故事存好了。幾個點確認一下：

- 黑客松是 6 月提案、8 月才真正做好，這個時序對嗎？
- 「三星付錢找人寫稿攻擊競爭對手」這個描述夠準確嗎，還是有什麼細節我說錯了？

確認沒問題的話，下一個要繼續嗎？

---

## 使用者

可以幫我看 newsdiff 的 repository 的開發歷程嗎？第一個 commit 是什麼時候？是黑客松提案前還是提案後？

---

## Claude

結果很清楚：

**第一個 commit：2013-08-13**（「add pixframework」）  
**g0v 第 3 次黑客松：2013-06-08**

→ **黑客松提案後約兩個月才開始寫程式**。黑客松時只有提案，8 月才真正動手。

然後從 commit 歷史來看，2013-08-13 當天就密集 commit 了 50+ 次（加了蘋果日報、中時、自由時報、中央社、東森、nownews 等各媒體的 crawler 和 parser），基本上**一天內建出了主要骨架**，8 月 15 日加上 README 後對外公開。

這個細節要加進故事嗎？「提案在 6 月、動手在 8 月，第一天就爆肝 50 幾個 commit 把主要媒體都搞定了」——感覺滿有趣的。

---

## 使用者

另外也可以幫我下載黑客松的提案簡報，裡面應該有更多資訊

---

## Claude

CSV 裡 newsdiff 的欄位只有 GitHub 連結，沒有投影片。早期 g0v 黑客松用 hackpad，讓我試著找一下。

---

## Claude

找不到投影片。從各個來源確認的情況：

- CSV 的 `other document` 欄位是空的（這個提案沒有留存投影片連結）
- hackpad 需要登入才能存取
- README 裡沒有提到投影片

2013 年第 3 次 g0v 黑客松比較早期，很多提案是現場口頭說明或簡短 demo，沒有另外做投影片。唯一留下來的資料是 GitHub repo 和影片。

你有沒有印象當時有做投影片？還是直接就把網站 demo 給大家看？

---

## 使用者

好，我查了一下 8/13 -8/15 我好像沒有參與任何活動，所以可能就是真的一個人在家密集做完，也許你也可以幫我從程式碼裡面補充一下，newsdiff 因為每次新聞網站更新就需要更新一次爬蟲（應該可以從程式碼看出我更新過幾次新聞來源爬蟲），後來因為有其他專案在忙就逐漸沒時間更新這邊的爬蟲，最後 newsdiff 就中止維運了

---

## Claude

從已有的 commit history 我可以整理出完整圖像，直接來寫故事。

---

## Claude

commit history 重點整理：

- **2013-08-13～15**：三天密集開發，一人在家完成。第一天就把蘋果日報、中時、自由、中央社、東森、nownews、新頭殼全部加完
- **2014-01**：大擴張，加入 TVBS、中廣、公視、台視、華視、民視、三立
- **2014-08**：加入風傳媒
- **2016-01**：一次更新十幾個來源（各網站改版）
- **2017**：全年零星更新，應對各媒體改版
- **2019-06**：最後一批 commits（蘋果日報、中時、CNA），之後停止

追蹤的媒體總計約 18 個，最後停在 2019 年 6 月。

---

## Claude

故事更新好了。

---

關於補充各專案活躍期間的想法很好。我先把目前已有的五個故事整理一下現況評估，然後一起來決定怎麼在 frontmatter 加這個欄位：

| repo | 狀態 | 說明 |
|------|------|------|
| realprice | 任務完成 | 一次性爬取 41,078 筆，資料公開後就結束 |
| twgeojson | 基本穩定 | 疆界資料不常變，仍有人引用，但少更新 |
| company-graph | 仍在維運 | 每日更新（現已自動化），2023 後轉到歐噴 |
| jobhelper | 功成身退 | 2017-12 勞動部建立統一系統後使命達成 |
| pdf-table-extractor | 仍活躍 | 2025 年每週仍 1500+ npm 下載，持續有 PR |
| newsdiff | 停擺 | 2019-06 最後更新，維運成本高撐不下去 |

建議在 frontmatter 加一個 `status` 欄位，值可以是：
- `active` — 仍在維運或使用中
- `completed` — 任務達成，自然結束
- `retired` — 因環境/資源問題中止
- `archived` — 功成身退（被政府或其他單位取代）

這樣在時間軸上可以用顏色或標籤區分。你覺得這幾個分類 OK 嗎？還是有其他想法？

---

## 使用者

jobhelper 可以改一下，因為後來使用電腦瀏覽器的人較少，大部份人都改用手機，因此 chrome extension 的營運模式較難有影響力而中止

---

## Claude

改好了。結尾現在分兩段：先說 Chrome Extension 因為手機化而失去影響力，然後勞動部接手算是另一個層面的收尾——兩件事並列，比原本只寫政府系統上線更完整。

要繼續加 `status` 欄位，還是先繼續下一個故事？

---

## 使用者

先繼續故事吧

---

## Claude

下一個是 **tw-law-corpus**（★44，fork，g0v 第 3 次）——跟 newsdiff 同一次黑客松，然後還有 **lagnews**（★15，g0v 第 3 次）也是同場。

讓我先把 tw-law-corpus 的資料載入。

---

## Claude

這個 repo 結構很清楚：`tw-law-corpus` 是資料本體（fork 自 victorhsieh），`twlaw` 是爬蟲程式。每個 commit 就是一條法律的新增或修訂，跑了八年、幾千個 commits。

幾個問題：

1. **victorhsieh 是誰？** 這個 corpus 的原始版本是他做的，你 fork 來繼續維護——是 g0v 同伴，還是另有淵源？分工是怎麼切的？

2. **twlaw 爬蟲**抓的是哪個政府資料來源（法務部全國法規資料庫？），資料結構是什麼格式？

3. **誰在用這份資料？** 有沒有印象哪些專案或研究者引用過？

4. **2021 年 6 月之後就沒有新 commit 了**——是爬蟲壞了沒修，還是有其他原因？政府後來有沒有自己提供結構化的法律資料讓這個 repo 不再必要？

---

## 使用者

victorhsieh也是 g0v 同伴，我跟他沒有一起共事過，他自行先啟動了 tw-law-corpus 這個專案，把法律變成 git commit ，啟發了我原來法律也跟程式碼一樣類似是可以做 diff 以對的，所以我就接著下去，資料來源是全國法規資料庫沒錯，這個資料沒什麼人在用，純粹做開心的，不過他有啟發了我之後在歐噴公司做了 lawtrace 這個專案，我覺得可以接到 lawtrace 的故事

---

## Claude

資訊夠了，可以直接寫。讓我先確認一下 lawtrace 在 openfunltd 的狀況。

---

## Claude

寫好了。這篇比較短，因為本來就是個「做開心的」專案，故事重心放在概念啟發和與 lawtrace 的連結。

確認一下：lawtrace 是 2024 年 11 月才建立的 repo，那個故事之後到歐噴那批再一起訪談。

下一個繼續 **lagnews**（★15，同樣是 g0v 第 3 次）嗎？

---

## 使用者

可以先訪談 lawtrace 和 openbudget 嗎？我們先把新一點的專案也寫一下，這樣子就可以讓時間維度跨到現代了

---

## Claude

好，lawtrace 的資料有了。在你說的「openbudget」部分，openfunltd 底下我看到好幾個預算相關的 repo（`budget-data`、`budgetdata`、`taiwan-budget-pdf-parser`、`databudget`、`local-budget-viz`、`budget.govapi.tw`），還有 ronnywang 底下的 `twbudget`（2012年）和 `twbudget-crawler`（2019年）——你說的 openbudget 是指哪一個，或者是這整批預算相關專案的總稱？

---

先來訪談 **lawtrace**。

從 README 看到這是歐噴公司做的，有 WFD（World Federation for Democracy？）支持，有做過使用者研究，目前仍活躍（上週還有 commit）。

幾個問題：

1. lawtrace 的起點——是 tw-law-corpus 的那個「法律也可以 diff」念頭埋了十年才長出來，還是有一個更直接的觸發點（某個案子、某個客戶需求、或某個政治事件）？

2. README 提到針對倡議團體、媒體記者、立委助理做了使用者研究——這在歐噴的專案裡算罕見，為什麼這次特別做了研究？WFD 是怎麼進來的？

3. 技術上用的是你們自己的 `mini-engine` PHP 框架，資料來源是 `v2.ly.govapi.tw`——`ly.govapi.tw` 是歐噴自己建的 API 嗎？

---

## 使用者

lawtrace 的故事就說來話長了，他的時間跨度就更長了，我先回答你的問題，你有想到其他問題再隨時問我
1. 這個故事說來話長，等一下歡迎你多追問我一些故事，首先 g0v 在很多年前有個專案叫「國會大代誌」，他就有將立法院的議案變成更友善的法案對照表，然後 mysociety 有個專案叫 sayit ，可以把本來難以閱讀的逐字稿變成更容易閱讀的友善顯示，我在 2020 年加入了立法院的 OGP 開放國會行動方案時，就開始在認真研究怎麼讓立法院的資料更容易被大家查閱，所以有做了很多不同的研究，像是有做過 lysayit （想要把立法院公報變成更友善顯示的介面），有跟公督盟合作做了 lawdiff ，後來是得到了 WFD 的支持，就認真組一個團隊從研究訪談、資料整理到視覺設計就把 lawtrace 生出來
2. 因為成立公司需要資源，跟過去自己是一個下班當休閒的工程師不一樣，忘了是在 g0v summit 還是哪一個研討會有得到了 WFD 的名片，得知是一個支持民主的英國基金會，於是我跟 claire 去提案說歐噴和 ronny 曾經有很多開放國會公民科技的經驗，希望可以得到 WFD 的支持，但一開始因為歐噴提案的題目太多（像 lysayit, lawdiff 等），因此 WFD 建議他們會先提供資金讓我們做研究訪談，先了解哪一個產品是倡議團體或媒體記者最需要的，做完使用者研究之後，再根據研究結果決定下一步怎麼走，因此選擇了 lawtrace 這個題目
3. lyapi 也是歐噴的專案，因為過去十幾年我都是做資料的，對我來說先把資料清理乾淨是做應用的第一步，因此我先做了 lyapi （後來因為 lyapi 太疊床架屋，每加一個資料來源就會生一個格式完全不同的 API ，造成難以使用，所以後來決定把各 API 統一規格後，生出了 lyapi2 ，並且因為統一規格的關係，就可以更輕易做出 api 預覽器，也因此有做了 dataly 專案，是專門讓不會寫程式的人可以直接瀏覽 api 得到的資料。lawtrace 也是完全建基在 lyapi 之上，為了促進 API 使用，lawtrace, dataly 也都會在網站的下方加上這一頁用到的 api 連結，讓大家更容易知道這頁用到的資料是長什麼樣子，希望可以讓更多人來使用立法院資料

---

## Claude

這個脈絡很完整，讓我先追幾個細節：

1. **Claire** 是誰？歐噴的共同創辦人嗎？提案是你們兩個一起去的？

2. **lawdiff** 跟公督盟合作——這個專案最後的結果怎樣？有上線、後來停了，還是直接演變成 lawtrace？

3. **lysayit** 的命運也想確認一下——是試驗後發現不是最需要的東西而放棄，還是現在還在某個地方活著？

4. **lawtrace 什麼時候正式上線**？現在的使用者主要是哪些人（倡議團體？媒體記者？一般民眾？）？

---

## 使用者

1. claire 是一位接案工作者，專業是 PM 和服務設計研究訪談，本來在開放文化基金會工作，後來出來自行接案，當時我主動詢問 claire 願不願意以接案的型式跟歐噴合作去申請 WFD 的補助，因此我們就一起去提案，她也成為歐噴很重要的 PM （不過我覺得接案這件事好像在這故事不用特別強調）
2. lawdiff 現在也還在線上，網址是 https://openfunltd.github.io/law-diff/ ，雖然 law-diff 這個 repo 已經很久沒更新了，但是因為背後接的是 lyapi ，而 lyapi 的爬蟲會每日更新資料，因此 law-diff 現在還是可以隨時看到最新的議案資料
3. lysayit 目前是個過渡實驗性的專案，因此暫時就擱置，但是現在還活著，也因為後面接的是 lyapi ，因此也還是可以看到新的資料（但有一個舊版的 lysayit 因為他不是接 lyapi 的，那邊資料就沒再更新了）
4. lawtrace 正式上線是 2025年1月，但是 2025 年整年也持續有在更新並且收集意見改進，也辦了很多推廣活動，主要使用者會是倡議團體和立委助理

---

## Claude

資訊很完整了，可以直接寫。讓我快速確認幾個相關 repo 的名稱。

---

## Claude

夠了，來寫故事。這個故事時間跨度很長，我會把幾個階段串起來。

---

## Claude

寫好了。這篇把十年的脈絡串了起來：2013 tw-law-corpus 的啟發 → 2020 OGP → lysayit/lawdiff 的探索 → lyapi 基礎建設 → WFD 資助 → 2025 上線。

幾個細節確認：
- lawtrace 有沒有獨立的網址（如 `lawtrace.tw` 或 `lawtrace.openfun.tw`）？
- lysayit 現在的網址是什麼，我可以補到 repo 裡？

確認後我們繼續訪談 **openbudget**。

---

## 使用者

lawtrace 的網址是 lawtrace.tw ， lysayit 舊版的前端在 https://g0v.github.io/lysayit/ （已停止資料更新），後端在 https://lysayit.g0v.ronny.tw/ （已停止資料更新），新版的在 https://lysayit.openfun.app/ （目前還在實驗階段，因此還沒有友善的介面，需要直接透過網址加上 ?doc_id=1132501_00002 輸入公報代碼才可以查看

在訪談 openbudget 之前，我想要請你做個調整
1. 故事圖卡的右上角的年份，他應該是個時間跨度，因此應該要有現在和結束時間，如果還在進行的話，可能就是 2024-now 之類的

---

## Claude

好，先把 lawtrace 的網址補上，然後來改卡片的年份顯示。

---

## Claude

現在來改卡片年份顯示。先看一下 RepoCard 和 stories.js 目前的結構：

---

## Claude

邏輯很清楚：用 `date`（開始）和 `updated`（結束）算出時間跨度，2025 年以後算 "now"。

---

## Claude

現在各故事的顯示效果：

| repo | 顯示 |
|------|------|
| realprice | 2012 |
| twgeojson | 2012–2013 |
| pdf-table-extractor | 2016–now |
| company-graph | 2014–now |
| jobhelper | 2013–2018 |
| newsdiff | 2013–2019 |
| tw-law-corpus | 2013–2021 |
| lawtrace | 2024–now |

時間軸頁面（`timeline.astro`）的 `groupByYear` 目前是依 `date`（開始年份）分組，這樣還是對的——按「這個專案何時誕生」排列，年份跨度只在卡片右上角顯示。這樣可以嗎？

確認沒問題的話，繼續訪談 **openbudget**。

---

## 使用者

另外 lawtrace 的研究報告網也可以幫我補進 lawtrace  的故事中，相關素材可以到 https://openfun.tw 歐噴首頁下載

---

## Claude

找到了，有研究報告和推廣資料。來補進故事末尾。

---

## Claude

補好了。另外從 openfun.tw 也看到 **OpenBudget** 的網址是 `https://budget.openfun.app`，正好是下一個要訪談的。

openfunltd 底下跟預算相關的 repo 有好幾個（`budget-data`、`taiwan-budget-pdf-parser`、`budgetdata`、`databudget`、`local-budget-viz`、`budget.govapi.tw`），還有 ronnywang 底下更早的 `twbudget`（2012）和 `twbudget-crawler`（2019）。這批故事要怎麼歸——是一個大故事串起來，還是每個 repo 各自獨立？

---

## 使用者

這些好像可以串起來，我先休息一下去工作，晚上再來繼續，也請你幫我看看是否可以從 https://github.com/g0v 下面抓下有哪些 repository 是 ronnywang 這個帳號主要在 commit 的，因為我也有些 repository 不是放在 ronnywang 或是 openfunltd 下面，而是放在 g0v 下面

---

## Claude

好，去忙吧！我先在背景把 g0v org 的 repo 調查跑起來。

先確認一下 g0v org 的規模再決定策略：

---

## Claude

510 個 repos，個別查 commits 太慢。用 GitHub commit search API 直接搜 `author:ronnywang org:g0v` 會更有效率。我放到背景跑，你回來就有結果了：

---

## Claude

背景任務已啟動，它會用 commit search API 把所有 `author:ronnywang org:g0v` 的 commits 掃一遍，整理成清單存到 `data/g0v-ronnywang-repos.json`。

你回來的時候結果應該就好了。晚上見，繼續 openbudget！

---

## Claude

Agent 寫好了腳本，我來直接跑它。

---

## Claude

跑起來了，預計 10-15 分鐘（API rate limit 每次要等 7 秒）。結果會存到 `data/g0v-ronnywang-repos.json`。

你準備好的時候可以直接繼續 openbudget 的訪談，g0v 的調查結果跑完我會通知你。

---

## 使用者

有辦法輸出我們之間的對話紀錄嗎？我想跟別人示範一下這個回憶錄是怎麼產生出來的

---

## Claude

對話紀錄存在 JSONL 格式的檔案裡，讓我把它轉成可讀的格式。

---

