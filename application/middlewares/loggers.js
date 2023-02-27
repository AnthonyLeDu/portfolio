const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

const errorsLogger = morgan('combined', {
  stream: fs.createWriteStream(path.join(__dirname, '../logs/errors.log'), { flags: 'a' }),
  skip: (req, res) => res.statusCode < 400,
});

const mainLogger = morgan('combined', {
  stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' }),
});

module.exports = {
  errorsLogger,
  mainLogger,
};
