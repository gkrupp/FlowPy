
'use strict';


class Connection {
	
	constructor(domain = document.domain, port = location.port) {
		const $ = this;
		this._eventElement = document.createElement('a');
		this.socket = io.connect('//' + domain + ':' + port);
		this._backend = {
			connected: false,
			running: false
		};
		
		// connection
		this.socket.on('connect', function() {
			$._backend.connected = true;
			$._dispatchEvent('connection_change', {
				connected: $.isConnected()
			});
		});
		this.socket.on('disconnect', function() {
			$._backend.connected = false;
			$._dispatchEvent('connection_change', {
				connected: $.isConnected()
			});
		});
		
		// state
		this.socket.on('state_change', function(data) {
			if (data.status !== 200) {
				$._dispatchEvent('error', {
					message: data.message
				});
			} else {
				$._backend.running = (data.state === 'running');
				$._dispatchEvent('state_change', {
					running: $.isRunning()
				});
			}
		});
		
		// progress
		this.socket.on('progress_change', function(data) {
			if (data.status !== 200) {
				$._dispatchEvent('error', {
					message: data.message
				});
			} else {
				$._dispatchEvent('progress_change', data.data);
			}
		});
		
		// console
		this.socket.on('console_stream', function(data) {
			if (data.status !== 200) {
				$._dispatchEvent('error', {
					message: data.message
				});
			} else {
				$._dispatchEvent('console_change', data.data);
			}
		});
		
	}
	
	
	on(event = '', callback = null) {
		this.socket.on(event, callback);
	}
	emit(event = '', data = null) {
		this.socket.emit(event, data);
	}
	addEventListener(event = '', handler = ()=>{}, options) {
		this._eventElement.addEventListener(event, handler, options);
	}
	removeEventListener(event = '', handler = ()=>{}, options) {
		this._eventElement.removeEventListener(event, handler, options);
	}
	_dispatchEvent(event = '', detail = undefined) {
		this._eventElement.dispatchEvent(
			new CustomEvent(event, { detail: detail }));
	}
	
	
	isConnected() {
		return this._backend.connected;
	}
	isRunning() {
		return this._backend.running;
	}
	
	
	start(model = {}) {
		if (!this._backend.running) {
			this.emit('cmd_run', {
				graph: model
			});
			return true;
		} else {
			return false;
		}
	}
	stop() {
		if (this._backend.running) {
			this.emit('cmd_stop', {});
			return true;
		} else {
			return false;
		}
	}
	
	
}

