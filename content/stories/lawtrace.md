---
repo: "lawtrace"
title: "Lawtrace 立法足跡"
date: "2024-11-14"
updated: "2026-03-23"
topics: ["legislature", "open-data", "g0v", "open-gov"]
language: "PHP"
stars: 5
forks: 0
isFork: false
forkedFrom: ""
homepage: "https://lawtrace.tw"
lysayit_old: "https://g0v.github.io/lysayit/"
lysayit_new: "https://lysayit.openfun.app/"
githubUrl: "https://github.com/openfunltd/lawtrace"
summary: "從 2013 年「法律也可以 diff」的念頭，歷經十年累積，在 WFD 支持下做了使用者研究、組了團隊，2025 年初正式上線的立法院資料整合平台"
relatedRepos: ["law-diff", "lysayit", "dataly-v2", "ly-user-study"]
---

這個故事的起點，要從很多年前說起。

g0v 社群裡有個老專案叫「國會大代誌」，把立法院議案做成友善的法案對照表。mysociety 有個叫 sayit 的專案，把難以閱讀的逐字稿變成有結構的對話介面。2013 年，victorhsieh 把台灣所有法律放進 git repository，讓每次法律修訂變成一個 commit——那時意識到，法律跟程式碼一樣，是有版本歷史的文本，是可以 diff 的。

這些念頭各自在腦子裡沉著。

真正讓這一切收攏成形的，是 2020 年。那年加入了立法院的 OGP 開放國會行動方案，開始認真研究怎麼讓立法院的資料變得更容易查閱。有了具體的場域和問題，各種嘗試就跟著來了：`lysayit` 試著把立法院公報轉成 sayit 式的友善介面；與公督盟合作的 `law-diff`，讓議案修正前後的條文差異一目瞭然。這些都是探索，試驗哪條路走得通。

基礎設施也在這段時間慢慢成形。過去十幾年，資料清理一直是做應用的第一步；為了讓立法院資料能被乾淨地取用，做了 `lyapi`，再發現 lyapi 每加一個資料來源就長出一個格式完全不同的 API，難以使用，於是重寫成統一規格的 `lyapi2`（`v2.ly.govapi.tw`）。規格統一之後，還做了 `dataly`——讓不會寫程式的人也能直接瀏覽 API 資料的介面。這些基礎設施，後來都成了 lawtrace 的地基。

機緣是在一場研討會上拿到的一張名片——WFD，一個支持民主的英國基金會。帶著歐噴這幾年在開放國會公民科技上的積累，跟長期合作的 PM Claire 一起去提案。WFD 的回應很務實：題目太多，不急著決定做哪個，先撥一筆經費做使用者研究，訪談倡議團體、媒體記者、立委助理，搞清楚哪個產品是他們真正最需要的，再決定下一步。

研究做完，方向定了：整合立法院資料、讓查閱法案的流程從跨十幾個網站變成一個地方就能完成。這就是 lawtrace。

有了資金，就能組一個完整的團隊——研究訪談、資料整理、視覺設計都有專人負責，不再是一個人下班後的業餘時間。2025 年 1 月，lawtrace 正式上線。整年持續收集意見改進，辦了不少推廣活動。現在的主要使用者是倡議團體和立委助理——剛好就是當初使用者研究訪談的那群人。

lawtrace 的每個頁面底部，都放著這頁用到的 lyapi 連結。這是一個刻意的設計：希望每一個查閱資料的人，都能順手看到資料本身長什麼樣子，進而有更多人來使用立法院的原始資料。

---

**研究與推廣資料**：
- [立法院資料取用研究報告](https://openfun.tw/ly-user-study)（WFD 補助、使用者研究成果）
- [LawTrace 使用者指引](https://docs.google.com/presentation/d/16xMBE3Gsk3RToft5nIwHqCJo56o1u2-jBMAtzE5izEU/edit)
- [LawTrace 推廣報告](https://docs.google.com/presentation/d/1KGeWMtB_MlDNpmPgadsgcjGaeXYXDq5y/edit)
