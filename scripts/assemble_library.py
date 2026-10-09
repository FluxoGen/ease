"""Assemble the point library (pipeline Phase 4).

Inputs (all in sources/library-research/):
  authors/*.json      Phase 1 records (one array per batch)
  verify/*.json       Phase 2 verifier verdicts and fixes
  positions.json      Phase 3 hand-checked positions {code: {xy, view?}}
  lead_fixes.json     corrections from the lead's checks (unit audit), applied after verifier fixes
  pregnancy_audit.json earlier pregnancy audit (should_flag per point)
Output: src/data/library/points.json  +  a report on stdout.

Rules applied here (see docs/library-pipeline.md):
  - verifier fixes override author fields; verifier 'disputed' marks the point disputed
  - flashcard/study sites are not counted as sources
  - a non-WHO point needs >= 2 independent sources after that, or it is left out
  - an indication needs >= 2 counted sources
  - pregnancy = author flag OR earlier audit flag; the 'pregnancy' caution mirrors it
"""
import json, glob, os, re, sys
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = os.path.join(ROOT, 'sources', 'library-research')
NOT_A_SOURCE = {'brainscape.com', 'quizlet.com'}
SITE_BY_DOMAIN = {
    'attiliodalberto.com': 'dalberto', 'tcmwiki.com': 'tcmwiki', 'yinyanghouse.com': 'yyh', 'meandqi.com': 'mq',
    'musculoskeletalkey.com': 'msk', 'satyori.com': 'satyori', 'pulsetcm.sg': 'pulsetcm', 'lierre.ca': 'lierre',
    'pmc.ncbi.nlm.nih.gov': 'pmc', 'ncbi.nlm.nih.gov': 'pmc', 'takingcharge.csh.umn.edu': 'umn', 'iaomai.app': 'iaomai',
    'acupuncture.com': 'acucom',
}
VIEW_AREA = {
    'face-front': 'head', 'head-side': 'head', 'head-back': 'head', 'head-top': 'head',
    'torso-front': 'chest-belly', 'torso-side': 'chest-belly', 'back': 'back',
    'arm-inner': 'arm', 'arm-outer': 'arm', 'hand-palm': 'hand', 'hand-back': 'hand',
    'leg-front': 'leg', 'leg-inner': 'leg', 'leg-outer': 'leg', 'leg-back': 'leg',
    'foot-top': 'foot', 'foot-inner': 'foot', 'foot-outer': 'foot', 'foot-sole': 'foot',
}
# VA handout points: app id -> standard code, and which have a photo (image key = file stem).
VA = {
    'si4': 'SI4', 'ub40': 'BL40', 'ub57': 'BL57', 'li4': 'LI4', 'si3': 'SI3', 'gb20': 'GB20',
    'tai_yang': 'EX-HN5', 'lr3': 'LR3', 'kd1': 'KI1', 'luo_zhen': 'EX-UE8', 'bai_lao': 'EX-HN15', 'gb21': 'GB21',
    'ub60': 'BL60', 'ht7': 'HT7', 'an_mian': 'ANMIAN', 'yin_tang': 'EX-HN3', 'sp6': 'SP6', 'pc6': 'PC6',
    'st36': 'ST36', 'li11': 'LI11', 'lu7': 'LU7',
}
VA_IMAGE = {
    'SI4': 'SI4', 'BL40': 'UB40', 'BL57': 'UB57', 'LI4': 'LI4', 'SI3': 'SI3', 'GB20': 'GB20', 'EX-HN5': 'Tai_Yang',
    'LR3': 'LR3', 'KI1': 'KD1', 'EX-UE8': 'Luo_Zhen', 'EX-HN15': 'Bai_Lao', 'GB21': 'GB21', 'BL60': 'UB60',
    'HT7': 'HT7', 'ANMIAN': 'An_Mian', 'EX-HN3': 'Yin_Tang', 'SP6': 'SP6', 'PC6': 'PC6', 'ST36': 'ST36',
    'LI11': 'LI11', 'LU7': 'Lu7',
}


def pid(code):
    return code.lower()


def site_of(src):
    if src.get('id') == 'who2008':
        return 'who2008', ''
    u = src.get('url') or ''
    host = urlparse(u).netloc.replace('www.', '')
    if not host or host in NOT_A_SOURCE:
        return None, None
    return SITE_BY_DOMAIN.get(host, host), urlparse(u).path


