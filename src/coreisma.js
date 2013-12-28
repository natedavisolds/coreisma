/* 
  Copyright (c) 2013 Nathan Davis Olds. This software is licensed under the MIT License.

  https://github.com/natedavisolds/coreisma
*/

var Coreisma = {
  version: "0.1.0",
  extend: function(extension) {
    var extensionMethods = (typeof extension === 'function') ? extension(this) : extension;

    for (var property in extensionMethods) {
      if (extensionMethods.hasOwnProperty(property)) {
        Coreisma[property] = extensionMethods[property];
      }
    }

    return extensionMethods;
  }
};

Coreisma.extend(function(core) {
  var extensions = [];

  var addExtension = function(extensionFunction) {
    if (arguments.length > 1 && typeof arguments[0] !== 'function') { extensionFunction = arguments[1]; }

    var extension = (typeof extensionFunction === 'function') ? extensionFunction(core, core.hub) : extensionFunction;

    core.extend(extension);

    extensions.push(extension);

    return extension;
  };

  return {
    addExtension: addExtension
  };
});

Coreisma.addExtension("Hub", function(core) {
  var addHub = function(hubFunction) {
    core.hub = (typeof hubFunction === 'function') ? hubFunction(core) : hubFunction;
  };

  var addModule = function(moduleName, moduleFunction) {
    if (core.hub) { core.hub.register(moduleName, moduleFunction); }
  };

  var getModule = function(moduleName) {
    return (core.hub) ? core.hub.find(moduleName) : {};
  };

  var start = function() {
    core.hub.broadcast('startup.modules', core.hub);
  };

  var stop = function() {
    core.hub.broadcast('shutdown.modules', core.hub);
  };

  return {
    addHub: addHub,
    addModule: addModule,
    getModule: getModule,
    hub: {},
    start: start,
    stop: stop
  };
});

Coreisma.addHub(function(core) {
  var modules = {},
      callBacks = {};

  var broadcast = function(eventName, data) {
    var eventCallBacks = callBacks[eventName];

    for (var i in eventCallBacks) {
      if (eventCallBacks.hasOwnProperty(i)) {
        eventCallBacks[i](data);
      }
    }
  };

  var listen = function(eventName, module) {
    if (!callBacks[eventName]) { callBacks[eventName] = []; }

    callBacks[eventName].push(module);
  };

  var register = function(moduleName, moduleDefinition) {
    var module = (typeof moduleDefinition === 'function') ? moduleDefinition(core, core.hub) : moduleDefinition;

    modules[moduleName] = module;

    if (typeof module.init === 'function') { listen('startup.modules', module.init); }
    if (typeof module.shutdown === 'function') { listen('shutdown.modules', module.shutdown); }
  };

  var find = function(moduleName) {
    return modules[moduleName];
  };

  return {
    listen: listen,
    broadcast: broadcast,
    register: register,
    find: find
  };
});
