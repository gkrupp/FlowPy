
/* 
 * Helper functions
 * - querySelector
 */

function _(selector = 'body', all = false, root = document) {
	if (typeof root === 'string')
		root = document.querySelector(root);
	if (root === null)
		return null;
	if (all) return root.querySelectorAll(selector);
	else return root.querySelector(selector);
}






/* 
 * Global Configurations
 * - HTML elements
 * - Dataset properties
 * - diagram
 */

const SERVER_DOMAIN = document.domain;
const SERVER_PORT = location.port;

const CONFIG = {
	EL_MODEL_NAME: '#model_input_name',    // model name input field
	EL_MODEL_RUN: '#model_btn_run',        // run button
	EL_MODEL_LOAD: '#model_btn_load',      // load button
	EL_MODEL_SAVE: '#model_btn_save',      // save button
	EL_MODEL_FILE: '#model_input_load',    // (hidden) file input
	EL_MODEL_CLS: '#model_btn_console',    // console button
	EL_MODEL_LIST: '#node_list',           // node list container
	
	DS_PATH: '/data.json',                 // configuration file
	DS_NODES: 'nodes',                     // node descriptors' root
	
	GO_NODE_CP: 'view',                    // node view property
	GO_LINK_FROM_CP: 'fromPort',           // model descriptor property
	GO_LINK_TO_CP: 'toPort',               // model descriptor property
	
	DIAGRAM_ELEMENT_ID: 'diagram',         // diagram HTML ID
	CONSOLE_ELEMENT_ID_PREFIX: 'console',  // console HTML ID prefix
	CONSOLE_ELEMENT_ID_SUFFIXES: ['stdout', 'stderr'],  // console HTML ID suffix
	CONSOLE_SCROLL_THRESHOLD: 24,          // scroll threshold in px
	CONSOLE_MAX_ROWS: 1000,                // maximum console log line history
};






/* 
 * Connection event listeners
 * - connect
 * - init
 * - event listeners
 */


/// Connection

const server = new Connection(SERVER_DOMAIN, SERVER_PORT);


/// Init

init(CONFIG);


// Event Listeners

server.addEventListener('connection_change', function(event) {
	if (event.detail.connected) {
		_('#header').classList.add('active');
	} else {
		_('#header').classList.remove('active');
	}
});
server.addEventListener('state_change', function(event) {
	const modelBtnRun = _(CONFIG.EL_MODEL_RUN);
	_('[icon]', false, modelBtnRun).innerText =
		(event.detail.running ? 'stop' : 'play_arrow');
	diagram.isReadOnly = event.detail.running;
	modelBtnRun.disabled = false;
});
server.addEventListener('progress_change', function(event) {
	if (event.detail.node !== null) {
		diagram.highlightNode(event.detail.node, event.detail.state);
	} else if (event.detail.time) {
		console.log(event.detail.time, 's');
	}
});
server.addEventListener('console_change', function(event) {
	const row = document.createElement('div');
	row.appendChild(document.createTextNode(event.detail.line));
	const parent = _(`#${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-${event.detail.label}`);
	const fromBottom = (parent.scrollHeight - parent.scrollTop - parent.offsetHeight)
	const atBottom = fromBottom	< CONFIG.CONSOLE_SCROLL_THRESHOLD;
	while (parent.childElementCount > CONFIG.CONSOLE_MAX_ROWS)
		parent.removeChild(parent.firstChild);
	parent.appendChild(row);
	if (atBottom)
		parent.scrollTop = parent.scrollHeight;
});

server.addEventListener('error', function(event) {
	console.error(event.detail.message);
	alert(event.detail.message);
});






/* 
 * Header toolbar buttons
 * - event listeners
 */


/// Model - Save

_(CONFIG.EL_MODEL_SAVE).addEventListener('click', function(event) {
	// collect model data
	const model_json = diagram.model.toJSON();
	const model_name = (_(CONFIG.EL_MODEL_NAME).value || 'model') + '.json';
	// start download
	const link = document.createElement('a');
	link.download = model_name;
	link.href = `data:application/json,${model_json}`;
	link.click();
});


/// Model - Load

_(CONFIG.EL_MODEL_LOAD).addEventListener('click', function(event) {
	// open file explorer
	_(CONFIG.EL_MODEL_FILE).click();
});
_(CONFIG.EL_MODEL_FILE).addEventListener('change', function(event) {
	// no selected file
	if (event.target.files.length < 1)
		return;
	// stop current execution
	server.stop();
	// check file type
	const file = event.target.files[0];
	if (file.type !== 'application/json') {
		alert('File type must be JSON!');
		return;
	}
	// parse JSON file
	try {
		// extract model name from filename
		let name = file.name.split('.');
		if (name[name.length-1] === 'json')
			name[name.length-1] = ''
		_(CONFIG.EL_MODEL_NAME).value = name.join('');
		// read file from disk
		const reader = new FileReader();
		reader.onload = function(event) {
			try {
				diagram.loadModel(JSON.parse(event.target.result));
			} catch(err) {
				console.error(err);
				alert('Invalid model structure!');
			}
		};
		reader.readAsText(file);
	} catch (err) {
		console.error(err);
		alert('File cannot be read!');
	}
	// reset file input
	_(CONFIG.EL_MODEL_FILE).value = '';
});


