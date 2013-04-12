$(document).ready(function(){
  
  log('Ready...')
  
  // Global
  window.KS = {position:null, hasTouch:true}
  
  // Check for touch events (note: this is not exhaustive) and thanks to the Surface
  // and the Chromebook Pixel
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.documentElement.className = "no-touch"
    KS.hasTouch = false
  } 

  /* Handle Signup Form ****************************************/
  
  var $getSingleScoreForm = $('#get-single-score-form')
    , $singleScoreButton = $('#single-score-button')

  function strip(html){
     var tmp = document.createElement("div")
     tmp.innerHTML = html
     return tmp.textContent || tmp.innerText
  }
    
  if($getSingleScoreForm.length){
    
    var connectHandler = function(e){

      $singleScoreButton.attr('disabled', true).addClass('opacity75')
      
      $('.error').removeClass('error')
      
      var $inputName = $('input[type="name"]')
      
      // Sanitize...
      $inputName.val( strip( $inputName.val() ) ) 

      // Validate inputs
      if( !$inputName.val().length ){
        log('Bad name.')
        $inputName
          .val('')
          .addClass('error')
          .focus()
        
        $singleScoreButton.removeAttr('disabled').removeClass('opacity75')
          
        return false
        
      }       
      
      
      $.post( $getSingleScoreForm.attr('action'), $getSingleScoreForm.serialize(), function(resp){
        
        // This is a weird delta between zepto and jquery...
        var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
        
        log(r)
        
        $getSingleScoreForm.find('input, textarea').val('')
        
        $singleScoreButton.removeAttr('disabled').removeClass('opacity75').blur()
        
        var responseMessageClass = r.error ? "failed-submission" : "successful-submission"
        
        $('#single-score-response-container').find('p').remove()

        var message;

        if(r.error){
          message = '<p class="'+ responseMessageClass 
                      +'">Ruh-roh, looks like something went awry or this user has no score.</p>'
        }
        else{
          message = '<p class="'+ responseMessageClass +'">Klout Score for '
          +r.username
          +' is: <strong>'
          +Math.round(r.message)+'</strong></p>'
        }
        
        $('#single-score-response-container').append(message)
        
      }) // end post
      
      return false
      
    }
    
    $singleScoreButton.on('click', function(e){
      connectHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $getSingleScoreForm.on('submit', function(e){
      connectHandler(e)
      e.preventDefault()
      return false

    }) // end KSmit()
    
  }

  /* End Signup Form *******************************************/
  
})
