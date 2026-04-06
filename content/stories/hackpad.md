---
repo: "hackpad-viewer"
org: "openfunltd"
title: "hackpad.tw：讓歷史文件繼續活著"
date: "2017-04-01"
updated: "2026-04-05"
milestone: "2026-04-05"
topics: ["hackpad", "g0v", "太陽花", "基礎建設", "middle2"]
language: "PHP"
isFork: false
github: https://github.com/openfunltd/hackpad-viewer
homepage: "https://hackpad.tw"
summary: "hackpad 是 g0v 社群十年共筆的家，太陽花那晚全台灣都在上面，後來 Dropbox 要關服務，Ronny 在關站前兩個月把社群的記憶搬進自己架的 hackpad.tw 保存起來。維運九年，花了六萬多台幣，2026 年用 AI 重寫成 PHP 後終於可以省下那台獨立伺服器。"
related:
  - middle2
  - g0v-slack-archive
---

## g0v 最愛的共筆工具

2012 年 g0v 社群剛成立時，hackpad 就已經是大家最常用的協作工具。每次大松開場提案，每個專案的討論筆記，每次活動的工作紀錄——都存在 hackpad 上。`g0v.hackpad.com` 這個 workspace 是社群共同的記憶體。

## 2014 年三月的那幾天

2014 年 3 月，太陽花學運爆發，g0v 社群也在裡面動員。

現場的訊息、分工協調、資源調度，大量透過 hackpad 傳遞。那幾天湧進的台灣使用者太多，hackpad 的伺服器撐不住了——為了台灣，hackpad 官方緊急加開伺服器應急。（[iThome 報導](https://www.ithome.com.tw/news/86832)）

但同年三月，Dropbox 把 hackpad 收購了。社群繼續用，只是多了一份不確定感。

同年，台灣本地的 **HackMD** 在 2015 年成立，提供更現代的共筆體驗，社群開始慢慢分流。

## 2017：搶在關燈前把東西搬走

2017 年 3 月，hackpad 宣布：**2017 年 7 月 19 日中止服務**，請用戶自行匯出資料，日後轉向 Dropbox Paper。官方同時開源 hackpad 程式碼，並提供資料庫匯出服務。

大多數服務關閉時，使用者能做的就是下載資料、然後失去服務。但 hackpad 的原始碼是開放的——有人 fork 出來叫 whackpad，在 GitHub 上。

距離關站還有四十天，**2017 年 6 月 10 日**，g0v 揪松團緊急召集了一場「[**搶救 g0v Hackpad 松**](https://g0v-jothon.kktix.cc/events/hackpadthon)」，在 Mozilla Space 辦了半天的 hackathon，集合社群一起討論對策：要備份到哪裡、要用什麼工具、哪些 workspace 優先處理。

**2017 年 4 月**，Ronny 動手：

- 申請 `hackpad.tw` 網域
- Fork whackpad 架起 Java/Node.js 服務
- 寫了一支 SQL importer 腳本，把各 workspace 的 SQL dump 匯入自架的資料庫

工具就位後，開始通知社群夥伴：可以搬進來。**g0v、moztw、ocf-tw、318（太陽花）** 等 workspace 陸續搬了進來，在 hackpad.tw 上繼續存在。

那支 SQL importer 的程式碼現在已經找不到了，但它完成了任務。

## middle2 是後盾，HackMD 接棒

hackpad.tw 能穩定維運，靠的是 middle2 這個基礎建設。Ronny 和 timothy 兩個人維護著這個服務。更換搜尋引擎是其中一項修改：原版 whackpad 用 Lucene，middle2 已經有 Elasticsearch，就把搜尋改接過來。

與此同時，**2018 年 5 月**，g0v 揪松團與 HackMD 合作，建立了獨立的 `g0v.hackmd.io`，社群的主力共筆工具正式替換成 HackMD。hackpad.tw 從此變成存放歷史紀錄的檔案庫，而不是日常協作的工具。

## 一台獨立的機器，24 美元一個月

**2018 年 11 月**，爬蟲流量越來越兇，原本共用的主機撐不住了。為了 hackpad.tw，額外增加了一台獨立的 Linode 4GB 主機，每月多出 24 美元的支出。

這台機器，從 2018 年 11 月一路跑到 2026 年 4 月，將近八年。累積費用：約**六萬多台幣**。

## 2022：廣告貼文太多，改為唯讀

**2022 年 9 月**，`g0v.hackpad.tw` 廣告貼文泛濫。加上社群早已大部分轉移到 HackMD，沒有繼續開放編輯的必要——改成唯讀，停止新增或修改。資料繼續保存，只是不再接受寫入。

## 2026：AI 爬蟲帶來問題，AI 工具帶來解法

唯讀應該很輕，但負載還是居高不下。AI 爬蟲大量抓取，而後端跑的還是完整的 Java/Node.js 應用——每一個請求都要跑相對重的程序。

解法是重寫。不需要編輯功能，只需要讀取既有資料庫的輕量 viewer。直接用 PHP 重寫一個，連接原有的 MySQL，不動資料本身。

hackpad 的 pad 內容存成 Easysync2 changeset 格式——以 diff 疊加的方式記錄所有修改歷程。重建最終文件需要從最近的 key revision 開始，把後面每個 changeset 套上去，再轉成 HTML。這套邏輯用 PHP 重新實作了一遍。

整個 viewer 用 **GitHub Copilot CLI 搭配 Claude Sonnet 4.6** 協助開發完成。

重寫之後，hackpad.tw 不再需要獨立伺服器，回到 middle2 共用主機上跑。**每月省下 24 美元，一年約 8,600 台幣**——用 AI 省下的錢，剛好把部分使用 AI 的費用回本了。

有個對調的地方值得記一下：AI 爬蟲造成了問題，AI 工具解決了問題。以前想不讓爬蟲來，現在反而歡迎——這些 2012 年以來的文本，拿去訓練模型也好，就讓它流通吧。

---

hackpad.tw 上面保存的不只是文字。那是 g0v 社群超過十年的思考脈絡，是太陽花那幾天的第一線記錄，是那個年代台灣公民社會怎麼協作的現場。讓這些東西繼續可以被看見，比讓服務維持運作這件事本身更重要。

**線上查看**：[hackpad.tw](https://hackpad.tw)（含 g0v、318、moztw 等 workspace 的歷史共筆）
