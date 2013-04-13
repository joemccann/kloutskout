var async = require('async')
  , _ = require('lodash')
  , request = require('request')
  , kloutUrl =  'http://api.klout.com/v2/users.json/score/twitter/batch?key='+
                  'vuengndhgrbawsxh6g5ycgs3&handles={handles}'


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

  var handles = set.join(',')

  // Ripped directly from Klout Chrome Extension \m/
  var url =  kloutUrl.replace('{handles}', handles )

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
    else {
      if(!b) return cb( new Error('No score for this user') )
      cb(null,JSON.parse(b))
    }
    })
} // end getKloutScore

// A method that cycles through an array of urls
// and builds an array of Klout scores 
module.exports.getKloutScores = function(arrayOfTwitterNames, cb){

  var len = arrayOfTwitterNames.length
    , count = 0
    , scores = [] 

  // We need to do this many times depending on number urls in arrayOfTwitterNames
  async.whilst(
      function (){ return count < len },
      function (callback) {
        var url = arrayOfTwitterNames[count]
        console.log(url)
        request.get(url, function(e,r,b){
          if(e){
            console.log("Error with url: " + url)
            console.error(e)
            count++
          }
          else{
            scores.push(JSON.parse(b))
            count++
            // Do it again
            callback()
          }
        })
      },
      function (err){
        cb && cb(err,scores)
      }
  ) // end whilst()

} // end stash

module.exports.addKloutScoreToSet = function(signups, handles, scores){
  
  scores = _flattenScores(scores)

  // TODO: this should be radically improved to be faster...
  // So, grab a handle ('el')
  handles.forEach(function(el,i){

    // Cycle through all signups to find a match...
    signups.forEach(function(elem,index){

      // If we find a matching twitter handle...
      if(elem.twitter && elem.twitter === el){
        // Then add the klout key and value to the *actual*
        // object, not the 'elem' instance.
        signups[index].klout = scores[el] ? scores[el].score : 0
      }
      
    }) // end signups forEach
    
  }) // end handles forEach
  
  return signups
}
