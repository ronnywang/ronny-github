---
repo: "lysub-crawler"
title: "立法院委員會議事錄爬蟲"
date: "2022-02-08"
updated: "2022-02-08"
topics: ["legislature", "open-data", "open-gov"]
language: "PHP"
stars: 0
forks: 0
isFork: false
forkedFrom: ""
homepage: ""
githubUrl: "https://github.com/ronnywang/lysub-crawler"
summary: "爬取立法院委員會議事錄的小工具，是 lyapi 大一統之前，一次次針對立法院不同資料角落的探索之一"
relatedRepos: ["lysayit", "lyapi", "lyapi2", "lawtrace"]
---

立法院的資料有兩種，很容易搞混：**會議紀錄**是完整的逐字稿，通常要等會議結束後二十到三十天才會公開；**議事錄**是結論摘要，兩三天內就出來了。

lysayit 針對的是逐字稿——那是公報的範疇，一字一字都在，但等待時間長。議事錄則不同，它快，而且裡面藏著很多立即有用的資訊：委員會的出席狀況、委員凍結或刪除預算的提案、臨時動議的結論。

`lysub-crawler` 就是去抓這些議事錄。從立法院網站的委員會列表出發，按屆次和會期把 doc 檔全部撈下來，再轉成純文字。工具本身很小，一天就寫完，是個直接解決眼前問題的小腳本。

---

這個工具放進更大的脈絡來看，其實是一段長達十年的積累的其中一環。

早在 2013 年就做了 `lysayit`，把立法院公報的逐字稿轉成結構化的對話介面——那是受 mySociety 的 SayIt 啟發的嘗試，讓密密麻麻的議事記錄變得可以閱讀。

然後是 2020 年，加入立法院的 OGP 開放國會行動方案，開始認真面對一個問題：立法院有海量的公開資料，但每個資料散落在不同的頁面、不同的格式，每次想用就要從零開始爬。lysub-crawler 是在這個脈絡下又一次「遇到什麼問題就從那個角落去抓」的嘗試。

一直到這個時期，才真正下定決心做一件更根本的事：與其每個資料各做各的爬蟲，不如做一個**大一統的立法院資料 API**。

這就是 [lyapi](https://github.com/openfunltd/ly.govapi.tw) 的起點——試著把整個立法院的公開資料都 API 化，讓資料可以被統一取用。

只是隨著 API 越加越多，每新增一個資料來源就疊床架屋，整個架構越來越難維護。後來重寫成統一規格的 [lyapi-v2](https://github.com/openfunltd/ly.govapi.tw-v2)（`v2.ly.govapi.tw`），把所有 API 的輸出格式拉齊，才真正有了一個穩定的地基。

lysub-crawler 是這條路上一個小小的路標——不起眼，但代表著那個時期一次次去觸碰立法院資料的不同角落，慢慢拼湊出一幅完整的地圖，最終長成了 lawtrace。
