describe("la clase `$Promise`", function () {
  it("es una funcion", function () {
    expect(typeof $Promise).toBe("function");
  });
  it("puede ser llamado con un argumento de funcion (el 'exucutor'), devolviendo una nueva instancia de promesa", function () {
    var executor = function () {};
    var promise = new $Promise(executor);
    expect(promise instanceof $Promise).toBe(true);
  });
  it("arroja un error descriptivo si es llamado sin funcion como argumento", function () {
    const noFunctions = [null, "hola", undefined, 518, {}, false];
    noFunctions.forEach((e) => {
      expect(callingNewPromiseWith(e)).toThrowError(
        TypeError,
        /executor.+function/i
      );
    });
    function callingNewPromiseWith(argument) {
      return function () {
        new $Promise(argument);
      };
    }
  });
});

describe("una instancia de promesa`", function () {
  var promise;
  beforeEach(function () {
    var executor = function () {};
    promise = new $Promise(executor);
  });

  it("comienza con un estado interno pending", function () {
    expect(promise._state).toBe("pending");
  });

  it("tiene un metodo de instancia `._internalResolve`", function () {
    expect(typeof promise._internalResolve).toBe("function");
  });
  it("tiene un metodo de instancia `._internalReject`", function () {
    expect(typeof promise._internalReject).toBe("function");
    expect(promise._internalReject).not.toBe(promise._internalResolve);
  });
  describe("Resolviendo", function () {
    it("cambia el estado  de la promesa a fullfilled ", function () {
      promise._internalResolve();
      expect(promise._state).toBe("fulfilled");
    });

    it("puede enviar data a la promesa para almacenamiento", function () {
      var someData = { name: "Harry Potter" };
      promise._internalResolve(someData);
      expect(promise._value).toBe(someData);
    });

    it("no afecta a la promesa ya completada", function () {
      var data1 = { name: "Harry Potter" };
      var data2 = { name: "Gandalf" };
      promise._internalResolve(data1);
      promise._internalResolve(data2);
      expect(promise._value).toBe(data1);
    });

    it("funciona hasta con valores falsos", function () {
      var data1;
      var data2 = "oops!";
      promise._internalResolve(data1);
      promise._internalResolve(data2);
      expect(promise._value).toBe(data1);
    });
  });

  describe("Rechazando", function () {
    it("cambia el estado  de la promesa a rejected ", function () {
      promise._internalReject();
      expect(promise._state).toBe("rejected");
    });

    it("puede enviar una razon a la promesa para almacenamiento", function () {
      var myReason = { error: "bad request" };
      promise._internalReject(myReason);
      expect(promise._value).toBe(myReason);
    });

    it("no afecta a la promesa ya rechazada", function () {
      var reason1 = { error: "bad request" };
      var reason2 = { error: "timed out" };
      promise._internalReject(reason1);
      promise._internalReject(reason2);
      expect(promise._value).toBe(reason1);
    });

    it("funciona hasta con valores falsos", function () {
      var reason1;
      var reason2 = "oops!";
      promise._internalReject(reason1);
      promise._internalReject(reason2);
      expect(promise._value).toBe(reason1);
    });
  });

  describe("una promesa colocada nunca cambia el estado ", () => {
    it("`reject` no reescribe fulfilled", () => {
      promise._internalResolve("dumbleore");
      promise._internalReject(404);
      expect(promise._value).toBe("dumbleore");
    });
    it("`resolve` no sobreEscribe fulfilled", () => {
      promise._internalReject(404);
      promise._internalResolve("dumbleore");
      expect(promise._state).toBe("rejected");
      expect(promise._value).toBe(404);
    });
  });

  describe("la funcion executor", function () {
    var executor;
    beforeEach(function () {
      executor = jasmine.createSpy();
    });

    it("es llamada cuando hacemos una nueva $promise ", function () {
      expect(executor).not.toHaveBeenCalled();
      var promise = new $Promise(executor);
      expect(executor).toHaveBeenCalled();
    });

    it("es llamado con dos funciones distintas (funception!), resolve , reject", function () {
      var promise = new $Promise(executor);
      var argsPassedIntoExecutor = executor.calls.argsFor(0);
      expect(argsPassedIntoExecutor.length).toBe(2);
      var resolve = argsPassedIntoExecutor[0];
      var reject = argsPassedIntoExecutor[1];

      expect(typeof resolve).toBe("function");
      expect(typeof reject).toBe("function");
      expect(resolve).not.toBe(reject);
    });
  });
  describe("argumento resolve", function () {
    it("resuelve la promesa", function () {
      var promise = new $Promise(function (resolve) {
        resolve("WinGarDium leviOHsa");
      });
      expect(promise._state).toBe("fulfilled");
      expect(promise._value).toBe("WinGarDium leviOHsa");
    });

    it("es indistinguible en comportambien a `_internalResolve`", function () {
      var resolver;
      var promise = new $Promise(function (resolve) {
        resolve("Use the promise marchinery");
        resolver = resolve;
      });
      resolver("no, luke. I am your resolver");
      promise._internalReject('no, that"s imposible');
      promise._internalResolve("search your feeling, luke");
      expect(promise._state).toBe("fulfilled");
      expect(promise._value).toBe("Use the promise marchinery");
    });
  });
  describe("argumento reject", function () {
    it("rechaza la promesa", function () {
      var promise = new $Promise(function (resolve, reject) {
        reject("Stupefy!");
      });
      expect(promise._state).toBe("rejected");
      expect(promise._value).toBe("Stupefy!");
    });

    it("es indistinguible en comportambien a `_internalReject`", function () {
      var rejector;
      var promise = new $Promise(function (resolve, reject) {
        reject("you must unlean what you have learned");
        rejector = reject;
      });
      rejector("no, luke. I am your resolver");
      promise._internalReject('no, that"s imposible');
      promise._internalResolve("search your feeling, luke");
      expect(promise._state).toBe("rejected");
      expect(promise._value).toBe("you must unlean what you have learned");
    });

    it("por lo tanto permite al creador de una nueva promesa controlar su destino, incluso asincromicamnete", function (done) {
      var promise3 = new $Promise(function (resolve) {
        setTimeout(function runInTheFuture() {
          resolve("wow, the future is so cool.");
        }, 50);
      });
      expect(promise3._state).toBe("pending");
      expect(promise._value).toBe(null);

      setTimeout(function runInTheFuture() {
        expect(promise3._state).toBe("fulfilled");
        expect(promise3._value).toBe("wow, the future is so cool.");
        done();
      }, 100);
    });
  });
});

