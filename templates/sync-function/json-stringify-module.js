function jsonStringify(value) {
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
  var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
  var escRegex = /[\\"\u0000-\u001F\u2028\u2029]/g;
  if (value === null || value === void 0) {
    return 'null';
  } else if (typeof value === 'number') {
    return isFinite(value) ? value.toString() : 'null';
  } else if (typeof value === 'boolean') {
    return value.toString();
  } else if (typeof value === 'object') {
    if (typeof value.toJSON === 'function') {
      return jsonStringify(value.toJSON());
    } else if (Array.isArray(value)) {
      var arrayString = '[';
      for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex++) {
        arrayString += (arrayIndex ? ',' : '') + jsonStringify(value[arrayIndex]);
      }
      return arrayString + ']';
    } else {
      var properties = [];
      for (var objectPropertyName in value) {
        var objectPropertyValue = value[objectPropertyName];
        if (objectPropertyValue !== void 0 && hasOwnProperty.call(value, objectPropertyName)) {
          properties.push(jsonStringify(objectPropertyName) + ':' + jsonStringify(value[objectPropertyName]));
        }
      }
      return '{' + properties.join(',') + '}';
    }
  } else {
    return '"' + value.toString().replace(escRegex, escFunc) + '"';
  }
}
