var express = require('express'),
    path = require('path');

var app = express();

// initialize app settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    console.log('running app');
    console.log('test');
    res.render('index');
});


app.listen(app.get('port'), function() {
    console.log('Tic-Tac-Toe is running on port ' + app.get('port'));
});
