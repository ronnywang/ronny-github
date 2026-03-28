#!/usr/bin/env python3
"""
Parse g0v hackathon spreadsheet CSVs into structured JSON.
Handles multiple schema versions across hackath11n ~ hackath72n.

Schema versions:
  OLD  (hackath11-51): seq, time, complete, presenter, cc-by, topic, license, notes, slides, ...
  NEW  (hackath52+):   seq, time, complete, presenter, form, cc-by, project, topic, license, hackmd, slides, ...
  V64  (hackath64):    seq, time, presenter, form, cc-by, project, topic, license, ...  (no 完成 col)
  NOHEADER (58):       same as NEW but header row is missing

Section detection (sparse rows with ≤3 non-empty cells):
  proposal  → default at start
  lightning → row contains 短講 / lightning talk / 8分鐘 / 8min
  report    → row contains 成果報告 / present project / result
"""

import csv
import json
import os
import re
import glob

SHEET_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'hackathon-spreadsheets')
HACKATHONS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'g0v-hackathons-list.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'g0v-hackathon-data.json')


# ─── Column detection helpers ──────────────────────────────────────────────

def col_idx(header_row, *keywords):
    """Find the index of the first column whose header contains any of the keywords (case-insensitive)."""
    for j, cell in enumerate(header_row):
        cell_lower = cell.lower().replace('\n', ' ').replace('/', ' ')
        if any(kw.lower() in cell_lower for kw in keywords):
            return j
    return None


def build_col_map(header_row):
    """
    Build {field: col_index} from header row.
    Returns dict with keys: time, complete, presenter, form, topic, project,
                            license, hackmd, slides, keywords, manpower
    """
    m = {}
    m['time']      = col_idx(header_row, '發表時間', 'time')
    m['complete']  = col_idx(header_row, '完成', 'done')
    m['presenter'] = col_idx(header_row, '發表者', 'presenter')
    m['form']      = col_idx(header_row, '提案形式', 'form', '出席')
    m['ccby']      = col_idx(header_row, 'cc-by', 'cc by', '錄影')
    m['project']   = col_idx(header_row, '專案名稱', 'project name', 'project na')
    m['topic']     = col_idx(header_row, '主題', 'topic')
    m['license']   = col_idx(header_row, '授權', 'licens')
    m['hackmd']    = col_idx(header_row, '共筆', '討論連結', 'hackmd', 'notes')
    m['slides']    = col_idx(header_row, '投影片連結', 'slide', '成果／投影', '相關連結\nrelated')
    m['keywords']  = col_idx(header_row, '關鍵字', 'keyword')
    m['manpower']  = col_idx(header_row, '徵人', 'recruit', 'people')
    m['brief']     = col_idx(header_row, '一句話', 'brief', '簡介')
    return m


def infer_col_map_no_header(data_rows):
    """
    When there's no header row, infer schema from the content of first few data rows.
    Checks if col4 contains form values like 實體/預錄/線上 → newer schema.
    """
    form_values = {'實體', '預錄', '線上', 'in person', 'online', 'remote'}

    for row in data_rows[:5]:
        if len(row) > 4:
            c4 = row[4].strip().lower()
            if any(fv in c4 for fv in form_values):
                # Newer schema: seq, time, complete, presenter, form, ccby, project, topic, license, hackmd, slides
                return {
                    'time': 1, 'complete': 2, 'presenter': 3, 'form': 4,
                    'ccby': 5, 'project': 6, 'topic': 7, 'license': 8,
                    'hackmd': 9, 'slides': 10,
                    'keywords': None, 'manpower': None, 'brief': None
                }

    # Old schema fallback: seq, time, complete, presenter, ccby, topic, license, notes, slides
    return {
        'time': 1, 'complete': 2, 'presenter': 3, 'form': None,
        'ccby': 4, 'project': None, 'topic': 5, 'license': 6,
        'hackmd': 7, 'slides': 8,
        'keywords': 9, 'manpower': 10, 'brief': None
    }


# ─── Section detection ─────────────────────────────────────────────────────

