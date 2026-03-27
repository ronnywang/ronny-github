---
repo: twbudget
also: twbudget-crawler
title: 復活預算視覺化：從 Yahoo Hackday 到 13 年後的 OpenBudget
date: 2019-01-08
topics:
  - g0v
  - 預算
  - 開放資料
  - 資料視覺化
  - 基礎建設
language: PHP
stars: 0
summary: twbudget 是 g0v 的源起之作——clkao、kirby 等人在 2012 年 Yahoo Hackday 的得獎作品，獎金催生了第0次黑客松，也讓 g0v.tw 在同年誕生。資料卻凍結在 2012 年，直到 Ronny 在 2018 年自製爬蟲重新餵養它，讓 budget.g0v.tw 持續更新到 2025 年——並在 13 年後長出了 OpenBudget。
githubUrl: https://github.com/ronnywang/twbudget-crawler
homepage: https://budget.g0v.tw/
---

# 復活預算視覺化：從 Yahoo Hackday 到 13 年後的 OpenBudget

## g0v 的起點

2012 年，clkao、kirby 等人帶著一份台灣中央政府預算的視覺化作品參加 **Yahoo Hackday**，拿下佳作。這個專案叫做 twbudget——把國家的錢花在哪裡，用互動圖表讓任何人都能看懂。

獎金不算多，但 clkao 用它辦了一件更大的事：**2012 年 12 月的第 0 次 g0v 黑客松**。為了這個作品，他們也申請了 `g0v.tw` 的網域。**2012 年 10 月 24 日，g0v.tw 網域註冊當天，就是 g0v 的生日。**

twbudget，是 g0v 的起源之作。

## 資料凍結的六年

twbudget 上線後，成為 g0v 早年最具代表性的展示作品——清楚證明開放資料加上資料視覺化能做什麼。budget.g0v.tw 被引介到義大利、其他國家的公民科技社群，也透過 tonyq 帶入了台灣部分縣市政府作為內部工具參考。

但這個成功背後有個沉默的問題：**資料一直凍結在 2012 年**。

網站還活著，視覺化還能跑，但顯示的永遠是十年前的數字。沒有人補資料，因為主計總處的預算 Excel 格式複雜、年年有細微差異，轉換起來費工。

## 2018：自製爬蟲，重新餵養

Ronny 這時候才進場。他跟 twbudget 的誕生並無關係，但看到這個好用的工具就這樣空轉著，決定自己解決資料問題。

2019 年 1 月，`twbudget-crawler` 建立。這支爬蟲的任務是：
- 從主計總處下載歷年中央政府總預算的 Excel 檔
- 解析歲出政事別、歲出機關別、歲入來源別三張表
- 轉換成 budget.g0v.tw 需要的 CSV 格式

格式每年都不太一樣，PHP 腳本要一一對付。但從 2018 年起，budget.g0v.tw 的資料開始追上現實——一年一年，從 2012 補到 2025 年。

## 13 年的連結

2025 年，Ronny 開始開發 **OpenBudget**——一個用搜尋引擎方式查詢政府預算的新平台，讓人不用看一千頁 PDF，就能找到關心的預算項目。

從 twbudget 到 OpenBudget，隔了整整 13 年。

twbudget 在 2012 年展示了「預算可以被看見」，Ronny 在 2018 年讓它的資料不再老化，2025 年再往前推：讓更多人能真正用上這些資料。這條線一直都在，只是每一段由不同的人接起來。
