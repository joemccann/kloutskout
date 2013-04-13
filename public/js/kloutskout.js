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

  /* Handle Single Username Form ****************************************/
  
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

  /* End Single Username Form *******************************************/

  /* Handle CSV File Form ****************************************/
  
  var $uploadCsvForm = $('#upload-csv-form')
    , $uploadCsvButton = $('#upload-csv-button')

  $('input[type="file"]').change(function(){
      var file = this.files[0]
      if( file.type !== 'text/csv' ) return alert('This is not a CSV file!')
      //your validation
  });
    
  if($uploadCsvForm.length){
    
    var uploadCsvHandler = function(e){

      $uploadCsvButton.attr('disabled', true).addClass('opacity75')
      
      $('.error').removeClass('error')
      
      var $inputCsvFile = $uploadCsvForm.find('input[type="file"]')

      // Validate inputs
      if( !$inputCsvFile.val().length ){
        log('No File.')
        $inputName
          .val('')
          .addClass('error')
          .focus()
        
        $uploadCsvButton.removeAttr('disabled').removeClass('opacity75')
          
        return false
        
      }       

      var fileData = $('input[type="file"]')[0].files[0]
        , uploadUrl = $uploadCsvForm.attr('action')

      uploadFiles(uploadUrl, fileData)

      return false

      function uploadFiles(url, fileData){

        var formData = new FormData();

        formData.append('csv-file', fileData)

        var xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)

        xhr.onreadystatechange = function(e){
          if (this.readyState === 4 && this.status === 200){
            var resp = this.responseText
            var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
            log(r)
            
            $uploadCsvForm.find('input, textarea').val('')
            
            $uploadCsvButton.removeAttr('disabled').removeClass('opacity75').blur()
            
            var responseMessageClass = r.error ? "failed-submission" : "successful-submission"
            
            $('#csv-form-response-container').find('p').remove()

            var message;

            if(r.error){
              message = '<p class="'+ responseMessageClass 
                          +'">Ruh-roh, looks like something went awry or this user has no score.</p>'
            }
            else{

              var usernames = Object.keys( r.scores[0] )

              message = '<p class="'+ responseMessageClass +'">Total Number of Scores: '
              + usernames
              +'</p>'
            }
            
            $('#csv-form-response-container').append(message)

          }
          else{
            log(e)
          }

        } // end onreadstatechange

        xhr.onload = function(e,resp){
          log('onloaded...')
        }

        xhr.send(formData)
    
    } // end uploadfiles

  } // end uploadCsvHandler
    
    $uploadCsvButton.on('click', function(e){
      uploadCsvHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $uploadCsvForm.on('submit', function(e){
      uploadCsvHandler(e)
      e.preventDefault()
      return false

    }) // end KSmit()
    
  }

  
})
