#!/usr/bin/env python

from verman import Version
mv_version = Version("multivis", 0, 1, 1, releaselevel="dev",
                     init_file=__file__)
__version__ = mv_version.mmm

def _get_prj_dir():
    import os
    return os.path.dirname(os.path.abspath(__file__))

PROJECT_DIR = _get_prj_dir()
