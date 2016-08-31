if (typeof(Module) === "undefined") Module = {};

Module.preRun = function() {
	FS.mkdir('/working');
	FS.mount(NODEFS, {root: '.'}, '/working');
	//ENV.FC_DEBUG = '8063';
};

Module.logReadFiles = 1;
Module.logWriteFiles = 1;
