{
  channels: toDefaultSyncChannels(doc, oldDoc, 'NOTIFICATIONS_CONFIG'),
  authorizedRoles: defaultAuthorizedRoles,
  authorizedUsers: defaultAuthorizedUsers,
  typeFilter: function(doc, oldDoc) {
    // Note that this regex uses double quotes rather than single quotes as a workaround to https://github.com/Kashoo/synctos/issues/116
    return createBusinessEntityRegex("notificationsConfig$").test(doc._id);
  },
  propertyValidators: {
    notificationTypes: {
      // A map of notification types -> enabled notification transports
      type: 'hashtable',
      hashtableKeysValidator: {
        mustNotBeEmpty: true,
        regexPattern: /^[a-zA-Z]+$/
      },
      hashtableValuesValidator: {
        type: 'object',
        required: true,
        propertyValidators: {
          enabledTransports: {
            // The list of notification transports that are enabled for the notification type
            type: 'array',
            arrayElementsValidator: {
              type: 'object',
              required: true,
              propertyValidators: {
                transportId: {
                  // The ID of the notification transport
                  type: 'string',
                  required: true,
                  mustNotBeEmpty: true
                }
              }
            }
          }
        }
      }
    }
  }
}
