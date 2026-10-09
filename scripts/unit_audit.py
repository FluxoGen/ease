"""Check that distances in each point's plain-language text match its WHO measurement.

Conversion table (frozen): 1 cun = 1 thumb-width; 2 finger-widths = 1.5; 3 finger-widths = 2;
4 finger-widths = one hand-width = 3. Flags a point when a distance in `find` matches no B-cun value
in its WHO entry (sums like "a hand-width plus two finger-widths" are added up).
"""
import json, re, sys
WHO = json.load(open(sys.argv[1]))
pts = json.load(open('src/data/library/points.json'))
NUM = {'half a': 0.5, 'half': 0.5, 'a': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
       'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'one and a half': 1.5, 'two and a half': 2.5}
UNIT = {'thumb': 1.0, 'finger': None, 'hand': 3.0}
FINGERS = {1: 0.75, 2: 1.5, 3: 2.0, 4: 3.0}
num_re = r'(one and a half|two and a half|half a|half|a|one|two|three|four|five|six|seven|eight|nine|ten|\d+(?:\.\d+)?)'
term = re.compile(num_re + r"[ -](thumb|finger|hand)(?:'s)?[ -]?widths?", re.I)

def distances(text):
    """Each distance phrase, with '... plus ...' chains summed."""
    t = text.lower()
    out = []
    for clause in re.split(r'[,.;()]| and | or ', t):
      for chain in [clause]:
        parts = list(term.finditer(chain))
        if not parts:
            continue
        # only "X plus Y" adds up; otherwise each phrase is its own distance
        if ' plus ' not in chain and len(parts) > 1:
            for m in parts:
                n = NUM.get(m.group(1)); n = float(m.group(1)) if n is None else n
                out.append(round(FINGERS.get(int(n), n * 0.75) if m.group(2) == 'finger' else n * UNIT[m.group(2)], 2))
            continue
        total = 0.0
        for m in parts:
            n = NUM.get(m.group(1), None)
            n = float(m.group(1)) if n is None else n
            u = m.group(2)
            total += FINGERS.get(int(n), n * 0.75) if u == 'finger' else n * UNIT[u]
        out.append(round(total, 2))
    return out

flags = 0
for p in pts:
    w = WHO.get(p['code'])
    if not w or p['evidence'] == 'va':
        continue
    who = {float(x) for x in re.findall(r'(\d+(?:\.\d+)?)\s*B-\s*cun', w['who_text'].replace('\n', ' '))}
    if not who:
        continue
    for d in distances(p['find']):
        if not any(abs(d - c) <= 0.26 for c in who):
            flags += 1
            print(f"{p['code']:6} text={d:<5} WHO={sorted(who)} | {p['find']}")
print(f'{flags} distance(s) to review')
