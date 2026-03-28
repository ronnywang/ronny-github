---
repo: "twgeojson"
title: "台灣行政區界 GeoJSON"
date: "2012-11-29"
updated: "2013-11-13"
topics: ["gis", "geojson", "open-data", "g0v"]
language: "PHP"
stars: 47
forks: 19
isFork: false
forkedFrom: ""
homepage: ""
githubUrl: "https://github.com/ronnywang/twgeojson"
summary: "把政府的 Shapefile 格式行政區界資料轉成 GeoJSON，讓 Web 工程師也能直接用在地圖上"
hackathon:
  term: 0
  event: "g0v hackath0n | 台灣零時政府第零次動員勘亂黑客松"
  date: "2012-12-01"
---

2012 年 12 月，台灣第一次 g0v 黑客松即將登場。我想做的是「人口等資訊地圖化」——把政府公布的人口統計資料畫在地圖上，讓數字變成可以看的東西。

要畫地圖，首先得有行政區的疆界資料。政府確實有公布，但格式是 Shapefile——一種 GIS 專業軟體用的格式，對於 Web 出身的工程師來說完全陌生。Shapefile 需要專門的工具才能打開，無法直接在瀏覽器裡使用。

黑客松前兩天，我花時間研究怎麼把 Shapefile 轉成 GeoJSON——一種 Web 工程師熟悉、可以直接丟進 JavaScript 地圖庫的格式。轉換成功之後，順手整理成不同精度的版本（從 70MB 的原始精度到 89KB 的簡化版，配合不同使用場景），打包開源放上 GitHub，希望讓之後想做地圖的人不必再重新走一遍這個陌生的流程。

工具做好帶去黑客松，當天就有人用上了。現場有個組在做「台灣各鄉鎮市區人口密度視覺化」，另一個組在做人口金字塔，都接上了 twgeojson 的資料；clkao 也在現場幫其他想做地圖的人說明這套工具怎麼用。那天才第一次意識到：「做一個夠基礎的工具、放出去」這個動作，別人能接住的速度比你預期的還快。

這個 repo 後來持續被許多台灣地圖相關專案引用，成為做台灣地理資料視覺化時常用的起點。對我自己來說，這也是開啟 GIS 研究的入口——之後很多專案開始引入地理資訊的概念，地圖成為呈現台灣開放資料的重要方式之一。
