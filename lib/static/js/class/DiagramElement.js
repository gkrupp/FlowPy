
'use strict';


class DiagramElement extends DiagramElementBase {
	
	constructor(elementId = null, NodeElement = null, LinkElement) {
		super();
		
		// gojs diagram configuration
		this.config = {
			//InitialLayoutCompleted: console.log,
			allowMove: true, // move nodes
			allowCopy: false, // Ctrl+C, Ctrl+V
			allowDelete: true, // Delete
			//allowDrop: true,
			allowHorizontalScroll: true,
			allowZoom: true,
			"grid.visible": false, // disable grid
			//"grid.gridCellSize": new go.Size(20,20),
			"toolManager.hoverDelay": 100,
			"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, // mouse wheel scroll
			"commandHandler.copiesTree": false,  // for the copy command
			"commandHandler.deletesTree": false, // for the delete command
			"commandHandler.deletesConnectedLinks": true, // for removing connected links
			"draggingTool.dragsTree": false,  // dragging for both move and copy
			"draggingTool.isGridSnapEnabled": false,
			//layout: $(go.TreeLayout, {
			//	angle: 0,
			//	sorting: go.TreeLayout.SortingAscending
			//}),
			"validCycle": go.Diagram.CycleNotDirected, // cycle not allwed
			"undoManager.isEnabled": true // Ctrl+Z
		};
		
		// create diagram
		const diagram = DiagramElementBase.$(go.Diagram, elementId, this.config);
		diagram.model = new go.GraphLinksModel();
		
		// set link validation
		diagram.toolManager.linkingTool.linkValidation = LinkElement.validate;
		diagram.toolManager.relinkingTool.linkValidation = LinkElement.validate;
		
		// set go properties
		diagram.model.nodeCategoryProperty = DiagramElementBase.config.GO_NODE_CP;
		diagram.model.linkFromPortIdProperty = DiagramElementBase.config.GO_LINK_FROM_CP;
		diagram.model.linkToPortIdProperty = DiagramElementBase.config.GO_LINK_TO_CP;
		diagram.nodeTemplateMap = NodeElement.maps.nodeTemplateMap;
		diagram.linkTemplate = LinkElement.templates.links.bezier;
		diagram.PIXELRATIO = diagram.computePixelRatio();
		
		// drag handlers
		diagram.div.addEventListener('dragenter', function(event) {
			event.preventDefault();
		});
		diagram.div.addEventListener('dragover', function(event) {
			event.preventDefault();
		});
		diagram.div.addEventListener('dragleave', function(event) {
			event.preventDefault();
		});
		diagram.div.addEventListener('drop', function(event) {
			event.preventDefault();
			if (diagram.isReadOnly) return;
			// drop only allowed to diagram
			const canvas = event.target;
			if (this === diagram.div && canvas instanceof HTMLCanvasElement) {
				const pxratio = diagram.PIXELRATIO;
				const epsilon = 0.000001;
				// calculate drop position
				const bbox = canvas.getBoundingClientRect();
				const bbw = bbox.width || epsilon;
				const bbh = bbox.height || epsilon;
				const mx = event.clientX - bbox.left * ((canvas.width / pxratio) / bbw);
				const my = event.clientY - bbox.top * ((canvas.height / pxratio) / bbh);
				const point = diagram.transformViewToDoc(new go.Point(mx, my));
				// append model
				diagram.model.commit(function(model) {
					try {
						const newNode = new NodeElement(event.dataTransfer.getData('text'));
						newNode.position.x = point.x;
						newNode.position.y = point.y;
						model.addNodeData(newNode);
					} catch(err) {
						console.error(err);
					}
				}, 'newnode');
			}
		});
		
		diagram.loadModel = this.loadModel;
		diagram.highlightNode = this.highlightNode;
		
		return diagram;
	}
	
	
	loadModel(data = {}) {
		// parse and process loaded data
		data.nodeDataArray = data.nodeDataArray.map(function(node) {
			const nodeObj = new NodeElement(node.$$);
			nodeObj.position = node.position;
			nodeObj.view = node.view;
			for (let arg in node.argDescriptor) {
				nodeObj.argDescriptor[arg].value = node.argDescriptor[arg].value;
			}
			return nodeObj;
		});
		// load to gojs
		this.model = go.Model.fromJson(data);
	}
	
	highlightNode(key = null, state = 'idle') {
		this.model.commit(function(model) {
			if (key !== null) {	
				const node = model.findNodeDataForKey(key);
				model.set(node, 'state', state);
			} else {
				model.nodeDataArray.forEach(function(node) {
					model.set(node, 'state', state);
				});
			}
		}, 'statechange');
	}
	
	
}

