var async = require('async')
  , _ = require('lodash')
  , request = require('request')
  , kloutUrl =  'http://api.klout.com/v2/users.json/score/twitter/batch?key='+
                  'vuengndhgrbawsxh6g5ycgs3&handles={handles}'

// ^^^Ripped directly from Klout Chrome Extension \m/


// Takes an array of objects and returns
// on large object
function _flattenScores(scores){
  var ret = {}
  scores.forEach(function(el,i){
    ret = _.merge(ret,el)
  })
  return ret
}

// Helper method to get klout scores by batching less than
// 99 names at a time...to be used recursively...
module.exports.getKloutUrls = function getKloutUrls(handles, arrayOfTwitterNames, num){

  var set = _.first(handles, num || 99)
    , arrayOfTwitterNames = arrayOfTwitterNames || []
    , remaining
    ;

  // console.dir(set) 

  // We now create a string of 'foo,bar,baz' twitter usernames
  var twitterHandles = set.join(',')

  var url =  kloutUrl.replace('{handles}', twitterHandles )

  // Add to array...
  arrayOfTwitterNames.push(url)
  
  // If there isn't a num, then we aren't on the last pass of recursive calls...
  if(!num){
    remaining = _.rest(handles, num || 99)
  }
  else remaining = [] // Important for the last round
  
  // If there are more than 98, then we have more rounds to go
  // If there are less than 99, then this is the last round
  if(remaining.length > 98) return getKloutUrls(remaining, arrayOfTwitterNames)
  else if(remaining.length && remaining.length < 99 ) return getKloutUrls(remaining, arrayOfTwitterNames, remaining.length)
  else return arrayOfTwitterNames
  
}

module.exports.getKloutScore = function(username, cb){

  var url = kloutUrl.replace('{handles}', username )

  request.get(url, function(e,r,b){
    if(e){
      console.log("Error with url: " + url)
      console.error(e)
      count++
      cb(e)
    }
    else{
      if( cb && typeof cb === 'function' ){
        if(!b) return cb( new Error('No score for this user') )
        cb( null, JSON.parse(b) ) 
      }
   } // end else
  })
} // end getKloutScore

// A method that cycles through an array of urls
// and builds an array of Klout scores 
module.exports.getKloutScores = function(arrayOfKloutUrls, cb){

  var len = arrayOfKloutUrls.length
    , count = 0
    , scores = [] 

  // We need to do this many times depending 
  // on number urls in arrayOfKloutUrls
  async.whilst(
    function (){ return count < len },
    function (callback) {

      var url = arrayOfKloutUrls[count]

      request.get(url, function(e,r,b){
        if(e){
          console.log("Error with url: " + url)
          console.error(e)
          count++
        }
        else{
          scores.push( JSON.parse(b) )
          count++
          // Do it again
          callback()
        }
      })
    },
    function (err){
      cb && typeof cb === 'function' && cb(err,scores)
    }
  ) // end whilst()

} // end stash
