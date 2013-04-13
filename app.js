
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , KloutSkout = require('./lib')
  , csvUtil = require( path.resolve( __dirname, 'util/csv-util.js') )
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
  // to be used when creating read stream for CSV file
  app.set('uploads-path', path.resolve(__dirname + "/public/uploads")) 
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger(app.locals.env === 'production' ? 'tiny' : 'dev' ))
  app.use(express.compress())
  app.use(express.bodyParser({keepExtensions: true, uploadDir: __dirname + "/public/uploads", encoding: 'utf-8'}))
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

app.get('/api/1/getSingleKloutScore', function(req,res,next){

  if(!req.query['twitter-username']) return res.json({message: "Name required.", error: true})

  var name = req.query['twitter-username'].replace(/<(?:.|\n)*?>/gm, '')
    
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

  }) // end getKloutScore

})


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

  }) // end getKloutScore
  
})

app.post('/api/1/getBatchKloutScoreCsv', function(req,res,next){
  
  var csv = req.files['csv-file']

  // File is uploaded to /public/uploads dir

  var rStream = fs.createReadStream( csv.path, {encoding: 'utf-8'} )
    , outerdata = ''
    ;

  rStream.on('readable', function readStreamReadableCb(){
    while (data = rStream.read()){
      if(data) outerdata += data
    }
  })

  rStream.on('end', function readStreamEndCb(){

    var usernamesArray = csvUtil.getArrayFromCsv(outerdata)

    // First, create array of Klout URLS.
    // Klout only allows for up to 99 usernames in one request...

    var urls = KloutSkout.getKloutUrls(usernamesArray)

    // return console.dir(urls)

    KloutSkout.getKloutScores(urls,function getKloutScoresCb(err, data){

      // We set this up first...
      var json = {
        scores: null,
        message: "There was some sort of error. Please try again", 
        error: true
      }

      // If no error, then change that shit, B
      if(!err) {
        json.scores = data
        json.message = "Here are the Klout Scores."
        json.error = false
       }
      
      return res.json(json)

    }) // end getKloutScores()

  }) // end end()

})

// Fire up server...
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})