import os
import re
import signal
import subprocess
import sys
import traceback

from flask import request
from threading import Thread
from flask_socketio import SocketIO, emit, Namespace






class ClientHandler(Namespace):
	
	def __init__(self, namespace=None, workdir='.', module='lib/data'):
		super(ClientHandler, self).__init__(namespace)
		self.WORKDIR = workdir
		self.MODULE = module
		self.STREAM_ESCAPE_SEQUENCE = '::::::::'
		self.PROCS = {}
	
	def __del__(self):
		for SID in self.PROCS:
			self._kill(SID)
			del self.PROCS[SID]
	
	
	
	
	# EVENTS
	
	def on_connect(self):
		SID = request.sid
		self.PROCS[SID] = 0
	
	def on_cmd_run(self, data):
		SID = request.sid
		if self.PROCS[SID]:
			self._notify(SID, 'state_change', 500, 'graph execution in progress',
									state='running')
			return
		try:
			# process
			executable = re.compile("[\\\/]+").split(sys.executable)[-1]
			filename = os.path.join(os.path.dirname(__file__), 'execute.py')
			shell = False
			flags = 0
			if hasattr(subprocess, 'CREATE_NEW_PROCESS_GROUP'):
				shell = True
				flags |= subprocess.CREATE_NEW_PROCESS_GROUP
			self._process_wrapper(
				SID,
				data['graph'],
				self._on_spawn,
				self._on_exit,
				self._stream_handler,
				self._stream_handler,
				[executable, filename,
				 '--escape', self.STREAM_ESCAPE_SEQUENCE,
				 '--workdir', self.WORKDIR,
				 '--module', self.MODULE],
				shell=shell,
				stdout=subprocess.PIPE,
				stdin=subprocess.PIPE,
				stderr=subprocess.PIPE,
				creationflags=flags
			)
		except Exception as e:
			print(e)
			traceback.print_exc(file=sys.stderr)
			self._notify(SID, 'state_change', 500, 'graph parsing error',
									 state='stopped')
	
	def on_cmd_stop(self, data):
		SID = request.sid
		try:
			self._kill(SID)
			self._notify(SID, 'state_change', 200, 'graph execution stopped',
									 state='stopped')
		except Exception as e:
			print(e)
			traceback.print_exc(file=sys.stderr)
			self._notify('state_change', 500, 'graph operation error',
									 state='running')
	
	def on_disconnect(self):
		SID = request.sid
		if SID in self.PROCS:
			self._kill(SID)
			del self.PROCS[SID]
	
	
	
	
	# PRIVATE
	
	def _notify(self, SID, event, status, message, state='finished', data={}):
		self.emit(event, {
			'status':
				status if type(status) == int else (200 if status else 500),
			'state': state,
			'message': message,
			'data': data
		}, room=SID)
	
	def _on_spawn(self, SID):
		self._notify(SID, 'state_change', 200, 'graph execution started',
								state='running')
	
	def _on_exit(self, SID):
		self._notify(SID, 'state_change', 200, 'graph execution finished',
								state='stopped')
	
	def _process_wrapper(self, SID, stdin_data, on_spawn, on_exit,
											 stdout_handler, stderr_handler, *popen_args, **popen_kwargs):
		
		def process_wrapper_thread(SID, PROCS, stdin_data, on_spawn, on_exit,
											 				 stdout_handler, stderr_handler, popen_args, popen_kwargs):
			# spawn
			proc = subprocess.Popen(*popen_args, **popen_kwargs)
			PROCS[SID] = proc.pid
			on_spawn(SID)
			# communicate
			proc.stdin.write(stdin_data.encode())
			proc.stdin.close()
			THout = Thread(target=stdout_handler, args=(SID, proc.stdout, 'stdout'))
			THerr = Thread(target=stderr_handler, args=(SID, proc.stderr, 'stderr'))
			THout.start()
			THerr.start()
			# terminate
			proc.wait()
			PROCS[SID] = 0
			on_exit(SID)
			return
		
		thread_proc = Thread(target=process_wrapper_thread,
												 args=(SID, self.PROCS, stdin_data, on_spawn, on_exit,
															 stdout_handler, stderr_handler,
															 popen_args, popen_kwargs))
		thread_proc.start()
		return thread_proc
	
	def _stream_handler(self, SID, stream, label):
		line = stream.readline()
		while line:
			try:
				if line.startswith(self.STREAM_ESCAPE_SEQUENCE.encode()):
					# data[0]: function
					# data[1]: event
					# data[2]: time
					data = re.compile('\s+').split(line.decode())[1:]
					# callback
					if data[0] == 'callback' and data[1] == 'finished':
						self._notify(SID, 'progress_change', 200, 'execution finished',
												state='finished',
												data={
													'node': None,
													'state': 'finished',
													'time': data[2]
												})
					# progress
					elif data[0] == 'progress':
						self._notify(SID, 'progress_change', 200, 'progress changed',
												state='progress',
												data={
													'node': data[1],
													'state': data[2],
													'time': data[3]
												})
				# plain stream
				# ^ if line.startswith(self.STREAM_ESCAPE_SEQUENCE.encode()):
				else:
					self._notify(SID, 'console_stream', 200, 'console stream',
											state='connected',
											data={
												'label': label,
												'line': line.decode()
											})
			except Exception as e:
				print(e)
				traceback.print_exc(file=sys.stderr)
			# read next chunk
			line = stream.readline()
	
	def _kill(self, SID):
		if SID in self.PROCS and self.PROCS[SID]:
			os.kill(self.PROCS[SID], signal.SIGTERM)
			os.kill(self.PROCS[SID], signal.CTRL_C_EVENT)
			os.kill(self.PROCS[SID], signal.CTRL_BREAK_EVENT)
			self.PROCS[SID] = 0

