"""Read a filled-in acupuncturist review sheet back into the pipeline.

Usage: python3 scripts/import_review.py <filled.csv> "<reviewer name, credential>" <YYYY-MM-DD>
Writes sources/library-research/review.json; then rerun assemble_library.py and check_library.py.
  - location_ok=yes and safety_ok=yes  -> point is marked reviewed (shown in the app)
  - REVIEW_corrected_location filled  -> replaces the location text, and the point is marked reviewed
  - location_ok=no without a correction -> point is marked disputed with the reviewer's note
"""
import csv, json, os, sys

src, reviewer, date = sys.argv[1], sys.argv[2], sys.argv[3]
out_path = os.path.join('sources', 'library-research', 'review.json')
review = json.load(open(out_path)) if os.path.exists(out_path) else {}
n = 0
for row in csv.DictReader(open(src)):
    loc = row['REVIEW_location_ok (yes/no)'].strip().lower()
    safe = row['REVIEW_safety_ok (yes/no)'].strip().lower()
    fixed = row['REVIEW_corrected_location'].strip()
    notes = row['REVIEW_notes'].strip()
    if not (loc or safe or fixed or notes):
        continue
    entry = {'by': reviewer, 'date': date, 'notes': notes}
    if fixed:
        entry.update(reviewed=True, find=fixed)
    elif loc == 'yes' and safe == 'yes':
        entry.update(reviewed=True)
    else:
        entry.update(reviewed=False, dispute=notes or 'A licensed acupuncturist questioned this location.')
    review[row['code']] = entry
    n += 1
json.dump(review, open(out_path, 'w'), indent=1, ensure_ascii=False)
print(f'{n} reviewed rows imported into {out_path}')