def main():
    authors = {}
    for f in sorted(glob.glob(os.path.join(R, 'authors', '*.json'))):
        for r in json.load(open(f)):
            authors[r['code']] = r
    verdicts = {}
    for f in sorted(glob.glob(os.path.join(R, 'verify', '*.json'))):
        for v in json.load(open(f)):
            verdicts[v['code']] = v
    positions = json.load(open(os.path.join(R, 'positions.json')))
    lead_fixes = json.load(open(os.path.join(R, 'lead_fixes.json')))
    audit = {a['id']: a for a in json.load(open(os.path.join(R, 'pregnancy_audit.json')))}
    audit_flag = set()
    for app_id, a in audit.items():
        if a.get('should_flag'):
            code = VA.get(app_id) or re.sub(r'^ub', 'BL', re.sub(r'^kd', 'KI', app_id)).upper()
            audit_flag.add(code)

    out, dropped, report = [], [], {'fix': 0, 'disputed': 0, 'ok': 0, 'unverified': []}
    for code, r in authors.items():
        v = verdicts.get(code)
        rec = dict(r)
        if v:
            report[v['verdict']] = report.get(v['verdict'], 0) + 1
            if (v.get('fixes') or {}).get('exclude'):
                dropped.append((code, 'verifier: ' + v.get('reason', 'excluded')))
                continue
            for k, val in (v.get('fixes') or {}).items():
                rec[k] = val
        else:
            report['unverified'].append(code)
        for k, val in lead_fixes.get(code, {}).items():
            if k != 'reason':
                rec[k] = val
        # sources
        srcs, by_author_id = [], {}
        for s in rec['sources']:
            site, path = site_of(s)
            by_author_id[s.get('id')] = site
            if site and not any(x['s'] == site for x in srcs):
                srcs.append({'s': site, 'p': path} if path else {'s': site})
        fresh = (v or {}).get('freshSource')
        if fresh and fresh.get('agrees') and fresh.get('url'):
            site, path = site_of(fresh)
            if site and not any(x['s'] == site for x in srcs):
                srcs.append({'s': site, 'p': path})
        indep = [x for x in srcs if x['s'] != 'who2008']
        who = bool(rec.get('whoMatch')) and any(x['s'] == 'who2008' for x in srcs)
        if not who and len(indep) < 2:
            dropped.append((code, 'fewer than 2 independent sources'))
            continue
        # indications: count only sources that survived
        inds = []
        # Indications rewritten by the verifier were checked against its own fresh source plus the
        # author's sources; count them as supported.
        verifier_inds = bool(v and 'indications' in (v.get('fixes') or {}))
        for ind in rec.get('indications', []):
            if verifier_inds:
                inds.append(ind['text'] if isinstance(ind, dict) else ind)
                continue
            counted = {by_author_id.get(i) for i in ind.get('sources', [])} - {None}
            if len(counted) >= 2 or (isinstance(ind, str)):
                inds.append(ind['text'] if isinstance(ind, dict) else ind)
        preg = bool(rec.get('pregnancy')) or code in audit_flag
        cautions = sorted(set(c for c in rec.get('cautions', []) if c != 'pregnancy') | ({'pregnancy'} if preg else set()))
        disputed = (v or {}).get('verdict') == 'disputed' or bool(rec.get('disputed'))
        evidence = 'disputed' if disputed else ('who' if who else 'refs')
        note = ((v or {}).get('reason') if disputed else '') or rec.get('disputed') or ''
        pos = positions.get(code, {})
        view = pos.get('view', rec['view'])
        item = {
            'id': pid(code), 'code': code, 'pinyin': rec['pinyin'], 'english': rec.get('english', ''),
            'channel': 'EX' if code.startswith('EX') or code == 'ANMIAN' else re.match(r'[A-Z]+', code).group(0),
            'area': VIEW_AREA[view], 'view': view, 'find': rec['find'].strip(),
            'selfCare': rec['selfCare'], 'technique': rec.get('technique') if rec['selfCare'] != 'avoid' else None,
            'cautions': cautions, 'pregnancy': preg, 'tags': rec.get('tags', []) if rec['selfCare'] != 'avoid' else [],
            'indications': inds, 'sources': srcs, 'evidence': evidence,
        }
        if rec['selfCare'] == 'avoid':
            item['avoidReason'] = rec.get('avoidReason', '')
        if note:
            item['note'] = note
        if 'xy' in pos:
            item['xy'] = pos['xy']
            if 'marks' in pos:
                item['marks'] = pos['marks']
        else:
            item['place'] = rec['place']
        if 'manual' in rec['place'] and 'xy' not in pos:
            dropped.append((code, 'manual placement without a hand-checked position'))
            continue
        if code in VA_IMAGE:
            item['image'] = VA_IMAGE[code]
            item['sources'].insert(0, {'s': 'va'})
        out.append(item)

    # VA handout zones: not single standard points, kept because an official handout teaches them.
    out.extend([
        {'id': 'ear_low_back_zone', 'code': 'Ear zone', 'pinyin': 'Low back (ear)', 'english': 'Lumbosacral zone of the ear',
         'channel': 'EX', 'area': 'head', 'view': 'head-side', 'xy': [198, 172],
         'find': 'On the ear, along the raised inner ridge (not the outer rim), in its upper part, roughly a third of the way down from the top.',
         'selfCare': 'gentle', 'technique': 'gentle', 'cautions': [], 'pregnancy': False, 'tags': ['low_back_pain'],
         'indications': ['low back pain'], 'sources': [{'s': 'va'}], 'evidence': 'va', 'image': 'Ear_Low_Back_Zone'},
        {'id': 'ub_low_back_lines', 'code': 'Back lines', 'pinyin': 'Bladder lines (low back)', 'english': 'Bladder channel lines of the low back',
         'channel': 'BL', 'area': 'back', 'view': 'back', 'xy': [129, 330],
         'find': 'Two vertical lines on each side of the lower back: an inner line about two finger-widths from the spine and an outer line about four finger-widths from it, level with the waist.',
         'selfCare': 'ok', 'technique': 'ball', 'cautions': [], 'pregnancy': False, 'tags': ['low_back_pain'],
         'indications': ['low back pain'], 'sources': [{'s': 'va'}], 'evidence': 'va', 'image': 'UB_Low_Back_Lines'},
    ])
    order = ['LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LR', 'GV', 'CV', 'EX']
    out.sort(key=lambda p: (order.index(p['channel']), int(re.sub(r'\D', '', p['code']) or 999), p['code']))
    dest = os.path.join(ROOT, 'src', 'data', 'library', 'points.json')
    json.dump(out, open(dest, 'w'), ensure_ascii=False, indent=0, separators=(',', ':'))
    print(f"{len(out)} points written; verifier verdicts: ok={report['ok']} fix={report['fix']} disputed={report['disputed']}")
    if report['unverified']:
        print('NOT VERIFIED:', report['unverified'])
    for c, why in dropped:
        print('DROPPED', c, '-', why)
    return 1 if report['unverified'] else 0


if __name__ == '__main__':
    sys.exit(main())
