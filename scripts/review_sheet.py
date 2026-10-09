"""Export a review sheet for a licensed acupuncturist, most important points first.

Usage: python3 scripts/review_sheet.py > sources/review/acupuncturist-review.csv
The reviewer fills the last four columns; scripts/import_review.py reads it back.
"""
import csv, json, sys

pts = json.load(open('src/data/library/points.json'))
routine_core = {'si4', 'bl40', 'bl57', 'li4', 'si3', 'gb20', 'ex-hn5', 'lr3', 'ki1', 'ex-ue8', 'ex-hn15', 'gb21',
                'bl60', 'ht7', 'anmian', 'ex-hn3', 'sp6', 'pc6', 'li11', 'lu7', 'st36'}


def priority(p):
    if p['selfCare'] == 'avoid' or p['pregnancy']:
        return 1, 'safety: reference-only or pregnancy flag'
    if p['evidence'] == 'disputed':
        return 2, 'references disagree on location'
    if p['id'] in routine_core:
        return 3, 'shown first in a symptom routine'
    if p['channel'] == 'EX':
        return 4, 'extra point (no WHO 2008 location)'
    return 5, 'standard point'


rows = sorted(pts, key=lambda p: (priority(p)[0], p['code']))
w = csv.writer(sys.stdout)
w.writerow(['priority', 'why', 'code', 'name', 'app_link', 'location_text', 'evidence', 'self_care', 'pregnancy',
            'cautions', 'dispute_note', 'REVIEW_location_ok (yes/no)', 'REVIEW_safety_ok (yes/no)',
            'REVIEW_corrected_location', 'REVIEW_notes'])
for p in rows:
    pr, why = priority(p)
    w.writerow([pr, why, p['code'], f"{p['pinyin']} ({p['english']})", f"https://ease-murex.vercel.app/point/{p['id']}",
                p['find'], p['evidence'], p['selfCare'], 'yes' if p['pregnancy'] else 'no', ' '.join(p['cautions']),
                p.get('note', ''), '', '', '', ''])
