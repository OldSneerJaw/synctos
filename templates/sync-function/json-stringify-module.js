function jsonStringify(value) {
  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
  var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
  var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
  var escRegex = /[\\"\u0000-\u001F\u2028\u2029]/g;
  if (isValueNullOrUndefined(value)) {
    return 'null';
  } else if (typeof value === 'number') {
    return isFinite(value) ? value.toString() : 'null';
  } else if (typeof value === 'boolean') {
    return value.toString();
  } else if (typeof value === 'object') {
    if (typeof value.toJSON === 'function') {
      return jsonStringify(value.toJSON());
    } else if (isArray(value)) {
      var arrayString = '[';
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex++) {
        arrayString += (arrayIndex ? ',' : '') + jsonStringify(value[arrayIndex]);
      }
      return arrayString + ']';
    } else {
      var properties = [];
      for (var k in value) {
        // in case "hasOwnProperty" has been shadowed
        if (hasOwnProperty.call(value, k)) {
          properties.push(jsonStringify(k) + ':' + jsonStringify(value[k]));
        }
      }
      return '{' + properties.join(',') + '}';
    }
  } else {
    return '"' + value.toString().replace(escRegex, escFunc) + '"';
  }
}
