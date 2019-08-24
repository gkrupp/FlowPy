
'use strict';


class LinkElement extends DiagramElementBase {
	
	constructor() {
		super();
	}
	
	
	static validate(fromNode, fromPort, toNode, toPort) {
		const fromId = fromPort.portId,
					toId = toPort.portId;
		const fromData = fromNode.data,
					toData = toNode.data;
		const fromType = fromId==='::output'
			? fromData.otype
			: fromData.argDescriptor.find((arg)=>{return arg.arg===toId}).itype;
		const toType = toId==='::input'
			? toData.itype
			: toData.argDescriptor.find((arg)=>{return arg.arg===toId}).itype;
		if (fromType === null || toType === null) return true;
		else return toType.indexOf(fromType) !== -1;
	}
	
	
}




// static STYLES

DiagramElementBase.assignStatic(LinkElement, function() {
	this.style = {};
	// lines
	this.style.link = {};
	this.style.link.bezier = {
		curve: go.Link.Bezier
	};
	this.style.link.line = {
		stroke: '#2F4F4F',
		strokeWidth: 2
	};
	this.style.link.arrow = {
		toArrow: 'Circle',
		stroke: null
	};
});


// static TEMPLATES

DiagramElementBase.assignStaticDeferred(LinkElement, function() {
	this.templates = {};
	// links
	this.templates.links = {};
	this.templates.links.bezier = LinkElement.$(go.Link, {
		reshapable: false,
		resegmentable: false,
		relinkableFrom: true,
		relinkableTo: true,
		...this.style.link.bezier
		},
		DiagramElementBase.$(go.Shape, {
			...this.style.link.line
			}),
		DiagramElementBase.$(go.Shape, {
				...this.style.link.arrow
			})
		);
});

