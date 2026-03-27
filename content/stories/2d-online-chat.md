---
repo: 2d-online-chat
title: 2D 線上聊天室
date: 2020-03-24
endDate: 2022-05-01
topics:
  - covid
  - jitsi
  - 開源
  - 線上活動
stars: 11
language: JavaScript
summary: COVID 初期，用 RPG 像素風格做了一個 2D 線上聊天室，比 Gather.Town 還早，整合 Jitsi 開源視訊，後來用來辦了中研院陳昇瑋老師的線上告別式。
githubUrl: https://github.com/g0v/2d-online-chat
term: 39
---

# 2D 線上聊天室

2020 年 3 月，COVID 疫情開始影響台灣的實體聚會。Ronny 在 g0v Slack 上貼出一則開發進度：

> 「2d 線上 meet jitsi 聊天開發中 XD 現在做到人物可以移動改名的程度，可以按上下左右移動。再來就要接上 meet jitsi 聊天了 XD」

用 RPG 角色像素圖（pipoya 的 32x32 角色）和開源地圖磚組出一個可以走動的 2D 虛擬空間，整合 [Jitsi](https://jitsi.org/) 開源視訊會議做語音和影像——不需要自架伺服器，直接用現成的 Jitsi 公共伺服器，在瀏覽器就能跑起來。

這比 Gather.Town 廣為人知還要早，而且完全開源。

## 陳昇瑋老師的線上告別式

2020 年 4 月，台灣 AI School 執行長、元大金控 CTO、中研院研究員**陳昇瑋老師**因腦溢血突然離世，享年 44 歲。他在兩年內培訓了超過 6000 位 AI 人才，長期協助 g0v 社群，消息傳來讓許多人非常難過。

g0v 社群決定以 2d-online-chat 為基礎，辦一場線上追思會，讓無法實體到場的人也能聚在同一個虛擬空間裡共同紀念。追思會第一天就湧入近 1000 則留言，台積電等企業也傳來悼念，4 月 21 日實體告別式更有超過 500 人到場。

## 後記

這個專案最後一個 commit 是 2022-05-01「update jitsi url」——維護持續到疫情走入尾聲，共累積了 123 個版本。它從來沒有用在 g0v 大松上，卻在最需要的時候，承載了一場不尋常的道別。
