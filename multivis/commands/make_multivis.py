#!/usr/bin/env python
from __future__ import division

__author__ = "Daniel McDonald"
__copyright__ = "Biocore 2014"
__credits__ = ["Daniel McDonald"]
__license__ = "BSD"
__maintainer__ = "Daniel McDonald"
__email__ = "mcdonadt@colorado.edu"

from pyqi.core.command import Command, CommandIn, ParameterCollection
from biom.table import Table
from multivis.util import copy_support_files, get_data_path


class MakeMultivis(Command):
    BriefDescription = "Package the multivis bits"
    LongDescription = "Stage multivis for use on a given BIOM table"
    CommandIns = ParameterCollection([
        CommandIn(Name='table', DataType=Table,
                  Description='The table to operate on', Required=True),
        CommandIn(Name='metadata', DataType=dict,
                  Description='Sample metadata', Required=True),
        # the output directory is necessary for the command as the command
        # requires staging multiple files in the directory, and doing this
        # with output handlers would get ugly (I think)
        CommandIn(Name='output_directory', DataType=str,
                  Description='The output directory', Required=True)
    ])

    CommandOuts = ParameterCollection([])

    def run(self, **kwargs):
        kwargs['table'].addSampleMetadata(kwargs['metadata'])
        copy_support_files(kwargs['output_directory'])
        fpath = get_data_path(kwargs['output_directory'])

        with open(fpath, 'w') as tout:
            tout.write(kwargs['table'].getBiomFormatJsonString('multivis'))

        return {}

CommandConstructor = MakeMultivis
