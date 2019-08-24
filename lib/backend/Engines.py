import os
import sys
import copy
import math
import time
import importlib

sys.path.insert(0, os.path.dirname(__file__))

from GraphElement import Graph




def apply(previous, *args, **kwargs):
	return previous(*args, **kwargs)
predefined_functions = {
	'@': apply
}




class EngineBase:
	
	@staticmethod
	def importClass(pckg_name, cls_name, clsFallback='module'):
		if cls_name in predefined_functions:
			return predefined_functions[cls_name]
		else:
			return getattr(importlib.import_module(pckg_name or clsFallback), cls_name)
	
	@staticmethod
	def flush():
		sys.stdout.flush()
		sys.stderr.flush()
	
	@staticmethod
	def copy(obj):
		try:
			return copy.deepcopy(obj)
		except:
			return copy.copy(obj)
	
	
	def __init__(self, G):
		self.G = G
		self.order = []
	
	
	def prepareArguments(self, node):
		
		# args init
		kwargs = { arg.arg: [] for arg in node.args }
		kwargs['::input'] = []
		
		# insert values
		for arg in node.args:
			if arg.value is not None:
				kwargs[arg.arg].append(arg.value)
		
		# insert return values
		for link_data in node.links_from:
			from_node = self.G.nodes[link_data.from_node]
			to_port = kwargs[link_data.to_port]
			if from_node.copy:
				to_port.append(EngineBase.copy(from_node.getAttr('return')))
			else:
				to_port.append(from_node.getAttr('return'))
		
		# clip array
		if node.conns < 2:
			kwargs['::input'] = kwargs['::input'][:node.conns]
		for arg in node.args:
			if arg.conns < 2:
				if len(kwargs[arg.arg]) > 0:
					kwargs[arg.arg] = kwargs[arg.arg][0]
				else:
					del kwargs[arg.arg]
		
		# sort types
		inputargs = kwargs['::input']
		del kwargs['::input']
		required = []
		for arg in node.args:
			if arg.required:
				required.append(kwargs[arg.arg])
				del kwargs[arg.arg]
		
		# return
		return (inputargs, required, kwargs)
	
	
	def evaluate(self, node, clsFallback='module'):
		
		# import callable
		cls = EngineBase.importClass(*node.package, clsFallback)
		
		# call and save
		ret = None
		(inputargs, required, kwargs) = self.prepareArguments(node)
		if node.instance and node.apply:
			#print('instance, apply')
			ret = cls(*required, **kwargs)(*inputargs)
		elif node.instance and not node.apply:
			#print('instance')
			ret = cls(*inputargs, *required, **kwargs)
		elif not node.instance and node.apply:
			#print('apply')
			ret = cls(*inputargs)
		elif not node.instance and not node.apply:
			#print('-')
			ret = cls
		
		node.setAttr('return', ret)
		
		EngineBase.flush()




class Topological(EngineBase):
	
	@staticmethod
	def getOrder(G):
		order = []
		for key, node in G.nodes.items():
			if node.getAttr('visited') is None:
				Topological.DFSorder(G, node, order)
		order.reverse()
		return order
	
	@staticmethod
	def DFSorder(G, root, order = []):
		root.setAttr('visited', False)
		for link in root.links_to:
			node = G.nodes[link.to_node]
			state = node.getAttr('visited')
			if state == False:
				raise Error('This Graph is not a DAG!')
			elif state is None:
				Topological.DFSorder(G, node, order)
		order.append(root.id)
		root.setAttr('visited', True)
	
	
	def __init__(self, G):
		super().__init__(G);
		self.order = Topological.getOrder(G)
	
	
	def run(self, clsFallback='module', progress=None):
		for key in self.order:
			if progress is not None:
				progress(self.G.nodes[key], 'progress', 0)
			time_start = time.clock()
			self.evaluate(self.G.nodes[key], clsFallback)
			time_end = time.clock()
			if progress is not None:
				progress(self.G.nodes[key], 'finished', time_end-time_start)




class NNGraph(EngineBase):
	
	@staticmethod
	def getOrder(G):
		order = []
		for key, node in G.nodes.items():
			if node.getAttr('visited') is None:
				Topological.DFSorder(G, node, order)
		order.reverse()
		return order
	
	@staticmethod
	def DFSorder(G, root, order = []):
		root.setAttr('visited', False)
		for link in root.links_to:
			node = G.nodes[link.to_node]
			state = node.getAttr('visited')
			if state == False:
				raise Error('This Graph is not a DAG!')
			elif state is None:
				Topological.DFSorder(G, node, order)
		order.append(root.id)
		root.setAttr('visited', True)
	
	
	def __init__(self, G):
		super().__init__(G);
		self.order = Topological.getOrder(G)
	
	
	def run(self, clsFallback='module', progress=None):
		for key in self.order:
			if progress is not None:
				progress(self.G.nodes[key], 'progress', 0)
			time_start = time.clock()
			self.evaluate(self.G.nodes[key], clsFallback)
			time_end = time.clock()
			if progress is not None:
				progress(self.G.nodes[key], 'finished', time_end-time_start)




def execute(engine, clsFallback='module', progress=None, callback=None):
	if callback is not None:
		callback(engine, 'progress', 0)
	time_start = time.clock()
	engine.run(clsFallback, progress)
	time_end = time.clock()
	if callback is not None:
		callback(engine, 'finished', time_end-time_start)

