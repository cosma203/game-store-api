const bodyParser = require('body-parser');

const { gamesRouter } = require('../routes/games');
const { consolesRouter } = require('../routes/consoles');
const { genresRouter } = require('../routes/genres');
const { usersRouter } = require('../routes/users');
const { rentalsRouter } = require('../routes/rentals');
const { returnsRouter } = require('../routes/returns');

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use('/api/games', gamesRouter);
  app.use('/api/consoles', consolesRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/rentals', rentalsRouter);
  app.use('/api/returns', returnsRouter);
};
