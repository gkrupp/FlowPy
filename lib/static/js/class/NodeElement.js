
'use strict';


class NodeElement extends DiagramElementBase {
	
	constructor($$ = '') {
		super();
		
		if ($$ == '')
			return this;
		
		Object.defineProperties(this, {
			
			// element
			$$: {
				configurable: false,
				enumerable: true,
				value: $$,
				writable: false
			},
			name: {
				configurable: false,
				enumerable: true,
				value: NodeElement.getNameFromPackage($$),
				writeable: false
			},
			nodeDescriptor: {
				configurable: false,
				enumerable: false,
				value: NodeElement.getNodeDescriptor($$),
				writable: false
			},
			categoryDescriptor: {
				configurable: false,
				enumerable: false,
				value: NodeElement.getCategoryDescriptor($$),
				writable: false
			},
			argDescriptor: {
				configurable: false,
				enumerable: true,
				value: NodeElement.getArgDescriptor($$),
				writable: false
			},
			argDescriptorRequired: {
				configurable: false,
				enumerable: false,
				get: function() {
					const required = [];
					for (let arg of this.argDescriptor) {
						if (arg.required) required.push(arg);
					}
					return required;
				}
			},
			
			// types
			package: {
				configurable: false,
				enumerable: true,
				get: function() {
					if (this.nodeDescriptor !== undefined) {
						return this.nodeDescriptor.package;
					} else {
						return null;				
					}
				}
			},
			itype: {
				configurable: false,
				enumerable: true,
				get: function() {
					if (this.nodeDescriptor !== undefined) {
						return (this.nodeDescriptor.itype instanceof Array
										? this.nodeDescriptor.itype
										: [this.nodeDescriptor.itype]);
					} else {
						return null;				
					}
				}
			},
			otype: {
				configurable: false,
				enumerable: true,
				get: function() {
					return this.nodeDescriptor.otype || null;
				}
			},
			instance: {
				configurable: false,
				enumerable: true,
				get: function() {
					return (this.nodeDescriptor.instance!==undefined
									? this.nodeDescriptor.instance
									: true);
				}
			},
			apply: {
				configurable: false,
				enumerable: true,
				get: function() {
					return (this.nodeDescriptor.apply!==undefined
									? this.nodeDescriptor.apply
									: false);
				}
			},
			copy: {
				configurable: false,
				enumerable: true,
				get: function() {
					return (this.nodeDescriptor.copy!==undefined
									? this.nodeDescriptor.copy
									: true);
				}
			},
			conns: {
				configurable: false,
				enumerable: true,
				get: function() {
					return (this.nodeDescriptor.conns===-1 ? Infinity : parseInt(this.nodeDescriptor.conns)) || 1;
				}
			},
			
			// visualization
			position: {
				configurable: false,
				enumerable: true,
				value: { x:0, y:0 },
				writable: true
			},
			state: {
				configurable: false,
				enumerable: false,
				value: 'idle',
				writable: true
			},
			view: {
				configurable: false,
				enumerable: true,
				value: 'minimal',
				writable: true
			}
		});
		
	}
	
	
	static getNodeDescriptor($$ = '') {
		return /^[a-zA-Z0-9\.\-_ ]+$/.test($$)
			? eval('NodeElement._data.' + $$)
			: undefined;
	}
	static getCategoryDescriptor($$ = '') {
		const nodeDescriptor = NodeElement.getNodeDescriptor($$);
		if (nodeDescriptor instanceof Object && typeof nodeDescriptor.category === 'string') {
			return {
				...NodeElement.style.category._base,
				...eval('NodeElement._data.' + nodeDescriptor.category)
			};
		} else {
			return NodeElement.style.category._base
		}
	}
	static getArgDescriptor($$ = '') {
		const layerDescriptor = NodeElement.getNodeDescriptor($$);
		if (!(layerDescriptor.args instanceof Array)) return [];
		const argDescriptor = [];
		for (const arg of layerDescriptor.args) {
			const itype = (arg.itype.indexOf('.')!==-1 ? arg.itype : 'types.arg.'+arg.itype);
			const typeDescriptor = NodeElement.getTypeDescriptor(itype) || {};
			argDescriptor.push({
				arg: arg.arg,
				name: arg.name || this.getNameFromArg(arg.arg),
				itype: (arg.itype instanceof Array
								? arg.itype
								: [arg.itype]),
				default: (arg.default!==undefined
								? arg.default
								: null),
				value: (arg.default!==undefined
								? arg.default
								: (typeDescriptor.default!==undefined ? typeDescriptor.default : null)),
				conns: (arg.conns===-1
								? Infinity
								: parseInt(arg.conns)) || 0,
				required: arg.required || false
			});
		}
		return argDescriptor;
	}
	static getTypeDescriptor($$ = '') {
		return /^[a-zA-Z0-9\.\-_ ]+$/.test($$)
			? eval('NodeElement._data.' + $$)
			: undefined;
	}
	static getNameFromPackage($$) {
		return $$.substring($$.lastIndexOf('.')+1);
	}
	static getNameFromArg(arg = '') {
		if (arg.length) {
			return String.prototype.toUpperCase.apply(arg[0]) + arg.substring(1).replace(/_/g, ' ');
		} else {
			return '';
		}
	}
	static getNodeAttributePipe(attr = '') {
		return function(descriptor = {}) {
			if (attr in descriptor) return descriptor[attr];
			else return undefined;
		}
	}
	
