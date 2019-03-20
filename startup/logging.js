const { format, configure, transports } = require('winston');
const { Console, File } = transports;
const { combine, simple, prettyPrint, colorize } = format;

require('express-async-errors');

module.exports = () => {
  process.on('unhandledRejection', ex => {
    throw ex;
  });

  configure({
    format: combine(prettyPrint({ colorize: true }), colorize()),
    transports: new Console({ level: 'info', format: simple() }),
    exceptionHandlers: [
      new Console({ format: simple() }),
      new File({ filename: 'uncaught.log' })
    ]
  });
};
