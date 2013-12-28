describe("Coreisma", function() {
  it("is exposed globally", function() {
    expect(Coreisma).toNotEqual(undefined)
  });

  it("is extendable", function() {
    var testExtention = function() { return { extension: extension } }

    Coreisma.extend({
      testExtention: testExtention
    })

    expect(Coreisma.testExtention).toEqual(testExtention);
  });

  it("adds an extension", function() {
    Coreisma.addExtension(function() {
      return {
        addExtensionTest: "addExtensionTest"
      }
    });

    expect(Coreisma.addExtensionTest).toEqual("addExtensionTest");
  });

  it("ignores any descriptions passed as first argument", function() {
    Coreisma.addExtension("This is a test extension", function() {
      return {
        addExtensionTest: function() {}
      }
    });

    expect(typeof Coreisma.addExtensionTest).toEqual("function")
  });

  it("uses the first function even if two arguments are passed", function() {
    var correctFunc = function() { return { testResult: "passes"} },
        incorrectFunc = function() { return { testResult: false} };

    Coreisma.addExtension(correctFunc, incorrectFunc);

    expect(Coreisma.testResult).toEqual("passes")
  });

  it("passes in the core to the extension", function() {
    var receivedCore = false;

    Coreisma.addExtension(function(core) {
      receivedCore = core == Coreisma

      return {}
    });

    expect(receivedCore).toBeTruthy();
  });

  it("passes in the current hub to the extension", function() {
    var receivedHub = false;

    Coreisma.addExtension(function(core, hub) {
      receivedHub = Coreisma.hub && hub == Coreisma.hub

      return {}
    });

    expect(receivedHub).toBeTruthy();
  });

  it("registers a module", function() {
    var moduleFunctions = {
      init: function() {}
    }

    Coreisma.addModule("TestModule", moduleFunctions);

    expect(Coreisma.getModule("TestModule")).toEqual(moduleFunctions);
  });

  it("starts by calling all the modules init function", function() {
    var hasStarted = false;

    var TestModule = {
      init: function() {
        hasStarted = true;
      }
    };

    Coreisma.addModule("TestModule", TestModule);

    Coreisma.start();

    expect(hasStarted).toEqual(true);
  });

  it("stops by calling all the modules shutdown function", function() {
    var hasStopped = false;

    var TestModule = {
      init: function() {},
      shutdown: function() {
        hasStopped = true
      }
    };

    Coreisma.addModule("TestModule", TestModule);

    Coreisma.stop();

    expect(hasStopped).toEqual(true);
  });

  describe("Hub", function() {
    it("broadcasts multiple events when a listened event triggered", function() {
      var broadcastedOne = false,
          broadcastedTwo = false;

      Coreisma.addModule("MultipleBroadcasteeModuleOne", {
        init: function(hub) {
          hub.listen('testMultipleListenerEvent', function() {
            broadcastedOne = true
          });
        }
      });

      Coreisma.addModule("MultipleBroadcasteeModuleTwo", {
        init: function(hub) {
          hub.listen('testMultipleListenerEvent', function() {
            broadcastedTwo = true
          });
        }
      });

      Coreisma.start();
      Coreisma.hub.broadcast("testMultipleListenerEvent");

      expect(broadcastedOne, "First listener").toBeTruthy();
      expect(broadcastedTwo, "Second listener").toBeTruthy();

    });

    it("doesn't broadcast events that aren't being listened to", function() {
      var broadcastedOne = false,
          broadcastedTwo = false;

      Coreisma.addModule("MultipleBroadcasteeModuleOne", {
        init: function(hub) {
          hub.listen('testMultipleListenerEvent', function() {
            broadcastedOne = true
          });
        }
      });

      Coreisma.addModule("MultipleBroadcasteeModuleTwo", {
        init: function(hub) {
          hub.listen('testNotTriggered', function() {
            broadcastedTwo = true
          });
        }
      });

      Coreisma.start();
      Coreisma.hub.broadcast("testMultipleListenerEvent");

      expect(broadcastedOne, "First listener").toBeTruthy();
      expect(broadcastedTwo, "Second listener").toBeFalsy();

    });
  });
});