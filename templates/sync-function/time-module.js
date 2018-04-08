function timeModule(utils) {
  var utcTimeZone = {
    multiplicationFactor: 1,
    hour: 0,
    minute: 0
  };

  return {
    isIso8601DateTimeString: isIso8601DateTimeString,
    isIso8601DateString: isIso8601DateString,
    isIso8601TimeString: isIso8601TimeString,
    isIso8601TimeZoneString: isIso8601TimeZoneString,
    compareTimes: compareTimes,
    compareDates: compareDates,
    compareTimeZones: compareTimeZones
  };

  // Check that a given value is a valid ISO 8601 format date string with optional time and time zone components
  function isIso8601DateTimeString(value) {
    var dateAndTimePieces = splitDateAndTime(value);
    var date = extractDateStructureFromDateAndTime(dateAndTimePieces);
    if (date) {
      var timeAndTimezone = extractTimeStructuresFromDateAndTime(dateAndTimePieces);
      var time = timeAndTimezone.time;
      var timezone = timeAndTimezone.timezone;

      return isValidDateStructure(date) &&
        isValidTimeStructure(time) &&
        (timezone === null || isValidTimeZoneStructure(timezone));
    } else {
      return false;
    }
  }

  // Check that a given value is a valid ISO 8601 date string without time and time zone components
  function isIso8601DateString(value) {
    return isValidDateStructure(parseIso8601Date(value));
  }

  // Check that a given value is a valid ISO 8601 time string without date and time zone components
  function isIso8601TimeString(value) {
    return isValidTimeStructure(parseIso8601Time(value));
  }

  // Check that a given value is a valid ISO 8601 time zone
  function isIso8601TimeZoneString(value) {
    return isValidTimeZoneStructure(parseIso8601TimeZone(value));
  }

  function isValidDateStructure(date) {
    return isSupportedYear(date.year) &&
      date.month >= 1 && date.month <= 12 &&
      isValidDayOfMonth(date);
  }

  function isValidTimeStructure(time) {
    return time.hour <= 23 && time.minute <= 59 && time.second <= 59 && time.millisecond <= 999;
  }

  function isValidTimeZoneStructure(timezone) {
    return (timezone.multiplicationFactor === 1 || timezone.multiplicationFactor === -1) &&
      timezone.hour <= 23 &&
      timezone.minute <= 59;
  }

  function isValidDayOfMonth(date) {
    if (date.day < 1) {
      return false;
    }

    switch (date.month) {
      case 1: // Jan
      case 3: // Mar
      case 5: // May
      case 7: // Jul
      case 8: // Aug
      case 10: // Oct
      case 12: // Dec
        return date.day <= 31;
      case 4: // Apr
      case 6: // Jun
      case 9: // Sep
      case 11: // Nov
        return date.day <= 30;
      case 2: // Feb
        return (date.day === 29) ? isLeapYear(date.year) : date.day <= 28;
      default:
        return false;
    }
  }

  function isLeapYear(year) {
    if (year % 4 !== 0) {
      // The year is not a multiple of 4, so it cannot be a leap year
      return false;
    } else if (year % 100 !== 0) {
      // The year is a multiple of 4 but not a multiple of 100, so it must be a leap year
      return true;
    } else if (year % 400 !== 0) {
      // The year is a multiple of 4 and 100, but it is not a multiple of 400, so it cannot be a leap year
      return false;
    } else {
      // The year is a multiple of 4 and 400, so it must be a leap year
      return true;
    }
  }

  function isSupportedYear(year) {
    // The year must fall within the range specified by the ECMAScript extended year format:
    // https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15.1
    return year >= -283457 && year <= 287396;
  }

  function splitDateAndTime(value) {
    return value.split('T', 2);
  }

  function parseIso8601Time(value) {
    var timePieces = /^(\d{2}):(\d{2})(?:\:(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
    if (timePieces !== null) {
      // The millisecond component has a variable length; normalize the length by padding it with zeros
      var millisecond = timePieces[4] ? parseInt(utils.padRight(timePieces[4], 3, '0'), 10) : 0;

      return {
        hour: parseInt(timePieces[1], 10),
        minute: parseInt(timePieces[2], 10),
        second: timePieces[3] ? parseInt(timePieces[3], 10) : 0,
        millisecond: millisecond
      };
    } else {
      return {
        hour: NaN,
        minute: NaN,
        second: NaN,
        millisecond: NaN
      };
    }
  }

  // Compares the given time strings. Returns a negative number if a is less than b, a positive number if a is greater
  // than b, or zero if a and b are equal.
  function compareTimes(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return NaN;
    }

    var aTime = parseIso8601Time(a);
    var bTime = parseIso8601Time(b);
    if (!isValidTimeStructure(aTime) || !isValidTimeStructure(bTime)) {
      return NaN;
    }

    var aTimePieces = [ aTime.hour, aTime.minute, aTime.second, aTime.millisecond ];
    var bTimePieces = [ bTime.hour, bTime.minute, bTime.second, bTime.millisecond ];
    for (var timePieceIndex = 0; timePieceIndex < aTimePieces.length; timePieceIndex++) {
      if (aTimePieces[timePieceIndex] < bTimePieces[timePieceIndex]) {
        return -1;
      } else if (aTimePieces[timePieceIndex] > bTimePieces[timePieceIndex]) {
        return 1;
      }
    }

    // If we got here, the two parameters represent the same time of day
    return 0;
  }

  function parseIso8601Date(value) {
    var datePieces = /^((?:[+-]\d{6})|(?:\d{4}))(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value);
    if (datePieces !== null) {
      return {
        year: parseInt(datePieces[1], 10),
        month: datePieces[2] ? parseInt(datePieces[2], 10) : 1,
        day: datePieces[3] ? parseInt(datePieces[3], 10) : 1
      };
    } else {
      return {
        year: NaN,
        month: NaN,
        day: NaN
      };
    }
  }

  function extractDateStructureFromDateAndTime(dateAndTimePieces) {
    return (dateAndTimePieces.length > 0) ? parseIso8601Date(dateAndTimePieces[0]) : null;
  }

  function extractTimeStructuresFromDateAndTime(dateAndTimePieces) {
    if (dateAndTimePieces.length <= 1) {
      // Default to midnight UTC since the candidate value represents a date only
      return {
        time: {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        },
        timezone: utcTimeZone
      };
    } else {
      var timeAndTimezoneString = dateAndTimePieces[1];
      var timezoneSeparatorIndex =
        Math.max(timeAndTimezoneString.indexOf('-'), timeAndTimezoneString.indexOf('+'), timeAndTimezoneString.indexOf('Z'));

      var timeString =
        (timezoneSeparatorIndex >= 0) ? timeAndTimezoneString.substr(0, timezoneSeparatorIndex) : timeAndTimezoneString;
      var time = parseIso8601Time(timeString);

      var timezoneString = (timezoneSeparatorIndex >= 0) ? timeAndTimezoneString.substr(timezoneSeparatorIndex) : null;
      var timezone = (timezoneString !== null) ? parseIso8601TimeZone(timezoneString) : null;

      return {
        time: time,
        timezone: timezone
      };
    }
  }

  // Converts the given date representation to a timestamp that represents the number of ms since the Unix epoch
  function convertToTimestamp(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (typeof value === 'number') {
      return Math.floor(value);
    } else if (typeof value === 'string') {
      var dateAndTimePieces = splitDateAndTime(value);

      var date = extractDateStructureFromDateAndTime(dateAndTimePieces);
      if (!isValidDateStructure(date)) {
        return NaN;
      }

      var timeAndTimezone = extractTimeStructuresFromDateAndTime(dateAndTimePieces);
      var time = timeAndTimezone.time;
      var timezone = timeAndTimezone.timezone;
      if (!isValidTimeStructure(time)) {
        return NaN;
      } else if (timezone !== null && !isValidTimeZoneStructure(timezone)) {
        return NaN;
      }

      var timezoneOffsetMinutes = normalizeIso8601TimeZone(timezone);

      var dateAndTime = new Date(0);
      dateAndTime.setUTCFullYear(date.year);
      dateAndTime.setUTCMonth(date.month - 1);
      dateAndTime.setUTCDate(date.day);
      dateAndTime.setUTCHours(time.hour);
      dateAndTime.setUTCMinutes(time.minute - timezoneOffsetMinutes);
      dateAndTime.setUTCSeconds(time.second);
      dateAndTime.setUTCMilliseconds(time.millisecond);

      return dateAndTime.getTime();
    } else {
      return NaN;
    }
  }

  // Compares the given date representations. Returns a negative number if a is less than b, a positive number if a is
  // greater than b, or zero if a and b are equal.
  function compareDates(a, b) {
    var aTimestamp = convertToTimestamp(a);
    var bTimestamp = convertToTimestamp(b);

    if (isNaN(aTimestamp) || isNaN(bTimestamp)) {
      return NaN;
    } else {
      return aTimestamp - bTimestamp;
    }
  }

  function parseIso8601TimeZone(value) {
    if (value === 'Z') {
      return utcTimeZone;
    } else {
      var matches = /^([+-])(\d\d):(\d\d)$/.exec(value);
      if (matches !== null) {
        return {
          multiplicationFactor: (matches[1] === '+') ? 1 : -1,
          hour: parseInt(matches[2], 10),
          minute: parseInt(matches[3], 10)
        };
      } else {
        return {
          multiplicationFactor: NaN,
          hour: NaN,
          minute: NaN
        };
      }
    }
  }

  // Converts an ISO 8601 time zone into the number of minutes offset from UTC
  function normalizeIso8601TimeZone(value) {
    return value ? value.multiplicationFactor * ((value.hour * 60) + value.minute) : -(new Date().getTimezoneOffset());
  }

  // Compares the given time zone representations. Returns a negative number if a is less than b, a positive number if
  // a is greater than b, or zero if a and b are equal.
  function compareTimeZones(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return NaN;
    }

    return normalizeIso8601TimeZone(parseIso8601TimeZone(a)) - normalizeIso8601TimeZone(parseIso8601TimeZone(b));
  }
}
