---
repo: "pdf-table-extractor"
title: "PDF 資料抓取"
date: "2016-04-16"
updated: "2025-11-29"
topics: ["pdf", "open-data", "javascript", "nodejs"]
language: "JavaScript"
stars: 212
forks: 72
isFork: false
forkedFrom: ""
homepage: "https://ronnywang.github.io/pdf-table-extractor/"
githubUrl: "https://github.com/ronnywang/pdf-table-extractor"
summary: "歷經多次失敗後終於做出能處理合併儲存格、人人可用的 PDF 表格抓取工具，每週在 npm 仍有逾千次下載"
relatedRepos: ["pdf-to-table", "php-table-splitter", "pdf-table-cut"]
---

政府公開資料最惱人的形式，大概就是 PDF 裡的表格。看得到、複製不了，或者複製出來全是亂碼。做台灣開放資料的這幾年，我一次又一次撞上這堵牆。

最早的嘗試是 2014 年，在第 7 次 g0v 黑客松上。當時要處理農委會的農藥使用手冊——一份用藥資訊密密麻麻塞在 PDF 表格裡的文件。我用 PHP 寫了 `pdf-to-table`，靠著 smalot/pdfparser 把文字座標抓出來，再用 Y 軸偏移量判斷換行。勉強能跑，但只能在命令列裡使用，而且一碰到合併儲存格就破功。中間還試過 Tabula 等現成工具，都不能完整滿足需求。`php-table-splitter`、`pdf-table-cut` 這幾個 repo，也都是那段時期留下的嘗試痕跡。

2016 年 4 月，具體的觸發點出現了。我當時在重新開發「求職小幫手」（`jobhelper-backend`）——一個把各縣市勞工局公布的違反勞基法廠商名單收集起來、讓大家查找違法公司更方便的工具。問題在於，有些縣市偏偏選擇用 PDF 發布這份公告。為了把勞基法違法資料結構化，我決定重新解決 PDF 表格這個老問題。

這次換成 JavaScript，讓整個解析邏輯跑在瀏覽器前端。核心突破有兩個：第一，終於把合併儲存格處理對了；第二，不再需要安裝任何環境，任何人打開瀏覽器就能直接貼上 PDF 連結來用，想批次處理的人也可以透過 Node.js 在終端機大量執行。pdf-table-extractor 在 4 月 16 日完成，求職小幫手後端 16 天後也跟著建起來了。完成那天，我在 g0v Slack 貼了一句：「這一次終於搞出很滿意的 PDF 轉表格函式了 XD」

沒想到反應出乎意料地好。有人把它包成 npm 模組發布，後來又被幾個資料處理軟體引用，下載量就這樣滾起來了。到 2026 年，這個工具每週在 npm 上仍有超過 1,500 次下載，近 18 個月累計超過 9 萬次。GitHub 上有 212 個 star、72 個 fork，持續有人送 pull request 進來更新功能或調整介面。Stack Overflow 和各種技術部落格上，它成了「台灣政府 PDF 怎麼抓」這個問題的標準答案之一。

一個為了解決自己需求而寫的小工具，最後變成很多人共用的基礎設施——大概是開源最有趣的地方。
