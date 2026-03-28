# g0v 黑客松資料集

這份資料集整理自 g0v 社群自 2012 年起舉辦的黑客松（大松）歷次活動紀錄，包含提案、短講與成果報告。

## 檔案說明

### `g0v-hackathons-list.json`

73 次黑客松的基本資訊列表（截至 2026 年 3 月）。

```json
[
  {
    "num": 1,
    "id": "g0v-hackath1n",
    "name": "零時政府黑客松",
    "date": "2012-12-01",
    "year": 2012
  }
]
```

### `g0v-hackathon-data.json`

54 次黑客松的詳細活動資料（有取得議程表者），含提案、短講、成果報告。

資料範圍：hackath11n（2014-12-20）～ hackath72n（2026-03-29）

整體統計：
- 涵蓋黑客松：**54 場**
- 提案總數：**747 筆**
- 短講總數：**185 筆**
- 成果報告：**495 筆**

#### 結構說明

```json
{
  "g0v-hackath56n": {
    "id": "g0v-hackath56n",
    "num": 56,
    "date": "2023-07-01",
    "name": "真的假的黑客松 x 水保局",
    "proposals_count": 19,
    "lightning_count": 4,
    "reports_count": 11,
    "proposals": [
      {
        "seq": 1,
        "time": "9:40",
        "presenter": "Teemo",
        "form": "實體出席",
        "project": "PTT",
        "topic": "批踢踢不能亡",
        "hackmd": "https://...",
        "slides": "https://...",
        "license": "MIT",
        "manpower": "...",
        "brief": "新版APP、測試、文件"
      }
    ],
    "lightning": [...],
    "reports": [...]
  }
}
```

#### 欄位說明

| 欄位 | 說明 |
|------|------|
| `seq` | 序號 |
| `time` | 提案/報告時間 |
| `presenter` | 提案人 |
| `form` | 出席形式（實體/線上/預錄影片） |
| `project` | 專案名稱 |
| `topic` | 提案題目（可能與 project 不同） |
| `hackmd` | 共筆連結 |
| `slides` | 投影片連結 |
| `license` | 授權條款 |
| `manpower` | 需要的人力/技能 |
| `brief` | 簡短說明 |

### `hackathon-sheets.json`

各次大松議程 Google Spreadsheet 的 URL 對照，共 47 筆。

### `hackathon-ethercalc/`

73 個 CSV 檔，從 `https://ethercalc-cache.g0v.tw/_/g0v-hackath{N}n/csv` 抓取的原始 hackfoldr 資料。

### `hackathon-spreadsheets/`

54 個 CSV 檔，各次大松議程試算表的原始 CSV。

## 資料來源

- **hackfoldr**：g0v 社群的共筆平台，每次大松的議程連結都會記錄在 hackfoldr，由 `ethercalc-cache.g0v.tw` 快取。
- **Google Sheets**：大約從 hackath20n 開始，議程從純文字改為試算表格式。
- **HackMD bookmode**：大約從 hackath66n 開始，改用 HackMD 的 bookmode 頁面（`@jothon/g0v-hackath{N}n`）統整各次活動連結。

## 已知缺漏

以下場次目前沒有結構化資料（僅有 hackathons-list.json 的基本資訊）：

- hackath1n～hackath10n（早期，議程格式較不統一）
- hackath13n、14n、19n、21n（資料未取得）
- hackath33n、38n、39n（COVID 線上活動或資料格式特殊）
- hackath45n（資料未取得）

## 使用方式

```javascript
import hackathonData from './g0v-hackathon-data.json';

// 取得特定大松的提案
const hack56 = hackathonData['g0v-hackath56n'];
const proposals = hack56.proposals;

// 找出所有含特定關鍵字的提案
const allProposals = Object.values(hackathonData)
  .flatMap(h => h.proposals.map(p => ({ ...p, hackathon: h.id, date: h.date })));
const openDataProposals = allProposals.filter(p =>
  (p.brief || '').includes('開放資料') || (p.topic || '').includes('開放資料')
);
```

## 授權

本資料集整理自 g0v 社群的公開資料，依 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) 釋出，可自由使用。

原始資料版權屬各提案人所有。

---

整理：[ronnywang](https://github.com/ronnywang)
最後更新：2026-03-28
