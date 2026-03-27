---
repo: domain-sync
also: 301-service
title: g0v 基礎建設：網域管理與轉址
date: 2015-08-24
endDate: now
topics:
  - g0v
  - infrastructure
  - dns
  - cloudflare
stars: 7
summary: g0v 是沒有老大的去中心化社群，網域管理也需要去中心化——用 GitHub PR 申請子網域、用 DNS TXT record 做轉址，讓非工程師也能自助完成。
githubUrl: https://github.com/ronnywang/domain-sync
---

# g0v 基礎建設：網域管理與轉址

g0v 是一個沒有老大的去中心化社群，連 g0v.tw 的子網域申請也需要一套去中心化的機制。某次基礎建設松上，社群成員討論決定：用 GitHub 來管理所有 g0v.tw 網域設定——所有申請和變更都寫在 [g0v/domain](https://github.com/g0v/domain) 這個 repo 裡，透過 issue 和 pull request 的方式讓任何社群成員都可以提出申請，審核後合併即生效。

## domain-sync：讓 JSON 和 Cloudflare 保持一致

2017 年 1 月，Ronny 建了 domain-sync，讓網域管理員可以把 g0v/domain repo 裡的 JSON 設定檔直接同步到 Cloudflare，不用手動一筆一筆比對，確保兩邊資料一致。Ronny 也在同一時期加入揪松團，開始長期參與 g0v 社群的基礎建設維護工作。

## 301-service：讓非工程師也能自助轉址

更早在 2015 年，Ronny 做了 301-service：只要把網域的 DNS TXT record 設定指向目標網址，301-service 就會自動把流量轉過去。不需要寫程式，不需要管理伺服器，只需要會設定 DNS——讓非工程師的社群成員也能輕鬆把 g0v.tw 子網域指向他們的專案。這個服務一直維護至今。

## 基礎建設的日常

這兩個專案沒有高星數、沒有媒體報導，但它們是讓數十個 g0v 子專案能夠順暢運作的地基。g0v 社群龐大，沒有中央管理員，靠的就是這些小工具讓去中心化的協作變得可行。
