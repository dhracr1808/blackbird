const isFn = (mybrFn) => typeof mybrFn === "function";

function $Promise(executor) {
  if (!isFn(executor)) throw new TypeError("executor function");
  this._state = "pending";
  this._value = null;
  this._handlersGroups = [];
  const resolve = this._internalResolve.bind(this);
  const reject = this._internalReject.bind(this);
  executor(resolve, reject);
}

$Promise.prototype._internalResolve = function (data) {
  if (this._state === "pending") this._internalStateChange("fulfilled", data);
};
$Promise.prototype._internalReject = function (reason) {
  if (this._state === "pending") this._internalStateChange("rejected", reason);
};

$Promise.prototype._internalStateChange = function (state, value) {
  this._state = state;
  this._value = value;
  this._callHandlers();
};

$Promise.prototype.then = function (successCb, errorCb) {
  const dowstreamPromise = new $Promise(() => {});
  this._handlersGroups.push({
    successCb: isFn(successCb) ? successCb : null,
    errorCb: isFn(errorCb) ? errorCb : null,
    dowstreamPromise,
  });
  if (this._state !== "pending") this._callHandlers();
  return dowstreamPromise;
};

$Promise.prototype.catch = function (errorCb) {
  return this.then(null, errorCb);
};
$Promise.prototype._callHandlers = function () {
  while (this._handlersGroups[0]) {
    const handler = this._handlersGroups.shift();
    const method = this._state === "fulfilled" ? "successCb" : "errorCb";
    const downStream = handler.dowstreamPromise;
    if (!handler[method]) {
      if (this._state === "fulfilled") downStream._internalResolve(this._value);
      else downStream._internalReject(this._value);
    } else {
      try {
        const handleResult = handler[method](this._value);
        console.log(handleResult instanceof $Promise);
        if (handleResult instanceof $Promise) {
          handleResult.then(
            (value) => {
              downStream._internalResolve(value);
            },
            (reason) => {
              downStream._internalReject(reason);
            }
          );
        } else downStream._internalResolve(handleResult);
      } catch (error) {
        downStream._internalReject(error);
      }
    }
  }
};
