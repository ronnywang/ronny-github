---
repo: jitsi-screen
title: 揪己家：線上活動客製化舞台
date: 2020-05-07
endDate: 2021-12-11
topics:
  - covid
  - jitsi
  - 線上活動
  - g0v
  - 基礎建設
stars: 4
language: JavaScript
summary: 疫情期間，3月線上大松成功後，許多組織求助揪松團協助線上活動——包含總統杯黑客松和 AIT GCTF，於是做了 jitsi-screen，讓 Jitsi 會議室可以客製化排版、按鈕互動、直播背景，彈性支援大型線上活動。後因 Jitsi API 改版需要 API Key 才能使用，整套工具一起失效。
githubUrl: https://github.com/g0v/jitsi-screen
homepage: https://g0v.github.io/jitsi-screen/screen2.html
---

# 揪己家：線上活動客製化舞台

2020 年 3 月 g0v 線上大松成功後，揪松團沒有預料到接下來會發生什麼——電話和訊息紛紛湧入，許多原本以實體活動為主的單位都苦無辦理線上活動的方式，其中包括**總統杯黑客松**和**AIT GCTF（全球合作暨訓練架構）**。

揪松團因此組成「線上揪松團隊」，以 Jitsi 為基礎，開發更有彈性的線上活動工具。2020-05-07，`jitsi-screen`（揪己家 Jo Jitsi Plus）正式建立。

## 功能

利用 Jitsi 官方 API 取出會議室的視訊畫面，透過 HTML 自訂排版方式、按鈕互動和直播背景，再推送給特定觀眾——讓每場活動都可以有專屬的舞台樣式。

## 總統杯黑客松

總統杯黑客松有 24 支隊伍，每隊 10 名成員，超過 200 人無法集中在同一個 Jitsi 房間。解法是：24 隊分散在 24 個不同的會議室，透過 jitsi-screen 連線到總統所在的主會議室進行簡報分享——等於在線上重現了實體活動「各組分散、上台報告」的流程。

🎥 [總統杯成果影片](https://www.youtube.com/watch?v=NtrVG0pT0J8)

## AIT GCTF

美國在台協會主辦的 GCTF 也透過 jitsi-screen 與國外講者進行連線交流。

🎥 [GCTF 成果影片](https://www.youtube.com/watch?v=jopvabxwupk)

## 終局：被上游 API 改版殺死

後來 Jitsi 改版，直接連線需要 API Key，必須自架伺服器才能使用；加上 API 格式大幅改變，維護成本急遽升高。jitsi-screen 因此失效——連帶 2d-online-chat 和 meet.jothon.online 的線上視訊功能也一起停擺。

這套工具在最需要的兩年間撐起了數場大型線上活動，最終被上游平台的商業決策終結，留下 140 個 commit 和一段疫情時代的基礎建設記憶。