def detect_section(row):
    """
    If this is a section-header row (sparse, ≤3 non-empty cells), return the section name.
    Otherwise return None.
    """
    non_empty = [c.strip() for c in row if c.strip()]
    if len(non_empty) > 3:
        return None

    full = ' '.join(row).lower()

    # If the row mentions all 3 sections together (e.g. "提案、短講、成果報告都在臉書直播"),
    # it's a general description row, not a section header.
    has_proposal_kw  = bool(re.search(r'提案', full))
    has_lightning_kw = bool(re.search(r'短講|lightning talk|8.?分鐘|8.?min', full))
    has_report_kw    = bool(re.search(r'成果報告|present project|project report|成果分享', full))

    # If the row mentions 2+ different sections, it's a schedule/agenda row, not a section marker
    section_types_mentioned = sum([has_proposal_kw, has_lightning_kw, has_report_kw])
    if section_types_mentioned >= 2:
        return None
    # Also skip if it mentions both 提案 and 成果 (another common schedule description pattern)
    if has_proposal_kw and has_report_kw:
        return None

    if has_lightning_kw:
        return 'lightning'
    if has_report_kw:
        return 'report'
    # Also check time-based section markers (but only if not mixed with proposal keywords)
    if not has_proposal_kw and re.search(r'\b(16:00|17:00|16:30|17:30)\b', full):
        return 'report'
    return None


def is_data_row(row, col_map):
    """Check if a row looks like an actual data entry (has time or seq)."""
    if not any(c.strip() for c in row):
        return False

    # Must have a time value in col1 (or the time column)
    time_col = col_map.get('time', 1)
    if time_col is not None and time_col < len(row):
        t = row[time_col].strip()
        if re.search(r'\d+:\d+', t):
            return True
        # Accept 候補 / waitlisted slots as valid rows
        if t in ('候補', '候補席', 'waitlist'):
            return True

    # Or has a sequential number in col0
    if row and re.match(r'^\d+$', row[0].strip()):
        # and has some other non-empty cell beyond col0
        if sum(1 for c in row[1:] if c.strip()) >= 1:
            return True

    # Has a presenter value in col3 with other content (catch-all for unusual rows)
    presenter_col = col_map.get('presenter', 3)
    if presenter_col is not None and presenter_col < len(row):
        p = row[presenter_col].strip()
        if p and len(p) >= 2 and not re.match(r'^https?://', p):
            other = sum(1 for c in row if c.strip())
            if other >= 3:
                return True

    return False


def get(row, idx, default=''):
    if idx is None or idx >= len(row):
        return default
    return row[idx].strip()


# ─── Parse a single CSV ────────────────────────────────────────────────────

def parse_csv(filepath, hackathon_id):
    with open(filepath, encoding='utf-8') as f:
        rows = list(csv.reader(f))

    if not rows:
        return None

    # Find header row (contains 發表者 or Presenter or 發表時間)
    header_row_idx = None
    col_map = None
    for i, row in enumerate(rows[:15]):
        joined = ' '.join(row).lower()
        if '發表者' in joined or 'presenter' in joined:
            header_row_idx = i
            col_map = build_col_map(row)
            break

    # If no header found, infer from data
    data_start = header_row_idx + 1 if header_row_idx is not None else 0
    if col_map is None:
        # Skip obviously non-data rows at the start
        data_start = 0
        while data_start < len(rows) and not is_data_row(rows[data_start], {'time': 1}):
            data_start += 1
        col_map = infer_col_map_no_header(rows[data_start:data_start+10])

    proposals = []
    lightning = []
    reports = []
    current_section = 'proposal'

    prop_seq = 0
    light_seq = 0
    report_seq = 0

    for row in rows[data_start:]:
        # Pad row to avoid index errors
        while len(row) < 20:
            row.append('')

        # Check for section change
        sec = detect_section(row)
        if sec:
            current_section = sec
            continue

        # Check if this looks like a real data row
        if not is_data_row(row, col_map):
            continue

        # Extract seq number from col0
        seq_val = row[0].strip()
        try:
            seq = int(seq_val)
        except ValueError:
            # Use auto-increment if no seq
            if current_section == 'proposal':
                prop_seq += 1
                seq = prop_seq
            elif current_section == 'lightning':
                light_seq += 1
                seq = light_seq
            else:
                report_seq += 1
                seq = report_seq

        # Build entry
        entry = {}

        time_val = get(row, col_map.get('time'))
        if time_val:
            entry['time'] = time_val

        presenter = get(row, col_map.get('presenter'))
        if presenter and not re.match(r'^https?://', presenter):
            entry['presenter'] = presenter

        form = get(row, col_map.get('form'))
        if form and not re.match(r'^https?://', form):
            entry['form'] = form

        # project name (newer schema) vs topic (older schema)
        project = get(row, col_map.get('project'))
        topic = get(row, col_map.get('topic'))

        # If we have both, use both; if only topic, use as project
        if project and not re.match(r'^https?://', project):
            entry['project'] = project
        if topic and not re.match(r'^https?://', topic):
            if topic != project:
                entry['topic'] = topic
            elif not project:
                entry['project'] = topic

        if not project and topic:
            entry['project'] = topic

        hackmd = get(row, col_map.get('hackmd'))
        if hackmd and re.match(r'^https?://', hackmd):
            entry['hackmd'] = hackmd

        slides = get(row, col_map.get('slides'))
        if slides and re.match(r'^https?://', slides):
            entry['slides'] = slides

        license_val = get(row, col_map.get('license'))
        if license_val and not re.match(r'^https?://', license_val) and len(license_val) < 50:
            entry['license'] = license_val

        keywords = get(row, col_map.get('keywords'))
        if keywords and not re.match(r'^https?://', keywords):
            entry['brief'] = keywords

        manpower = get(row, col_map.get('manpower'))
        if manpower and not re.match(r'^https?://', manpower):
            entry['manpower'] = manpower

        # Skip completely empty entries
        if not any(v for k, v in entry.items() if k != 'time'):
            continue

        entry['seq'] = seq

        if current_section == 'proposal':
            proposals.append(entry)
        elif current_section == 'lightning':
            lightning.append(entry)
        else:
            reports.append(entry)

    return {
        'proposals': proposals,
        'lightning': lightning,
        'reports': reports,
    }