	static changeNodeView(event, node) {
		node = node.part;
		if (node) {
			const diagram = node.diagram;
			let view = diagram.model.getCategoryForNodeData(node.data);
			switch (view) {
				case '': view = 'detailed'; break;
				case 'minimal': view = 'detailed'; break;
				case 'detailed': view = 'name'; break;
				case 'name': view = 'minimal'; break;
			}
			diagram.model.commit(function(model) {
				model.setCategoryForNodeData(node.data, view);
			}, 'changeNodeView');
		}
	}
	
	static positionToPoint(position) {
		return new go.Point(position.x, position.y);
	}
	static pointToPosition(point) {
		return { x:point.x, y:point.y };
	}
	static getStrokeColorFromState(state) {
		return NodeElement.style.highlight[state].stroke;
	}
	static getStrokeWidthFromState(state) {
		return NodeElement.style.highlight[state].strokeWidth;
	}
	
	
}




// static STYLES

DiagramElementBase.assignStatic(NodeElement, function(){
	this.style = {};
	// categories
	this.style.category = {};
	this.style.category._base = {
		fill: '#dddddd'
	};
	// texts
	this.style.text = {};
	this.style.text.layerTitle = {
		margin: new go.Margin(8, 6),
		textAlign: 'center',
		font: 'bold 12px sans-serif',
		cursor: 'pointer'
	};
	// highlights
	this.style.highlight = {};
	this.style.highlight._base = {
		strokeWidth: 3
	};
	this.style.highlight.idle = {
		...NodeElement.style.highlight._base,
		stroke: '#0d47a1'
	};
	this.style.highlight.progress = {
		...NodeElement.style.highlight._base,
		stroke: '#ff9800'
	};
	this.style.highlight.finished = {
		...NodeElement.style.highlight._base,
		stroke: '#4caf50'
	};
	// ports
	this.style.port = {};
	this.style.port._base = {
		width: 12,
		stroke: null,
		fill: 'rgba(0,0,0,0.08)',
		stretch: go.GraphObject.Vertical,
		cursor: 'pointer',
		fromLinkableDuplicates: false,
		toLinkableDuplicates: false,
		fromLinkableSelfNode: false,
		toLinkableSelfNode: false,
		fromMaxLinks: Infinity,
		toMaxLinks: 1
	};
	this.style.port.in = {
		...NodeElement.style.port._base,
		fill: 'rgba(0,150,136,0.2)',
		toLinkable: true,
		toSpot: go.Spot.Left
	};
	this.style.port.out = {
		...NodeElement.style.port._base,
		fill: 'rgba(233,30,99,0.2)',
		fromLinkable: true,
		fromSpot: go.Spot.Right
	};
	this.style.port.bi = {
		...NodeElement.style.port.in,
		...NodeElement.style.port.out,
		fill: 'rgba(0,0,255,0.1)'
	};
	// descriptors
	this.style.descriptor = {};
	this.style.descriptor.record = {
		margin: new go.Margin(4, 0),
		//minSize: new go.Size(140, 0),
		defaultAlignment: go.Spot.Left,
		//defaultStretch: go.GraphObject.Horizontal,
		defaultSeparatorPadding: 2
	};
});


// static MAPS

DiagramElementBase.assignStaticDeferred(NodeElement, function() {
	this.maps = {};
});


// static MAPS argTypeMap

DiagramElementBase.assignStaticDeferred(NodeElement, function() {
	this.maps.argTypeMap = new go.Map();
	const fieldTypeMap = {
		nosupport: [
			'',
			'nosupport'],
		bool: [
			'bool'],
		string: [
			'string',
			'int', 'int0+', 'int+', 'int-', 'int0-',
			'float', 'float0+', 'float+', 'float-', 'float0-',
			'float01', 'float11', 'shape']
	};
	for (let field in fieldTypeMap) {
		for (let type of fieldTypeMap[field]) {
			this.maps.argTypeMap.add(type, ArgumentElement.templates.fields[field]);
		}
	}
});


// static MAPS argRecordMap

