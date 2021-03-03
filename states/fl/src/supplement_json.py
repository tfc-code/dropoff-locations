import json
import os

PBC_DADE_OUT = os.path.join(
    '..', 'raw_data', 'pbc_dade_boxes.json'
)
PIN_OUT = os.path.join(
    '..', 'raw_data', 'pinellas_boxes.json'
)
OFFICES_OUT = os.path.join(
    '..', 'raw_data', 'fl_offices_plus.json'
)
FL_FINAL = os.path.join(
    '..', '..', '..', 'api', 'data', 'all-florida.json'
)

def get_site_sig(site):
    return (site["address"])


def combine_site_files(in_files, out_file):
    sites = []
    site_sigs = set()
    for fn in in_files:
        with open(fn) as f:
            new_sites = json.load(f)
        for s in new_sites:
            sig = get_site_sig(s)
            if sig not in site_sigs:
                sites.append(s)
                site_sigs.add(sig)
    with open(out_file, 'w') as f:
        json.dump(sites, f, indent=2)
        

combine_site_files(
    [OFFICES_OUT, FL_FINAL, PBC_DADE_OUT, PIN_OUT],
    FL_FINAL
)