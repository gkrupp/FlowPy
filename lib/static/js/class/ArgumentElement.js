
'use strict';


class ArgumentElement extends DiagramElementBase {
	
	constructor() {
		super();
	}
	
	
	// static VALIDATIONS
	
	static typeValidator(type) {
		return function(value) {
			return ArgumentElement.validate(type, value);
		}
	}
	static validate(type, value) {
		switch (type) {
			case 'bool':    return ArgumentElement.validateBool(value);
			case 'string':  return ArgumentElement.validateString(value);
			case 'int':     return ArgumentElement.validateInt(value);
			case 'int0+':   return ArgumentElement.validateInt0p(value);
			case 'int0p':   return ArgumentElement.validateInt0p(value);
			case 'int+':    return ArgumentElement.validateIntp(value);
			case 'intp':    return ArgumentElement.validateIntp(value);
			case 'int0-':   return ArgumentElement.validateInt0n(value);
			case 'int0n':   return ArgumentElement.validateInt0n(value);
			case 'int-':    return ArgumentElement.validateIntn(value);
			case 'intn':    return ArgumentElement.validateIntn(value);
			case 'float':   return ArgumentElement.validateFloat(value);
			case 'float0+': return ArgumentElement.validateFloat0p(value);
			case 'float0p': return ArgumentElement.validateFloat0p(value);
			case 'float+':  return ArgumentElement.validateFloatp(value);
			case 'floatp':  return ArgumentElement.validateFloatp(value);
			case 'float0-': return ArgumentElement.validateFloat0n(value);
			case 'float0n': return ArgumentElement.validateFloat0n(value);
			case 'float-':  return ArgumentElement.validateFloatn(value);
			case 'floatn':  return ArgumentElement.validateFloatn(value);
			case 'float01': return ArgumentElement.validateFloat01(value);
			case 'float11': return ArgumentElement.validateFloat11(value);
			case 'shape': return ArgumentElement.validateShape(value);
			default: return true;
		}
	}
	
	// bool
	static validateBool(value) {
		return (value === true || value === false);
	}
	// string
	static validateString(value) {
		return true;
	}
	// int
	static validateInt(value) {
		return /^(\+|\-)?[0-9]+$/.test(value);
	}
	static validateInt0p(value) {
		return /^(\+)?[0-9]+$/.test(value);
	}
	static validateIntp(value) {
		return /^(\+)?[1-9][0-9]*$/.test(value);
	}
	static validateInt0n(value) {
		return /^(\-)[0-9]+$/.test(value);
	}
	static validateIntn(value) {
		return /^\-[1-9][0-9]*$/.test(value);
	}
	// float
	static validateFloat(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value);
	}
	static validateFloat0p(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && 0<=f;
	}
	static validateFloatp(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && 0<f;
	}
	static validateFloat0n(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && f<=0;
	}
	static validateFloatn(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && f<0;
	}
	static validateFloat01(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && 0<=f && f<=1;
	}
	static validateFloat11(value) {
		const f = parseFloat(value);
		return !isNaN(f) && isFinite(value) && -1<=f && f<=1;
	}
	static validateShape(value) {
		return /^\((\d+,?)+\)$/.test(value);
	}
	
	
}




// static STYLES

DiagramElementBase.assignStatic(ArgumentElement, function() {
	this.style = {};
	// types
	this.style.type = {};
	this.style.type._base = {
	};
	this.style.type.bool = {
		...this.style.type._base
	};
	this.style.type.string = {
		...this.style.type._base,
		background: 'white',
		minSize: new go.Size(100, 0),
		editable: true,
		isMultiline: false
	};
	this.style.type.option = {
		...this.style.type._base,
		background: '#e8e8e8',
		minSize: new go.Size(100, 0)
	};
});


// static TEMPLATES

DiagramElementBase.assignStaticDeferred(ArgumentElement, function() {
	this.templates = {};
	this.templates.fields = {};
	this.templates.fields.nosupport = 
		ArgumentElement.$(go.Panel, 'Vertical',
			ArgumentElement.$(go.TextBlock, {
				...ArgumentElement.style.type.string,
				background: 'transparent',
				editable: false,
				text: 'not supported',
				stroke: 'grey'
				}));
	this.templates.fields.bool =
		ArgumentElement.$(go.Panel, 'Vertical', {
			...ArgumentElement.style.type.bool,
			},
			ArgumentElement.$('CheckBox', 'value'));
	this.templates.fields.string =
		ArgumentElement.$(go.Panel, 'Vertical',
			ArgumentElement.$(go.TextBlock, {
				...ArgumentElement.style.type.string
				},
				new go.Binding('text', 'value').makeTwoWay(),
				new go.Binding('textValidation', 'itype', function(itype){
					return function(el,oldValue,newValue) {
						return itype.some(function(type){
							return ArgumentElement.validate(type, newValue);
						});
					};
				})));
});

