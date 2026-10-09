"""Consistency checks for src/data/library/points.json. Exit code 1 on any problem.

Run after scripts/assemble_library.py. Checks the rules in docs/library-pipeline.md.
"""
import json, re, sys
pts = json.load(open('src/data/library/points.json'))
vocab = json.load(open('docs/placement-vocab.json'))['views']
TECH = {'circle', 'press', 'knead', 'nail', 'gentle', 'ball'}
CAUT = {'pregnancy', 'pulse', 'eye', 'throat'}
TAGS = {'low_back_pain', 'headache', 'neck_pain', 'sleep', 'well_being', 'nausea', 'stress_anxiety',
        'menstrual_cramps', 'cold_flu', 'energy_fatigue', 'upper_back', 'shoulder_tension', 'eye_strain',
        'ear_hearing', 'digestive_health', 'hand_wrist_strain', 'foot_ankle_strain', 'toothache_jaw',
        'nose_sinus', 'cough_breathing', 'knee_pain', 'hip_leg_pain', 'constipation'}
DISEASE = re.compile(r'asthma|hypertension|diabet|epilep|stroke|infertil|cancer|tumou?r|tubercul|hepatitis|'
                     r'appendicitis|malaria|psychos|schizo|paralys|hemipleg|impoten|seizure|convuls|coma', re.I)
problems = []
seen = set()
for p in pts:
    c = p['code']
    def bad(msg): problems.append(f'{c}: {msg}')
    if p['id'] in seen: bad('duplicate id')
    seen.add(p['id'])
    if p['view'] not in vocab: bad(f"unknown view {p['view']}")
    if not ('xy' in p or 'place' in p): bad('no position')
    if p['selfCare'] == 'avoid':
        if p.get('technique') or p['tags']: bad('avoid point has technique or tags')
        if not p.get('avoidReason'): bad('avoid point without reason')
    elif p.get('technique') not in TECH: bad(f"bad technique {p.get('technique')}")
    if set(p['cautions']) - CAUT: bad('unknown caution')
    if ('pregnancy' in p['cautions']) != p['pregnancy']: bad('pregnancy flag and caution disagree')
    if set(p['tags']) - TAGS: bad('unknown tag')
    if any(DISEASE.search(i) for i in p['indications']): bad('disease name in indications')
    if not (30 <= len(p['find']) <= 260): bad(f"find length {len(p['find'])}")
    if re.search(r'\bcun\b|B-cun', p['find']): bad('jargon (cun) in find')
    if re.search(r'\b(LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV)\d{1,2}\b', p['find']): bad('point code in find text')
    sites = [s['s'] for s in p['sources']]
    indep = [s for s in sites if s not in ('who2008', 'va')]
    if p['evidence'] == 'who' and 'who2008' not in sites: bad('evidence who without WHO source')
    if p['evidence'] == 'refs' and len(indep) < 2: bad('evidence refs with fewer than 2 references')
    if p['evidence'] == 'va' and 'va' not in sites: bad('evidence va without VA source')
for msg in problems:
    print(msg)
print(f'{len(pts)} points, {len(problems)} problems')
sys.exit(1 if problems else 0)