//// cap 2

describe("Capilo 2: Fulfillment callback attachment", function () {
  function noop() {}
  describe("el metodo then de una promesa", function () {
    var promise, s1, e1, s2, e2;
    beforeEach(function () {
      promise = new $Promise(noop);
      s1 = function () {};
      e1 = function () {};
      s2 = function () {};
      e2 = function () {};
    });

    it("agrega grupo de handlers (funciones callbacks) a la promesa", function () {
      promise.then(s1, e1);
      expect(promise._handlersGroups[0].successCb).toBe(s1);
      expect(promise._handlersGroups[0].errorCb).toBe(e1);
    });

    it("puede ser llamado multiples veces para añadir mas handlers", function () {
      promise.then(s1, e1);
      expect(promise._handlersGroups[0].successCb).toBe(s1);
      expect(promise._handlersGroups[0].errorCb).toBe(e1);

      promise.then(s2, e2);
      expect(promise._handlersGroups[1].successCb).toBe(s2);
      expect(promise._handlersGroups[1].errorCb).toBe(e2);
    });
    it("agrega un valor falso en lugar de callbacks que no son funciones en el success o error", function () {
      promise.then("a string", {});
      expect(promise._handlersGroups[0].successCb).toBeFalsy();
      expect(promise._handlersGroups[0].errorCb).toBeFalsy();
    });
  });
  describe("Una Promise", function () {
    var promiseForNum, foo;
    var setFoo10 = jasmine.createSpy("setFoo10").and.callFake(function () {
      foo = 10;
    });
    var addToFoo = jasmine.createSpy("addToFoo").and.callFake(function (num) {
      foo += num;
    });
    beforeEach(function () {
      promiseForNum = new $Promise(noop);
      foo = 0;

      setFoo10.calls.reset();
      addToFoo.calls.reset();
    });
    describe("que no se haya compledato aun", function () {
      it("no llama ningun success handler aun", function () {
        promiseForNum.then(setFoo10);
        expect(setFoo10).not.toHaveBeenCalled();
      });
    });
    describe("que ya esta completada", function () {
      beforeEach(function () {
        promiseForNum._internalResolve(25);
      });

      it("llama al success handles agregado por `.then`", function () {
        promiseForNum.then(setFoo10);
        expect(setFoo10).toHaveBeenCalled();
      });

      it("llama un success handler psando el valor de la promesa", function () {
        promiseForNum.then(addToFoo);
        expect(addToFoo).toHaveBeenCalledWith(25);
      });

      it("llama a cada success handler, una vez por cada adhesion", function () {
        promiseForNum.then(setFoo10);
        promiseForNum.then(addToFoo);
        promiseForNum.then(addToFoo);
        expect(setFoo10.calls.count()).toBe(1);
        expect(addToFoo.calls.count()).toBe(2);
        expect(addToFoo).toHaveBeenCalledWith(25);
      });
      it("llama cada success handler cuando e añadido", function () {
        promiseForNum.then(setFoo10);
        expect(foo).toBe(10);
        promiseForNum.then(addToFoo);
        expect(foo).toBe(35);
      });
    });

    describe("que ya tiene un success handler", function () {
      it("llama ese handler cuendo es completado", function () {
        promiseForNum.then(setFoo10);
        promiseForNum._internalResolve();
        expect(setFoo10).toHaveBeenCalled();
      });
      it("llama todos los success handlers en orden una ves cuando son completados", function () {
        promiseForNum.then(setFoo10);
        promiseForNum.then(addToFoo);
        promiseForNum._internalResolve(25);
        expect(foo).toBe(35);
      });
    });
  });
});