/// Model - Start/Stop

_(CONFIG.EL_MODEL_RUN).addEventListener('click', function(event) {
	// disable "run" button
	event.target.disabled = true;
	if (server.isRunning()) {
		// stop execution if running
		server.stop();
	} else {
		// start execution if not
		diagram.highlightNode(null, 'idle');
		server.start(diagram.model);
		console_clear();
	}
});


/// Model - Console

_(CONFIG.EL_MODEL_CLS).addEventListener('click', function(event) {
	const console_element = _('#console');
	if (console_element.classList.contains('hidden')) {
		// show consoles if hidden
		console_element.classList.remove('hidden');
	} else {
		// show if not
		console_element.classList.add('hidden');
	}
});
// switching console tabs (stdout/stderr)
_(`[name="${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-tab"]`, true).forEach(function(el) {
	el.addEventListener('change', function(event) {
		// hide all console
		_(`[id^="${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-"].tab-content`, true)
		.forEach(function(el) {
			el.classList.add('hidden');
		});
		// show clicked
		const targetId = event.target.id;
		const tab = targetId.substr(targetId.lastIndexOf('-')+1);
		const focused = _(`#${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-${tab}`);
		focused.classList.remove('hidden');
	});
})






/* 
 * Init functions
 * - init
 * - render
 */


/// Init

function init(config) {
	
	// download and parse configuration file
	return fetch(config.DS_PATH)
	
	// respose check
	.then(function(res) {
		if (res.status !== 200) throw new Error('Network error!');
		else return res.json();
	})
	
	// diagram initialization
	.then(function(data) {
		// elements
		_(config.EL_MODEL_LIST).appendChild(
			render_node_tree(data[config.DS_NODES], config.DS_NODES)
		);
		// nodes, links, diagrams
		DiagramElementBase.init(data, go.GraphObject.make, config);
		DiagramElementBase.flushDeferredStaticAssigns();
		// diagram
		window.diagram = new DiagramElement(config.DIAGRAM_ELEMENT_ID, NodeElement, LinkElement);
	})
	
	// node list drag handlers
	.then(function() {
		// element drag init
		window.dragged = null;
		document.addEventListener('dragstart', function(event) {
			// if not draggable
			if (!event.target.hasAttribute('draggable'))
				return;
			// set data transfer
			event.dataTransfer.setData('text', event.target.$$);
			dragged = event.target;
			// dragged element position
			dragged.offsetX = event.offsetX - dragged.clientWidth / 2;
			dragged.offsetY = event.offsetY - dragged.clientHeight / 2;
			event.target.classList.add('dragging');
		});
		document.addEventListener('dragend', function(event) {
			event.target.classList.remove('dragging');
		});
	})
	
	// error handling
	.catch(function(err) {
		console.error(err);
		alert(err.message);
	});
	
}


/// Node Tree Render

function render_node_tree_element($$ = 'unknown', data = {}) {
	// build one node entry
	const name = (data.name !== undefined
								? data.name
								: NodeElement.getNameFromPackage($$));
	const item = document.createElement('div');
	item.appendChild(document.createTextNode(name));
	item.setAttribute('draggable', true);
	item.$$ = $$;
	return item;
}
function render_node_tree(node = {}, name = 'unknown') {
	if (!(node instanceof Object)) {
		return null;
	}
	// render nodes recursively
	const parentNode = document.createElement('ul');
	for (let childName in node) {
		if (!(node[childName] instanceof Object)) {
			continue;
		}
		if ('package' in node[childName] && 'args' in node[childName]) {
			// has 'package' and 'args' so it is a leafe
			const childNode = document.createElement('li');
			childNode.appendChild(
				render_node_tree_element([name,childName].join('.'), node[childName]));
			childNode.classList.add('node_list_element');
			parentNode.appendChild(childNode);
		} else {
			// logicel package otherwise
			const childNode = render_node_tree(node[childName], [name,childName].join('.'));
			if (childNode !== null) {
				const parentElement = document.createElement('li');
				const categoryNode = document.createTextNode(childName);
				parentElement.appendChild(categoryNode);
				parentElement.appendChild(childNode);
				parentElement.classList.add('node_list_package');
				parentNode.appendChild(parentElement);
			}
		}
	}
	// return with current package level
	if (parentNode.childNodes.length === 0) {
		return null;
	} else {
		return parentNode;
	}
}






/* 
 * Viualization helpers
 * - console
 */


/// Console - Clear

function console_clear(name = null) {
	if (typeof name === 'string') {
		_(`#${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-${name}`).innerHTML = '';
	} else {
		for (name of CONFIG.CONSOLE_ELEMENT_ID_SUFFIXES) {
			_(`#${CONFIG.CONSOLE_ELEMENT_ID_PREFIX}-${name}`).innerHTML = '';
		}
	}
}