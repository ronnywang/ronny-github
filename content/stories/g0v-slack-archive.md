---
repo: g0v-slack-archive
title: g0v Slack 封存
date: 2018-09-14
status: active
stars: 7
language: PHP
topics:
  - g0v
  - 基礎建設
  - 社群工具
github: https://github.com/ronnywang/g0v-slack-archive
website: https://g0v-slack-archive.g0v.ronny.tw/
summary: 封存 g0v Slack 對話紀錄的公開查詢服務。因 g0v 使用免費方案、訊息定期消失，加上 hackpad 被收購後強制中止的前車之鑑，決定自建封存服務，至今仍持續維護。
---

## hackpad 的教訓

g0v 社群很早就在用 hackpad 協作——直到 Dropbox 收購它之後關閉服務，社群不得不大規模遷徙，大量過去的共筆內容就此難以取得。

這件事讓 g0v 社群對「依賴外部服務」多了一份警覺：**在開始使用任何服務之前，要先想好怎麼備份、怎麼搬走。**

## Slack 免費方案的訊息消失問題

g0v 的 Slack 工作區使用免費方案，只能存取近幾個月的對話紀錄，更早的訊息就自動消失。

這對一個從 2012 年就開始累積社群記憶的組織來說是個問題——哪個專案是誰在哪天提出的、某個決策討論的完整脈絡、社群早期的各種故事——全部都在悄悄流失。

2018 年 9 月 14 日，心血來潮，動手做了 **g0v-slack-archive**：一個公開可搜尋的 Slack 對話封存服務。

## 持續維護至今

這個專案低調但持久。從 2018 年到 2025 年底，共累積 106 個 commits，一直在更新維護。

封存網站 [g0v-slack-archive.g0v.ronny.tw](https://g0v-slack-archive.g0v.ronny.tw/) 讓任何人都可以搜尋查閱 g0v Slack 的歷史對話，讓社群記憶得以延續。
