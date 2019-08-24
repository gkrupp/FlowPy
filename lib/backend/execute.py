import argparse
import os
import sys
import json
import traceback

from GraphElement import Graph
from Engines import execute, Topological, NNGraph




# arguments

aparser = argparse.ArgumentParser()
aparser.add_argument('-e', '--escape',
										 default='::::::::',
										 type=str,
										 required=False,
										 help='meta data escape sequence',
										 metavar='escape')
aparser.add_argument('-w', '--workdir',
										 default='.',
										 type=str,
										 required=False,
										 help='working directory',
										 metavar='module')
aparser.add_argument('-m', '--module',
										 default='lib/data',
										 type=str,
										 required=False,
										 help='fallback module directory',
										 metavar='module')

CmdArgs = aparser.parse_args()
os.chdir(CmdArgs.workdir)
sys.path.append(CmdArgs.module)



# Handlers

def progress(node, progress, time):
	print(CmdArgs.escape, 'progress', node.id, progress, time, file=sys.stderr)
	sys.stderr.flush()

def callback(engine, progress, time):
	print(CmdArgs.escape, 'callback', progress, time, file=sys.stderr)
	sys.stderr.flush()




# Graph

graphObject = json.loads(''.join(sys.stdin.readlines()))

G = Graph(graphObject)
T = NNGraph(G)

try:
	execute(T,  'module', progress, callback)
except Exception as e:
	traceback.print_exc(file=sys.stderr)
	print(e, file=sys.stderr)

