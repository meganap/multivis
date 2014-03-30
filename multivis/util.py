#!/usr/bin/env python

import os
from shutil import copytree
from multivis import PROJECT_DIR


def copy_support_files(file_path):
    """Copy support files to the output path"""
    support_files = os.path.join(PROJECT_DIR, 'support_files')
    copytree(support_files, file_path)


def get_data_path(file_path):
    """Return the data path relative to file_path"""
    return os.path.join(file_path, 'data/multivis.biom')
