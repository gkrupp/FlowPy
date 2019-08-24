
'use strict';


class DiagramElementBase {
	
	constructor() {
		// constructor
	}
	
	
	static init(data = {}, make = undefined, config = {}) {
		// template builder
		this.$ = make;
		// configuration data
		this._data = data;
		// other framework configs
		this.config = config;
	}
	
	static assignStatic(context, generator) {
		generator.apply(context);
	}
	static assignStaticDeferred(context, generator) {
		DiagramElementBase._deferredStaticAssigns.push({
			context, generator
		});
	}
	static flushDeferredStaticAssigns() {
		let assign = null;
		while (assign = DiagramElementBase._deferredStaticAssigns.shift()) {
			DiagramElementBase.assignStatic(assign.context, assign.generator);
		}
	}
	
	
}




// static PROPERTIES

DiagramElementBase.assignStatic(DiagramElementBase, function() {
	this._deferredStaticAssigns = [];
});

