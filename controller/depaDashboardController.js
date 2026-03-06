const { depaDashboardService } = require('../services/depaDashboardService');

const DATETIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

function isValidDateTimeString(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(DATETIME_PATTERN);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day &&
    parsed.getUTCHours() === hour &&
    parsed.getUTCMinutes() === minute &&
    parsed.getUTCSeconds() === second
  );
}

async function snapshot(request, reply) {
  try {
    const { time_start: timeStart, time_end: timeEnd } = request.query || {};

    if (timeStart && !isValidDateTimeString(timeStart)) {
      return reply.code(422).send({
        message: 'Invalid time_start format. Expected YYYY-MM-DD HH:mm:ss',
      });
    }

    if (timeEnd && !isValidDateTimeString(timeEnd)) {
      return reply.code(422).send({
        message: 'Invalid time_end format. Expected YYYY-MM-DD HH:mm:ss',
      });
    }

    if (timeStart && timeEnd && timeStart > timeEnd) {
      return reply.code(422).send({
        message: 'time_start must be less than or equal to time_end',
      });
    }

    const data = await depaDashboardService.getDashboardSnapshot(
      request.server.db,
      timeStart,
      timeEnd
    );

    return reply.send({ data });
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
}

module.exports.depaDashboardController = { snapshot };
