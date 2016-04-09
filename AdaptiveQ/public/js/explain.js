// Userlist data array for filling in info box
var userListData = [];

// Fill table with data


function populateTable(id) {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/question/explainlist?id='+ id, function( data ) {

        // Stick our user data array into a userlist variable in the global object
        userListData = data.explainations;
        console.log(userListData);
        // For each item in our JSON, add a table row and cells to the content string
        $.each(userListData, function(){

            tableContent += '<tr id = ' + this.givenBy + '>';
            tableContent += '<td>' + this.givenBy + '</td>';
            tableContent += '<td>' + this.text + '</td>';
            tableContent += '<td id ="noUpVotes">' + this.noUpVotes +'</td>';
            tableContent += '<td>' + '<button type="button" class = "likeButton" id = "likeButton" rel=' + this.givenBy +'>Click Me!</button> '+'</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList').append(tableContent);
        $('.likeButton').on('click',voteExp);
    });
}

function voteExp() {
var id = $(this).attr('rel');
console.log("id" + id)
console.log("current value" + $('#userList #'+ id + ' #noUpVotes').html());
var i = parseInt($('#userList #'+ id + ' #noUpVotes').html());
$('#userList #'+ id + ' #noUpVotes').html(i+1);
updateExp(id)

}

function updateExp(givenBy){


    var Explain = {
            'Qid': qid,
            'givenBy' : givenBy 
        };

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
// DOM Ready =============================================================
$(document).ready(function() {
    populateTable(qid)
    //var getQuestion = <%= Question %>

    console.log("inside js");    
    $('#upvote').on('click',showMsg);
    

});

