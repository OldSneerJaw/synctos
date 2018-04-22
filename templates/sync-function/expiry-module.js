function expirationModule(utils) {
  return {
    setDocExpiry: function(doc, oldDoc, expiryValue) {
      var resolvedExpiryValue = utils.resolveDocumentConstraint(expiryValue);

      if (typeof resolvedExpiryValue === 'number') {
        // The positive sign is applied to numeric values as a workaround to this Sync Gateway issue:
        // https://github.com/couchbase/sync_gateway/issues/3489
        expiry(+resolvedExpiryValue);

        var secondsPer30Days = 2592000;
        if (resolvedExpiryValue > secondsPer30Days) {
          // Expiry was specified as the number of seconds since the Unix epoch
          return new Date(resolvedExpiryValue * 1000);
        } else {
          // Expiry was specified as the number of seconds offset from now
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
