function primary(filename, condition) {
    condition(filename) ? require(filename) : undefined;
}

function throwSafe(filename, condition) {
  try {
    primary(filename, condition);
  } catch (e) {
    return undefined;
  }
}

function recurseParent(modin) {
  if (modin.parent === null) {
    return modin;
  }

  return recurseParent(modin.parent);
}

function makeResolvable(module) {
  const tlmod = recurseParent(module);

  return function _makeResolvable(mod, req, res) {
    const reqProvided = req !== undefined && req !== null;
    mod = mod || tlmod;
    req = req || mod.__proto__.require;
    res = res || reqProvided ?
      undefined : function ___invokce_ctor_resolve(request) {
        return mod.constructor._resolveFilename(request, mod);
      };

    return function __use_provided_module_require(filename) {
      return _nodeResolver(filename, req, res);
    };
  }
}

function _nodeResolver(filename, req, res) {
  if (res === undefined) {
    res = req.resolve;
  }

  try {
    const path = res(filename);
    return req(path);
  } catch (e) {
    return undefined;
  }
}

module.exports = primary;
module.exports.throwSafe = throwSafe;
module.exports.ifResolvable = makeResolvable(module);
