#!/usr/bin/env python

import os

def parse_metadata(fpath):
    """Attempt to parse the metadata in fpath

    The return is of {sample_id: {sample metadata}}
    """
    if not os.path.exists(fpath):
        raise ValueError("%s doesn't exist!" % fpath)

    lines = [l.strip().split('\t') for l in open(fpath)]
    header = lines[0]

    return {row[0]: {k: v for k, v in zip(header, row)} for row in lines[1:]}