# ─── Main ──────────────────────────────────────────────────────────────────

def main():
    with open(HACKATHONS_FILE) as f:
        hackathons = json.load(f)

    # Build name/date lookup by id (constructed from num)
    hack_lookup = {f"g0v-hackath{h['num']}n": h for h in hackathons}

    result = {}

    csv_files = sorted(glob.glob(os.path.join(SHEET_DIR, '*.csv')))
    print(f"Found {len(csv_files)} CSV files")

    for filepath in csv_files:
        basename = os.path.basename(filepath).replace('.csv', '')
        h_info = hack_lookup.get(basename, {})

        parsed = parse_csv(filepath, basename)
        if parsed is None:
            print(f"  SKIP {basename}: empty or unreadable")
            continue

        n_proposals = len(parsed['proposals'])
        n_lightning = len(parsed['lightning'])
        n_reports = len(parsed['reports'])

        if n_proposals + n_lightning + n_reports == 0:
            print(f"  SKIP {basename}: no entries found")
            continue

        entry = {
            'id': basename,
            'num': h_info.get('num', 0),
            'date': h_info.get('date', ''),
            'name': h_info.get('name', ''),
            'proposals_count': n_proposals,
            'lightning_count': n_lightning,
            'reports_count': n_reports,
            'proposals': parsed['proposals'],
            'lightning': parsed['lightning'],
            'reports': parsed['reports'],
        }

        result[basename] = entry

        # Check for Ronny
        RONNY = ['ronny', 'ronnywang', '王向榮']
        def has_ronny(entries):
            return [e for e in entries if any(r in (e.get('presenter') or '').lower() for r in RONNY)]

        ronny_p = has_ronny(parsed['proposals'])
        ronny_l = has_ronny(parsed['lightning'])
        ronny_r = has_ronny(parsed['reports'])

        ronny_info = ''
        if ronny_p or ronny_l or ronny_r:
            items = []
            for e in ronny_p:
                items.append(f"[提案] {e.get('project') or e.get('topic', '?')}")
            for e in ronny_l:
                items.append(f"[短講] {e.get('project') or e.get('topic', '?')}")
            for e in ronny_r:
                items.append(f"[成果] {e.get('project') or e.get('topic', '?')}")
            ronny_info = ' | Ronny: ' + ', '.join(items)

        print(f"  {basename}: p={n_proposals} l={n_lightning} r={n_reports}{ronny_info}")

    # Sort by num
    result = dict(sorted(result.items(), key=lambda x: x[1]['num']))

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total_p = sum(h['proposals_count'] for h in result.values())
    total_l = sum(h['lightning_count'] for h in result.values())
    total_r = sum(h['reports_count'] for h in result.values())
    print(f"\nDone! {len(result)} hackathons, {total_p} proposals, {total_l} lightning, {total_r} reports")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
