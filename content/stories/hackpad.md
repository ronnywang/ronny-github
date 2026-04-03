---
repo: "hackpad-viewer"
org: "openfunltd"
title: "hackpad.tw：讓歷史文件繼續活著"
date: "2017-07-19"
updated: "2025-04-02"
topics: ["hackpad", "g0v", "太陽花", "基礎建設", "middle2"]
language: "PHP"
isFork: false
github: https://github.com/openfunltd/hackpad-viewer
homepage: "https://hackpad.tw"
summary: "hackpad 是 g0v 社群十年共筆的家，太陽花那晚全台灣都在上面，後來 Dropbox 要關服務，Ronny 在關站前兩個月把社群的記憶搬進自己架的 hackpad.tw 保存起來。"
related:
  - middle2
  - g0v-slack-archive
---

## g0v 最愛的共筆工具

2012 年 g0v 社群剛成立時，hackpad 就已經是大家最常用的協作工具。每次大松開場提案，每個專案的討論筆記，每次活動的工作紀錄——都存在 hackpad 上。`g0v.hackpad.com` 這個 workspace 是社群共同的記憶體。

## 2014 年三月的那幾天

2014 年 3 月，太陽花學運爆發，g0v 社群也在裡面動員。

現場的訊息、分工協調、資源調度，大量透過 hackpad 傳遞。那幾天湧進的台灣使用者太多，hackpad 的伺服器撐不住了——為了台灣，hackpad 官方緊急加開伺服器應急。

但同年三月，Dropbox 把 hackpad 收購了。社群繼續用，只是多了一份不確定感。

## 2017：搶在關燈前把東西搬走

2017 年 4 月，hackpad 宣布：**2017 年 7 月 19 日中止服務**，請用戶自行匯出資料，日後轉向 Dropbox Paper。官方提供 SQL dump 下載。

大多數服務關閉時，使用者能做的就是下載資料、然後失去服務。但 hackpad 的原始碼是開放的——有人 fork 出來叫 whackpad，在 GitHub 上。

距離關站還有四十天，**2017 年 6 月 10 日**，g0v 揪松團緊急召集了一場「**搶救 g0v Hackpad 松**」，在 Mozilla Space 辦了半天的 hackathon，集合社群一起討論對策：要備份到哪裡、要用什麼工具、哪些 workspace 優先處理。

Ronny 在那段時間動手：

- 申請 `hackpad.tw` 網域
- Fork whackpad 架起 Java/Node.js 服務
- 寫了一支 SQL importer 腳本，把各 workspace 的 SQL dump 匯入自架的資料庫

工具就位後，開始通知社群夥伴：可以搬進來。**g0v、moztw、ocf-tw、318（太陽花）** 等 workspace 陸續搬了進來，在 hackpad.tw 上繼續存在。

那支 SQL importer 的程式碼現在已經找不到了，但它完成了任務。

## middle2 是後盾

hackpad.tw 能穩定維運，靠的是 middle2 這個基礎建設。

Ronny 和 timothy 兩個人維護著這個服務。更換搜尋引擎是其中一項修改：原版 whackpad 用 Lucene，middle2 已經有 Elasticsearch，就把搜尋改接到 middle2 的 Elastic 搜尋引擎，讓兩套基礎建設能整合在一起。

## SPAM 與唯讀

幾年後，hackpad.tw 碰到了 spam 入侵，有人利用開放的共筆服務亂發垃圾內容。解法很直接：改成唯讀模式。反正這些資料本來就只是要保存，不需要再編輯了。

## 2025：AI 爬蟲帶來新問題，AI 工具帶來新解法

唯讀服務應該很輕，但最近伺服器負載越來越高。原因是 AI 爬蟲大量抓取，而後端跑的還是完整的 Java/Node.js 應用——每一個請求都要跑相對重的程序。

解法是重寫。不需要編輯功能，只需要能讀取既有資料庫的輕量 viewer。直接用 PHP 重寫一個，連接原有的 MySQL，不動資料本身。

hackpad 的 pad 內容存成 Easysync2 changeset 格式——這是一套以 diff 疊加的方式記錄所有修改歷程的格式，重建最終文件需要從最近的 key revision 開始，把後面每一個 changeset 套上去，再轉成 HTML。這套邏輯用 PHP 重新實作了一遍。

整個 viewer 用 **GitHub Copilot CLI 搭配 Claude Sonnet 4.6** 協助開發完成。一套十年前的 Java 服務，用 AI 工具重寫成 PHP——某種程度上，是用新時代的工具繼續守護舊時代的記憶。

---

hackpad.tw 上面保存的不只是文字。那是 g0v 社群超過十年的思考脈絡，是太陽花那幾天的第一線記錄，是那個年代台灣公民社會怎麼協作的現場。讓這些東西繼續可以被看見，比讓服務維持運作這件事本身更重要。