describe("Capitulo 03: catch", function () {
  function noop() {}

  describe("Otra Promise", function () {
    var promiseForThing, log;
    var logOops = jasmine.createSpy("logOops").and.callFake(function () {
      log.push({ code: "oops" });
    });
    var logInput = jasmine.createSpy("logInput").and.callFake(function (input) {
      log.push(input);
    });
    beforeEach(function () {
      promiseForThing = new $Promise(noop);
      log = [];
      logOops.calls.reset();
      logInput.calls.reset();
    });

    describe("que todavia no es rechazada", function () {
      it("no llama a los errores hanldlrer aun", function () {
        promiseForThing.then(null, logOops);
        expect(logOops).not.toHaveBeenCalled();
      });
    });
    describe("que ya esta rechazada", function () {
      var thenReason = { code: "timed out" };
      beforeEach(function () {
        promiseForThing._internalReject(thenReason);
      });

      it("no llama a ningun succes handler", function () {
        promiseForThing.then(logOops);
        expect(logOops).not.toHaveBeenCalled();
      });

      it("llama un error handler agregado por `.then`", function () {
        promiseForThing.then(null, logOops);
        expect(logOops).toHaveBeenCalled();
      });
      it("llama un error handler pasando el valor de la promesa ", function () {
        promiseForThing.then(null, logInput);
        expect(logInput).toHaveBeenCalledWith(thenReason);
      });
      it("llama una vez cada error handler adjuntado ", function () {
        promiseForThing.then(null, logOops);
        promiseForThing.then(null, logInput);
        promiseForThing.then(null, logInput);
        expect(logOops.calls.count()).toBe(1);
        expect(logInput.calls.count()).toBe(2);
        expect(logInput).toHaveBeenCalledWith(thenReason);
      });
      it("llama cada  error handler en el orden agregado ", function () {
        promiseForThing.then(null, logOops);
        promiseForThing.then(null, logInput);
        expect(log).toEqual([{ code: "oops" }, { code: "timed out" }]);
      });
    });

    describe("que ya tiene un error handler", function () {
      var thenReason = { code: "unauthorized" };

      it("llama a ese handlers cuando es rechazado", function () {
        promiseForThing.then(null, logInput);
        promiseForThing._internalReject(thenReason);
        expect(logInput).toHaveBeenCalledWith(thenReason);
      });

      it("llama a todos sus errors handles en orden una vez cuando es rechazado", function () {
        promiseForThing.then(null, logInput);
        promiseForThing.then(null, logOops);
        promiseForThing._internalReject(thenReason);
        expect(log).toEqual([{ code: "unauthorized" }, { code: "oops" }]);
      });
    });

    describe("con ambos succes y error handlers", function () {
      var ui;
      beforeEach(function () {
        ui = { animals: ["kitten", "puppy"], warning: null };
        promiseForThing.then(
          function thingSuccess(thing) {
            ui.animals.push(thing.animal);
          },
          function thingError(reason) {
            ui.warning = reason.message;
          }
        );
      });

      it("puede hacer cosas con data completada", function () {
        promiseForThing._internalResolve({ animal: "ducklink" });
        expect(ui.animals[2]).toBe("ducklink");
      });
      it("puede lidiar con razones del rejected ", function () {
        promiseForThing._internalReject({ message: "unauthorized" });
        expect(ui.warning).toBe("unauthorized");
      });
      it("descarta handlres que no son necesarios", function () {
        promiseForThing._internalResolve({ animal: "chipmunk" });
        expect(promiseForThing._handlersGroups).toEqual([]);
      });
    });
  });

  describe("Un methodo `.Catch`", function () {
    var promise;
    beforeEach(function () {
      promise = new $Promise(noop);
      spyOn(promise, "then").and.callThrough();
    });

    function myFunc(reason) {
      console.log(reason);
    }

    it("adjunta la funcion pasada como un error handler", function () {
      promise.catch(myFunc);
      expect(promise.then).toHaveBeenCalledWith(null, myFunc);
    });

    it("devuelve lo mismo que ``,then devolveria", function () {
      var catchReturn = promise.catch(myFunc);
      var thenReturn = promise.then(null, myFunc);
      [catchReturn, thenReturn].forEach(sanitize);
      expect(catchReturn).toEqual(thenReturn);

      function sanitize(val) {
        if (!val || typeof val === "function") return;
        Object.keys(val)
          .filter((key) => typeof val[key] === "function")
          .forEach((key) => {
            val[key] = (val[key].name.trim() || "anonymous") + "function";
          });
      }
    });
  });
});

