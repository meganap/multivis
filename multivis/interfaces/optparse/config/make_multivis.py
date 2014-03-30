#!/usr/bin/env python
from __future__ import division

__author__ = "Daniel McDonald"
__copyright__ = "Biocore 2013"
__credits__ = ["Daniel McDonald"]
__license__ = "BSD"
__maintainer__ = "Daniel McDonald"
__email__ = "mcdonadt@colorado.edu"

from pyqi.core.interfaces.optparse import (OptparseUsageExample,
                                           OptparseOption)
from pyqi.core.command import (make_command_in_collection_lookup_f,
                               make_command_out_collection_lookup_f)
from multivis.commands.make_multivis import CommandConstructor
from multivis.interfaces.optparse.input_handler import parse_metadata
from biom.interfaces.optparse.input_handler import load_biom_table

# Convenience function for looking up parameters by name.
cmd_in_lookup = make_command_in_collection_lookup_f(CommandConstructor)
cmd_out_lookup = make_command_out_collection_lookup_f(CommandConstructor)

# Examples of how the command can be used from the command line using an
# optparse interface.
usage_examples = [
    OptparseUsageExample(ShortDesc="Construct a taxonomy summary",
                         LongDesc="Construct a MULTI-VIS environment to view "
                                  "and explore the taxonomy present in the "
                                  "provided BIOM table.",
                         Ex="%prog -m metadata.txt -i table.biom -o output")
]

# inputs map command line arguments and values onto Parameters. It is possible
# to define options here that do not exist as parameters, e.g., an output file.
inputs = [
    OptparseOption(Parameter=cmd_in_lookup('metadata'),
                   Type=str,
                   Action='store',
                   Handler=parse_metadata,
                   ShortName='m',
                   ),
    OptparseOption(Parameter=cmd_in_lookup('output_directory'),
                   Type=str,
                   Action='store',
                   Handler=None,
                   ShortName='o',
                   ),
    OptparseOption(Parameter=cmd_in_lookup('table'),
                   Type=str,
                   Action='store',
                   Handler=load_biom_table,
                   ShortName='i',
                   ),
]

# output is handled by the MakeMultivis itself as it implicitly needs to
# manipulate the filesystem
outputs = []
