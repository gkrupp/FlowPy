import math




class GraphElementBase:
	
	def __init__(self):
		self.attrs = {}
	
	def setAttr(self, key, val):
		self.attrs[key] = val
	
	def getAttr(self, key, fb = None):
		return self.attrs[key] if key in self.attrs else fb
	
	def delAttr(self, key):
		if key in self.attrs:
			del self.attr[key]




class Arg(GraphElementBase):
	
	def typarr(types = []):
		if isinstance(types, list):
			return list(map(str,types))
		else:
			return [ str(types) ]
	
	def identity(el):
		return el
	
	def strshape(strval):
		arr = strval.strip('()').split(',')
		return tuple(map(int,filter(lambda p : p!='', arr)))
	
	def arglist(arglist = []):
		if isinstance(arglist, list):
			return list(map(Arg,arglist))
		else:
			return [ Arg(arglist) ]
	
	def intinf(val):
		if val != math.inf:
			return int(val)
		else:
			return val
	
	def conversion(val, typarr):
		for typ in typarr:
			try:
				if 'int' in typ:
					return int(val)
				elif 'float' in typ:
					return float(val)
				elif 'bool' in typ:
					return bool(val)
				elif 'string' in typ:
					return str(val) if val is not None else None
				elif 'shape' in typ:
					return Arg.strshape(val)
			except:
				pass
		return val
	
	property_names = {
		'arg': ('arg', str),
		'name': ('name', str),
		'itype': ('itype', typarr),
		'value': ('value', identity),
		'conns': ('conns', intinf),
		'required': ('required', bool)
	}
	
	def __init__(self, arg_data = {}):
		super().__init__()
		for p, (p_name, p_class) in Arg.property_names.items():
			setattr(self, p, p_class(arg_data[p_name]))
		self.value = Arg.conversion(self.value, self.itype)




class Node(GraphElementBase):
	
	def package(pckg = ''):
		dot  = pckg.rfind('.')
		if dot == -1:
			return ('', pckg)
		else:
			return (pckg[:dot], pckg[dot+1:])
	
	property_names = {
		'id': ('key', str),
		'$$': ('$$', str),
		'name': ('name', str),
		'package': ('package', package),
		'args': ('argDescriptor', Arg.arglist),
		'itype': ('itype', Arg.typarr),
		'otype': ('otype', str),
		'instance': ('instance', bool),
		'apply': ('apply', bool),
		'copy': ('copy', bool),
		'conns': ('conns', Arg.intinf)
	}
	
	def __init__(self, node_data = {}):
		super().__init__()
		for p, (p_name, p_class) in Node.property_names.items():
			setattr(self, p, p_class(node_data[p_name]))
		self.links_to = []
		self.links_from = []




class Link(GraphElementBase):
	
	_id_auto_increase = 0
	
	property_names = {
		'from_node': ('from', str),
		'from_port': ('fromPort', str),
		'to_node': ('to', str),
		'to_port': ('toPort', str)
	}
	
	def __init__(self, link_data):
		super().__init__()
		for p, (p_name, p_class) in Link.property_names.items():
			setattr(self, p, p_class(link_data[p_name]))
		self.id = Link._id_auto_increase
		Link._id_auto_increase += 1




class Graph(GraphElementBase):
	
	property_names = {
		'nodes': 'nodeDataArray',
		'links': 'linkDataArray'
	}
	
	def __init__(self, graph = {}):
		super().__init__()
		# elements
		self.nodes = {}
		self.links = {}
		# change properties
		Link.property_names['from_port'] = (graph['linkFromPortIdProperty'], str)
		Link.property_names['to_port'] = (graph['linkToPortIdProperty'], str)
		# process nodes
		for node_data in graph[Graph.property_names['nodes']]:
			node = Node(node_data)
			self.nodes[node.id] = node
		# process links
		for link_data in graph[Graph.property_names['links']]:
			link = Link(link_data)
			self.links[link.id] = link
			self.nodes[link.from_node].links_to.append(link)
			self.nodes[link.to_node].links_from.append(link)

