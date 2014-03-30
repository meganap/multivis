#!/usr/bin/env python
from __future__ import division

__author__ = "Daniel McDonald"
__copyright__ = "Biocore 2014"
__credits__ = ["Daniel McDonald"]
__license__ = "BSD"
__maintainer__ = "Daniel McDonald"
__email__ = "mcdonadt@colorado.edu"

from pyqi.core.command import (Command, CommandIn, CommandOut,
    ParameterCollection)
from biom.table import Table

class MakeMultivis(Command):
    BriefDescription = "Package the multivis bits"
    LongDescription = "Stage multivis for use on a given BIOM table"
    CommandIns = ParameterCollection([
        CommandIn(Name='table', DataType=Table,
                  Description='The table to operate on', Required=True),
        CommandIn(Name='metadata', DataType=dict,
                  Description='Sample metadata', Required=True),
        CommandIn(Name='output_directory', DataType=str,
                  Description='The output directory', Required=True)
    ])

    CommandOuts = ParameterCollection([])
    #    CommandOut(Name="result_1", DataType=str, Description="xyz"),
    #    CommandOut(Name="result_2", DataType=str, Description="123"),
    #])

    def run(self, **kwargs):
        kwargs['table'].addSampleMetadata(kwargs['metadata'])
        # deploy assets in output dir...
        # model after emperor
        # cannot require internet access

CommandConstructor = MakeMultivis