DiagramElementBase.assignStaticDeferred(NodeElement, function() {
	this.maps.argRecordMap = new go.Map();
	const recordViews = {
		value: NodeElement.$(go.Panel, 'TableRow',
			NodeElement.$(go.TextBlock, {
				column: 1,
				stretch: go.GraphObject.Horizontal,
				},
				new go.Binding('text', 'name')),
			NodeElement.$(go.Panel, go.Panel.Vertical, {
				column: 2,
				columnSpan: 2,
				itemCategoryProperty: (data)=>{ return data.itype[0]; },
				itemTemplateMap: NodeElement.maps.argTypeMap
				},
				new go.Binding('itemArray', '', (d)=>[d]))
			),
		bind: NodeElement.$(go.Panel, 'TableRow',
			NodeElement.$(go.Shape, 'Rectangle', {
				...NodeElement.style.port.in,
				stretch: go.GraphObject.Vertical,
				column: 0
				},
				new go.Binding('portId', 'arg'),
				new go.Binding('toMaxLinks', 'conns')),
			NodeElement.$(go.TextBlock, {
				column: 1,
				stretch: go.GraphObject.Horizontal,
				},
				new go.Binding('text', 'name'))
			),
	};
	this.maps.argRecordMap.add('', recordViews.value);
	this.maps.argRecordMap.add('value', recordViews.value);
	this.maps.argRecordMap.add('bind', recordViews.bind);
});


// static TEMPLATES

DiagramElementBase.assignStaticDeferred(NodeElement, function() {
	this.templates = {};
	// parts
	this.templates.parts = {};
	this.templates.parts.location =
		function(field = 'position') {
			return new go.Binding('location', field, NodeElement.positionToPoint).makeTwoWay(NodeElement.pointToPosition);
		};
	this.templates.parts.layer =
		function() {
			return {
				selectionChanged: function(part) {
					part.layerName = (part.isSelected ? 'Foreground' : '');
				}
			};
		};
	this.templates.parts.mainShape =
		function(category = 'categoryDescriptor', state = 'state') {
			return NodeElement.$(go.Shape, {
				stretch: go.GraphObject.Fill,
				columnSpan: 3,
				},
				new go.Binding('fill', category, NodeElement.getNodeAttributePipe('fill')),
				new go.Binding('stroke', state, NodeElement.getStrokeColorFromState),
				new go.Binding('strokeWidth', state, NodeElement.getStrokeWidthFromState));
		};
	this.templates.parts.header =
		function() {
			return NodeElement.$(go.Panel, 'TableRow', {
				row: 0,
				doubleClick: NodeElement.changeNodeView,
				},
				NodeElement.$(go.Shape, 'Rectangle', {
					...NodeElement.style.port.in,
					column: 0,
					portId: '::input',
					alignment: go.Spot.Left
					},
					new go.Binding('toMaxLinks', 'conns')),
				NodeElement.$(go.TextBlock, {
					...NodeElement.style.text.layerTitle,
					alignment: go.Spot.Center,
					column: 1,
					},
					new go.Binding('text', 'name')),
				NodeElement.$(go.Shape, 'Rectangle', {
					...NodeElement.style.port.out,
					column: 2,
					portId: '::output',
					alignment: go.Spot.Right })
			);
		};
	this.templates.parts.argDescriptor =
		function(descriptor = 'argDescriptor') {
			return NodeElement.$(go.Panel, 'Table', {
				row: 1,
				columnSpan: 2,
				alignment: go.Spot.Left,
				stretch: go.GraphObject.Vertical,
				...NodeElement.style.descriptor.record,
				itemCategoryProperty: (d)=>(d.conns===0?'value':'bind'),
				itemTemplateMap: NodeElement.maps.argRecordMap
				},
				new go.Binding('itemArray', descriptor));
		};
	// views
	this.templates.views = {};
	this.templates.views.name =
		NodeElement.$(go.Node, go.Panel.Auto,
			this.templates.parts.location(),
			this.templates.parts.layer(),
			this.templates.parts.mainShape(),
			NodeElement.$(go.Panel, go.Panel.Table,
				this.templates.parts.header()
			));
	this.templates.views.minimal =
		NodeElement.$(go.Node, go.Panel.Auto,
			this.templates.parts.location(),
			this.templates.parts.layer(),
			this.templates.parts.mainShape(),
			NodeElement.$(go.Panel, go.Panel.Table,
				this.templates.parts.header(),
				this.templates.parts.argDescriptor('argDescriptorRequired')
			));
	this.templates.views.detailed =
		NodeElement.$(go.Node, go.Panel.Auto,
			this.templates.parts.location(),
			this.templates.parts.layer(),
			this.templates.parts.mainShape(),
			NodeElement.$(go.Panel, go.Panel.Table,
				this.templates.parts.header(),
				this.templates.parts.argDescriptor('argDescriptor')
			));
});


// static MAPS nodeTemplateMap

DiagramElementBase.assignStaticDeferred(NodeElement, function() {
	this.maps.nodeTemplateMap = new go.Map();
	this.maps.nodeTemplateMap.add('', NodeElement.templates.views.name);
	this.maps.nodeTemplateMap.add('name', NodeElement.templates.views.name);
	this.maps.nodeTemplateMap.add('minimal', NodeElement.templates.views.minimal);
	this.maps.nodeTemplateMap.add('detailed', NodeElement.templates.views.detailed);
});

