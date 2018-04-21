function expirationModule(utils) {
  return {
    setDocExpiry: function(doc, oldDoc, expiryValue) {
      var resolvedExpiryValue = utils.resolveDocumentConstraint(expiryValue);

      if (typeof resolvedExpiryValue === 'number') {
        expiry(resolvedExpiryValue);

        var secondsPer30Days = 2592000;
        if (resolvedExpiryValue > secondsPer30Days) {
          // Expiry was specified as the number of seconds since the Unix epoch
          return new Date(resolvedExpiryValue * 1000);
        } else {
          // Expiry was specified as the number of seconds in the future
          var relativeDate = new Date();
          relativeDate.setSeconds(relativeDate.getSeconds() + resolvedExpiryValue);

          return relativeDate;
        }
      } else if (typeof resolvedExpiryValue === 'string') {
        expiry(resolvedExpiryValue);

        return new Date(resolvedExpiryValue);
      } else if (resolvedExpiryValue instanceof Date) {
        expiry(Math.floor(resolvedExpiryValue.getTime() * 0.001));

        return resolvedExpiryValue;
      } else {
        throw new Error('Invalid expiry value for document "' + doc._id + '": ' + utils.jsonStringify(resolvedExpiryValue));
      }
    }
  };
}
