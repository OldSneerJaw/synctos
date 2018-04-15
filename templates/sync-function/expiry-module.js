function expirationModule(utils) {
  return {
    setDocExpiry: function(doc, oldDoc, expiryValue) {
      var resolvedExpiryValue = utils.resolveDocumentConstraint(expiryValue);

      if (typeof resolvedExpiryValue === 'number') {
        expiry(resolvedExpiryValue);

        var secondsPer30Days = 2592000;
        if (resolvedExpiryValue > secondsPer30Days) {
          // Expiry was specified as the number of seconds since the Unix epoch
          return new Date(resolvedExpiryValue * 1000).toISOString();
        } else {
          // Expiry was specified as the number of seconds in the future
          var relativeDate = new Date();
          relativeDate.setSeconds(relativeDate.getSeconds() + resolvedExpiryValue);

          return relativeDate.toISOString();
        }
      } else if (typeof resolvedExpiryValue === 'string') {
        expiry(resolvedExpiryValue);

        return resolvedExpiryValue;
      } else if (resolvedExpiryValue instanceof Date) {
        var isoDateString = resolvedExpiryValue.toISOString();
        expiry(isoDateString);

        return isoDateString;
      } else {
        throw new Error('Invalid expiry value for document "' + doc._id + '": ' + utils.jsonStringify(resolvedExpiryValue));
      }
    }
  };
}
