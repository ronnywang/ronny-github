---
repo: "jobhelper"
title: "求職小幫手"
date: "2013-03-23"
updated: "2018-11-02"
topics: ["labor", "open-data", "chrome-extension", "g0v"]
language: "JavaScript"
stars: 46
forks: 13
isFork: false
forkedFrom: ""
homepage: "http://jobhelper.g0v.ronny.tw/"
githubUrl: "https://github.com/ronnywang/jobhelper"
summary: "把政府公開的違反勞基法廠商名單整合進求職網站，讓求職者在瀏覽職缺時就能看到公司有無違法紀錄"
relatedRepos: ["jobhelper-backend", "LSA-CSV", "pdf-table-extractor"]
hackathon:
  term: 28
  event: "g0v hackath28n | 台灣零時政府第貳拾捌次高牆功德黑客松"
  date: "2018-01-13"
  video: "https://www.youtube.com/watch?v=FaIguKr475s"
---

2011 年勞基法修法，增加了一條規定：違反勞基法的事業單位，主管機關必須公布其名稱與負責人姓名。從那時起，各地勞工局每個月都要公告開罰名單。這些資訊對基層勞工其實很重要——你可以知道哪些公司有超時加班、不按規定給加班費。但 104、1111 這些求職網站不會告訴你，大部分求職者也不知道政府有公開這些資料。

2013 年 3 月，在一場 [Open Data Day](https://docs.google.com/spreadsheets/d/1dL6_ulpjMQyBTulh946i4QcHlu8vL8VVUJ8S4odn6UM/edit?gid=0#gid=0) 活動上，我提出了「求職小幫手」這個想法（當天第 4 號提案）：做一個 Chrome Extension，在你瀏覽求職網頁時，自動幫你查這家公司有沒有勞基法違規紀錄。當天一起 demo 的還有從商業司爬出的一百多萬家公司統編資料，已經可以支援 104、1111、yes123、518 四個平台。

沒想到這個想法在活動現場引發迴響，消息傳了出去，三週後就上了電視——中天新聞在 2013 年 4 月 14 日播出「[佛心工程師求職程式，揭露血汗工廠](https://www.youtube.com/watch?v=oYwyr5BUNF8)」，民視也跟著報了「[佛心求職程式，揪黑心血汗公司](https://www.youtube.com/watch?v=2KvPG-xIThU)」。「佛心工程師」這個封號就這樣來的。

資料的挑戰確實存在——各縣市勞工局公告格式不統一，有的寫在網頁上，有的用 PDF，有些只保留最新一期、舊資料就消失了。但這些問題並沒有讓專案停擺，而是靠著「工人智慧」撐過去：人工下載、人工整理、人工清資料，讓求職小幫手持續運作。

三年後，2016 年，想要降低這些人力成本，才觸發了 `pdf-table-extractor` 的開發——一個能正確處理合併儲存格、純前端可用的 PDF 表格抓取工具（詳見該 repo 的故事）。工具做出來後，重新整頓後端，建立了 `jobhelper-backend`，讓資料收集從人工轉為自動化。

求職小幫手也陸續在多個場合被分享。2013 年 8 月在 [COSCUP](https://docs.google.com/presentation/d/1jmZnPD_qHqnjTdvwr5D264_uYaPwr8CSPHzq-YuP62o/edit?slide=id.p#slide=id.p) 上做了完整介紹；2017 年 12 月 23 日在「科技業站出來團結日」活動上也以此為題[發表演講](https://docs.google.com/presentation/d/11i0VDdaFTEBVE6rn8kGBp5KYfH7LxoXumS72PaVOa4E/edit?slide=id.p#slide=id.p)，探討科技工作者可以如何運用自己的能力關注勞動議題。2018 年，在第 28 次 g0v 黑客松「高牆功德黑客松」上，求職小幫手再次被提案，繼續找人一起完善。

值得一提的是，`jobhelper-backend` 除了自動化收集資料，當初設計也納入了群眾協力的概念——讓志工一起幫忙整理各縣市格式不一的資料。

求職小幫手最終停擺，主要原因是使用環境改變了。Chrome Extension 依附在桌面瀏覽器上，但求職行為越來越多移到手機——大部分人打開 104 或 1111 是在 app 裡，不是在桌機瀏覽器。Extension 觸及不到這些使用者，影響力越來越有限，繼續維護的意義也就慢慢消失了。

2017 年 12 月 29 日，勞動部也推出了「[違反勞動法令事業單位（雇主）查詢系統](https://www.mol.gov.tw/1607/1632/2665/13507/post)」，統一整合全台違法名單。政府把這件事正式接手，算是另一層意義上的功成身退。
