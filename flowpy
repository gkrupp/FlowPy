#!python
import argparse
import atexit
import json
import logging
import os
import traceback

from flask import Flask, request, send_file
from waitress import serve

from flask_socketio import SocketIO
from lib.backend.Socket import ClientHandler






if __name__ == '__main__':
	cwd = os.getcwd()
	flowpydir = os.path.dirname(__file__)
	
	# arguments
	aparser = argparse.ArgumentParser()
	aparser.add_argument('-b', '--bind',
											 default='0.0.0.0',
											 type=str,
											 required=False,
											 help='bind to a specific interface',
											 metavar='host')
	aparser.add_argument('-p', '--port',
											 default=80,
											 type=int,
											 required=False,
											 help='server port to listen on',
											 metavar='port')
	aparser.add_argument('-w', '--workdir',
											 default=cwd,
											 type=str,
											 required=False,
											 help='working directory',
											 metavar='workdir')
	aparser.add_argument('-c', '--config',
											 default='',
											 type=str,
											 required=False,
											 help='configuration file path',
											 metavar='config')
	aparser.add_argument('-m', '--module',
											 default='',
											 type=str,
											 required=False,
											 help='fallback module directory',
											 metavar='module')
	aparser.add_argument('-d', '--debug',
											 action='store_true',
											 default=False,
											 required=False,
											 help='Start server in debug mode')
	
	CmdArgs = aparser.parse_args()
	
	if CmdArgs.module:
		CmdArgs.module = os.path.join(cwd, CmdArgs.module)
	else:
		CmdArgs.module = os.path.join(cwd, flowpydir, 'lib/data')
	
	if CmdArgs.config:
		CmdArgs.config = os.path.join(cwd, CmdArgs.config)
	else:
		CmdArgs.config = os.path.join(cwd, flowpydir, 'lib/data/data.json')
	
	
	
	
	
	
	
	# Flask
	app = Flask(__name__,
							static_url_path='',
							static_folder='lib/static')
	
	app.config['SECRET_KEY'] = '15KphxyyF0C8es99'
	
	if not CmdArgs.debug:
		app.logger.disabled = True
		log = logging.getLogger('werkzeug')
		log.disabled = True
	
	
	# routes

	@app.route('/', methods=['GET'])
	def path_():
		return send_file('lib/static/index.html')
	
	@app.route('/data.json', methods=['GET'])
	def path_dataJson():
		return send_file(CmdArgs.config)
	
	
	# SocketIO
	io = SocketIO(app)
	io.on_namespace(ClientHandler(workdir=CmdArgs.workdir, module=CmdArgs.module))
	
	
	# RUN
	
	if CmdArgs.debug:
		app.run(host=CmdArgs.bind,
						port=CmdArgs.port,
						debug=True)
	else:
		serve(app,
					host=CmdArgs.bind,
					port=CmdArgs.port,
					threads=8,
					connection_limit=128,
					cleanup_interval=8,
					channel_timeout=8,
					asyncore_use_poll=True)
#

