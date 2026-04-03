---
repo: middle2
title: "Middle2：自幹一個 PaaS 的中二決定"
date: "2012-07-28"
topics:
  - 基礎建設
  - PaaS
  - Docker
  - g0v
language: PHP
stars: 40
isFork: false
github: https://github.com/middle2tw/middle2
summary: "Heroku 免費方案的資料庫太少、太小，那就自己做一個。從 2012 年撐到現在，跑著我幾乎所有的公民科技專案，每天接待超過百萬次 HTTP 請求。"
---

## 命名的由來：從 hisoku 到 middle2

這個專案最早叫做 **hisoku**。

邏輯很直白：Heroku 這個名字是 Her-oku，是給「她」用的。那我做一個給自己用的，當然叫 His-oku。

後來覺得這命名太性別不正確，想改。PaaS 在雲端架構裡是 SaaS > PaaS > IaaS 的中間第二層，簡稱「中二」——中文還有個額外的意思，就是那種「充滿不切實際夢想的中學二年級生」，剛好和這個自幹平台的精神很搭。於是改名 **middle2**。

## 為什麼要自幹一個 PaaS？

那時我在 Heroku 上跑了不少專案。Heroku 的開發體驗很好：git push 就部署完成，乾淨俐落。

問題是，Heroku 免費方案對資料庫有嚴格限制——一個帳號能開的資料庫數量和容量都很有限。我做的很多公民科技工具都和資料緊密相連：公司資料、標案資料、政治獻金……每個都需要自己的資料庫，而且資料量動輒幾十 GB。

要嘛付錢、要嘛換個方法。我選擇第三條路：自己做一個仿 Heroku 的平台。

## 點一下開資料庫，push 就上線

middle2 複製了 Heroku 最吸引我的操作體驗：

- **git push 部署**：程式寫完推上去，自動拉起新的容器
- **一鍵開資料庫**：MySQL、PostgreSQL、Elasticsearch，點個滑鼠就開好，馬上可以用
- **Custom domain**：設定好 CNAME，網址就上線了
- **Docker 容器隔離**：每個 app 跑在自己的容器裡，互不影響
- **多語言支援**：PHP、Python、Ruby、Node.js

這套流程讓我能在一個下午從零做出一個可以對外服務的完整網站。這是 middle2 最重要的設計目標：**讓部署不成為瓶頸**。

## 五台機器、每月五千元的賭注

當規模長起來之後，infrastructure 就不再只是一台 VPS 的事了。

鼎盛時期，middle2 跑了五、六台機器：load balancer × 1、web server × 2、MySQL × 1、PostgreSQL × 1。每個月雲端費用超過五千元台幣。

那時申請了 g0v 公民科技創新獎助金（[提案連結](https://grants.g0v.tw/projects/586a35518891f3001ea69b03)），獎助金的錢全數投入伺服器費用。為了讓大家知道這些錢怎麼花的，我[公開了完整的費用明細](https://docs.google.com/spreadsheets/d/1WOYz7N4QaW1-0NmLzrqboIfgcvlnKCnFs1uru2O6PjQ/edit?gid=0#gid=0)，並向社群公開募款。

## 四次搬家

middle2 跟著我一起到處搬：

1. **AWS** — 最早的家，穩定可靠，但費用高
2. **hicloud**（中華電信雲）— 想支持國內廠商，搬過去試試看
3. **Microsoft Azure** — 拿到公益贊助，費用降下來了
4. **Linode** — 到現在還住在這裡

每次搬家都是一次遷移演練，也讓整個系統愈來愈強壯。

## 不只是我自己在用

middle2 不是我的私有工具。g0v 社群有些專案也跑在上面，例如：

- **阿美語萌典**
- **g0v dashboard**
- **台北市閒置空間平台**
- **公職人員出國考察網**

其中最具代表性的是 **hackpad.tw**。2017 年 hackpad.com 宣布關站，g0v 社群需要一個地方保存十年累積的共筆記錄。能架起來、能穩定跑著，靠的正是 middle2 這套基礎建設——還有 middle2 上的 Elasticsearch，讓 hackpad.tw 的搜尋功能可以直接接進來。

對我而言，重要的不只是「我的專案能活著」，而是「社群的工具也能輕鬆活著」。

## 現在還在跑

從 2012 年到現在超過十年，middle2 從未停機超過幾個小時。

近幾年 AI 爬蟲大量出現，每天的 HTTP request 數量已經突破**一百萬次**，但系統依然穩定。

這個平台是我所有公民科技專案能持續運作的基礎。newsdiff、newshelper、twcompany、求職小幫手、標案資料……幾十個工具背後，都是這個「中二」的決定在撐著。

沒有 middle2，我不可能做出那麼多東西。
