// Userlist data array for filling in info box
var userListData = [];

// Fill table with data


function populateTable(id,arrayGivenBy) {
    
    // Empty content string
    //     var tableContent = '';
    var divContent = '';
    
    // jQuery AJAX call for JSON
    $.getJSON( '/question/explainlist?id='+ id, function( data ) {
              
              // Stick our user data array into a userlist variable in the global object
              userListData = data;
              console.log("givenByIds are as " + arrayGivenBy);
              console.log("the data is " + data);
              console.log(data);
              console.log(userListData);
              // For each item in our JSON, add a table row and cells to the content string
              $.each(userListData, function(){
                     divContent += '<div class="explainList" id = ' + this.givenById + '>';
                     divContent += '<h5 style="display:inline-block">' + this.givenByName/*TODO: Change to Username of student who gave this explanation*/ + '</h5> said:<br/>';
                     this.text=this.text.replace(/\n/g, "<br />");
                     console.log("ArrayGivenBy "+arrayGivenBy+" and givenById "+this.givenById);
                     upvoted=(arrayGivenBy.indexOf(this.givenById)<0?'likeButton':'unlikeButton');
                     votetext=(arrayGivenBy.indexOf(this.givenById)<0?'Vote':'Unvote');
                     
                     
                     divContent += '' + this.text + '<br/>';
                     divContent += '<div style="margin-top:8px">';
                     divContent += '' + '<button type="button" class = "'+upvoted+'" id = "'+upvoted+'" rel=' + this.givenById +'>'+votetext+'</button> '+'<div id ="noUpVotes" style="display:inline-block;margin-left:8px;">' + this.noUpVotes +'</div>';
                     
                     
                     divContent += '<hr></div></div></div>';
                     });
              
              
              
              
              // Inject the whole content string into our existing HTML table
              $('#voteList').append(divContent);
              $('.likeButton').on('click',voteExp);
              $('.unlikeButton').on('click',voteExpDec);
              
              $( ".explainList" ).each(function( index ) {
                                       if(index>=numExplains)
                                       $(this).hide();
                                       });
              
              if(numExplains>=$(".explainList").length)
              $("#btnShowMore").attr("disabled",true);
              });
>>>>>>> d69818daa13f759b35257aff76d0f0f5bcf1a1f8
}

function voteExp() {
    $(this).removeClass('likeButton');
    $(this).addClass('unlikeButton');
    $(this).unbind('click', voteExp );
    $(this).on('click',voteExpDec);
    $(this).text('Unvote');
    var id = $(this).attr('rel');
    console.log("id" + id);
    console.log("current value" + $('#voteList #'+ id + ' #noUpVotes').html());
    var i = parseInt($('#voteList #'+ id + ' #noUpVotes').html());
    $('#voteList #'+ id + ' #noUpVotes').html(i+1);
    updateExp(id);
}

function voteExpDec() {
    $(this).removeClass('unlikeButton');
    $(this).addClass('likeButton');
    $(this).unbind('click', voteExpDec );
    $(this).on('click',voteExp);
    $(this).text('Vote');
    var id = $(this).attr('rel');
    console.log("id" + id)
    console.log("current value" + $('#voteList #'+ id + ' #noUpVotes').html());
    var i = parseInt($('#voteList #'+ id + ' #noUpVotes').html());
    $('#voteList #'+ id + ' #noUpVotes').html(i-1);
    updateExpDec(id);
}

function updateExp(givenBy){
    
    
    var Explain = {
        'Qid': qid,
        'givenBy' : givenBy
    };
    console.log("explain is updateExp " + Explain);
    console.log(Explain);
    // Use AJAX to post the object to our adduser service
    $.ajax({
           type: 'POST',
           data: Explain,
           url: '/question/explainUpdate',
           dataType: 'JSON'
           }).done(function( response ) {
                   if (response.msg === '') {
                   console.log("Updated successful");
                   }
                   });
    
}

function updateExpDec(givenBy){
    
    
    var Explain = {
        'Qid': qid,
        'givenBy' : givenBy
    };
    console.log("explain is updateExp " + Explain);
    console.log(Explain);
    // Use AJAX to post the object to our adduser service
    $.ajax({
           type: 'POST',
           data: Explain,
           url: '/question/explainUpdateDec',
           dataType: 'JSON'
           }).done(function( response ) {
                   if (response.msg === '') {
                   console.log("Updated successful");         
                   }
                   });
    
}




// DOM Ready =============================================================
$(document).ready(function() {
                  
                  $('[data-toggle="tooltip"]').tooltip();
                  populateTable(qid,arrayGivenBy);
                  //var getQuestion = <%= Question %>
                  
                  console.log("inside js");    
                  //     $('#upvote').on('click',showMsg);
                  
                  
});

