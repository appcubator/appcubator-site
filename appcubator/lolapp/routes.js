// Routes

// TODO import stuff needed by routes here.
// like packages, modules, models.
//

function bindTo(app) {
  app.get('/', function (req, res) {
    res.send('Blank app');
  });
}

exports.bindTo = bindTo;
