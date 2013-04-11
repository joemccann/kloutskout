
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , KloutSkout = require('./lib')
  ;

var app = express()

app.configure(function(){
  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "KloutSkout"
  app.locals.description = "KloutSkout"
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  
  app.set('port', process.env.PORT || 3500)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger(app.locals.env === 'production' ? 'tiny' : 'dev' ))
  app.use(express.compress())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))

  // Do this last so the above logic isn't for naught
  app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function(){
  app.use(express.errorHandler());
})

app.get('/', routes.index)

app.post('/api/1/getSingleKloutScore', function(req,res,next){
  
  var name = req.body['twitter-username'].replace(/<(?:.|\n)*?>/gm, '')
  
  if(!name) return res.json({message: "Name required.", error: true})
    
  KloutSkout.getKloutScore(name, function getKloutScoreCb(err,data){
    // data is a json object

    // We set this up first...
    var json = {
      username: name,
      message: "There was some sort of error. Please try again", 
      error: true
    }

    // If no error, then change that shit, B
    if(!err) {
      json.message = data[name].score
      json.error = false
     }

    return res.json(json)

  })
  
})

// Fire up server...
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})