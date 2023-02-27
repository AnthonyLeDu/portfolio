const express = require('express');
const { errorsLogger, mainLogger } = require('./middlewares/loggers');
require('dotenv').config();

const app = express();
app.use(errorsLogger);
app.use(mainLogger);
app.use(express.static('public'));

app.set('port', process.env.PORT || 3000);
app.set('base_url', process.env.BASE_URL);

app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('base_url')}:${app.get('port')}`);
});
