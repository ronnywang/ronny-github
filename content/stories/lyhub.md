---
title: lyhub：113 位立委上 Mastodon
date: 2026-03-29
repo: lyhub
tags:
  - 立法院
  - Mastodon
  - ActivityPub
  - 開放資料
  - g0v
related:
  - fb-post-screenshot
  - fake-fb-wall
  - lysayit
---

2018 年，Ronny 想幫大安森林公園的鳳頭蒼鷹建 Facebook 帳號。2019 年，同樣的機制被用來替白色恐怖受難者製造塗鴉牆。到了 2026 年，同一個「幫一個角色建立數位身份」的念頭，又回來了——這次的角色是 113 位立委，平台換成了 Mastodon。

2026 年 3 月 29 日，g0v hackath72n「新源意碼大造化黑客松」。Ronny 在當天開了一個新 repo：`lyhub`。

---

概念是這樣的：每一位立委在 Mastodon 上都有一個帳號，帳號會透過 `lyapi`（立法院 API）自動同步他們在立法院的行為——發言紀錄、提案、出席狀況——讓選民可以在 Mastodon 上直接追蹤自己選區的立委，不需要去立法院官網查，不需要懂怎麼用政府資料庫。

技術上用的是 ActivityPub——這是 Mastodon 背後的開放協定，讓不同伺服器之間可以互相溝通。這意味著 lyhub 上的立委帳號，可以被任何 Mastodon 或相容平台的用戶追蹤，不需要特別加入某個特定的伺服器。

這是 2018 年猛禽 FB 想不到的事：那時候只有 Facebook 一個選項，而且 Facebook 的 API 越來越封閉。現在有了開放的聯邦宇宙協定，「讓人追蹤一個角色」這件事可以在一個沒有單一平台控制的環境裡發生。

---

25 個 commit，一天做出來。`lyhub` 在黑客松當天從零開始。

立委的公開行為本來就是公開的，只是埋在官網深處、格式不友善。把它接到人們已經在用的平台上，讓資訊自己找到關心的人——這件事 Ronny 用不同的方式做了很多次，從 newsdiff 到 lysayit，從猛禽 FB 到 lyhub。