describe("capitulo 04: Promise Chaining y ytransformacion", function () {
  function noop() {}

  describe("por uana dada promesaA (pA)", function () {
    var promiseA, thisReturnsHi, thisThowShade;

    beforeEach(function () {
      promiseA = new $Promise(noop);
      thisReturnsHi = function () {
        return "hi";
      };
      thisThowShade = function () {};
      return "shade";
    });

    it("`.then` agrega una nueva promesa a su handleGroups", function () {
      promiseA.then();

      var groups = promiseA._handlersGroups;
      expect(groups[0].dowstreamPromise instanceof $Promise).toBe(true);

      promiseA.then();
      expect(groups[1].dowstreamPromise instanceof $Promise).toBe(true);
      expect(groups[1].dowstreamPromise).not.toBe(groups[0].dowstreamPromise);
    });

    it("`.then` devuelve ese dowstreamPromise", function () {
      var promiseB = promiseA.then();
      expect(promiseB).toBe(promiseA._handlersGroups[0].dowstreamPromise);
    });
  });

  /*  
  

  describe("que devuelva promiseB (pB) via `.then`:", function () {
    var FAST_TIMEOUT = 10;
    beforeEach(function () {
      jasmine.addMatchers(customMatcher);
    });

    it(
      "si pA es completado pero no tine un success handler, pb es competado con el valor de pA",
      function (done) {
        var promiseB = promiseA.then();
        promiseA._internalResolve(9001);
        expect(promiseB._state).toBe("fulfilled");
        expect(promiseB._value).toBe(9001);
        expect(promiseB).toFulfillWith(9001, done);
      },
      FAST_TIMEOUT
    );
  }); */
});
