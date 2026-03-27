---
repo: "tw-law-corpus"
title: "台灣法律語料庫"
date: "2013-08-09"
updated: "2021-06-21"
topics: ["open-data", "law", "g0v"]
language: ""
stars: 44
forks: 8
isFork: true
forkedFrom: "victorhsieh/tw-law-corpus"
homepage: ""
githubUrl: "https://github.com/ronnywang/tw-law-corpus"
summary: "g0v 同伴把法律變成 git commit 的啟發，讓我意識到法律跟程式碼一樣可以做 diff，接手維護後默默跑了八年"
relatedRepos: ["twlaw"]
---

在 g0v 圈子裡，victorhsieh 最先做了一件有趣的事：把台灣所有的法律放進 git repository，每次法律有修訂就新增一個 commit。

這個設計讓我突然意識到：法律跟程式碼本質上是一樣的東西——都是有版本歷史的文本，都有新增、修改、廢止。既然程式碼可以用 `git diff` 追蹤每一次變動，法律當然也可以。

我沒有跟 victorhsieh 一起共事過，但這個想法啟發了我，讓我接著他的基礎繼續做下去。`twlaw` 是爬蟲程式，從全國法規資料庫抓取所有現行法律；`tw-law-corpus` 則是資料本體，每一條法律的新增或修訂都對應一個 commit。兩個 repo 搭配，讓整個台灣的法律體系變成一份有完整版本歷史的 git 倉庫。

說老實話，這份資料沒什麼人在用。純粹是做開心的——覺得這個概念很有趣，就一直維護下去。從 2013 年到 2021 年，斷斷續續跑了八年，累積了幾千個 commit，每一個都是一條真實發生的法律變動。

不過，這個想法在腦子裡留了下來。十年後，在歐噴公司，把這個概念做成了 `lawtrace`——一個更完整的法律追蹤系統，讓人可以清楚看到每一條法律條文的演進歷程。
