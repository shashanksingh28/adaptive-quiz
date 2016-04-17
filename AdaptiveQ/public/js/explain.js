// Userlist data array for filling in info box
var userListData = [];

// Fill table with data


function populateTable(id) {

    // Empty content string
//     var tableContent = '';
    var divContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/question/explainlist?id='+ id, function( data ) {

        // Stick our user data array into a userlist variable in the global object
        userListData = data.explainations;
        console.log(userListData);
        // For each item in our JSON, add a table row and cells to the content string
        $.each(userListData, function(){

            // tableContent += '<tr id = ' + this.givenBy + '>';
//             tableContent += '<td>' + this.givenBy + '</td>';
//             tableContent += '<td>' + this.text + '</td>';
//             tableContent += '<td id ="noUpVotes">' + this.noUpVotes +'</td>';
//             tableContent += '<td>' + '<button type="button" class = "likeButton" id = "likeButton" rel=' + this.givenBy +'>Click Me!</button> '+'</td>';
//             tableContent += '</tr>';
			divContent += '<div id = ' + this.givenBy + '>';
            divContent += '<h5>' + this.givenBy/*TODO: Change to Username of student who gave this explanation*/ + '</h5>';
            divContent += '' + this.text + '';
            divContent += '<div id ="noUpVotes">' + this.noUpVotes +'</div>';
            divContent += '' + '<button type="button" class = "likeButton" id = "likeButton" rel=' + this.givenBy +'>Click Me!</button> '+'';
            divContent += '</div>';
        });

        // Inject the whole content string into our existing HTML table
//         $('#userList').append(tableContent);
		$('#voteList').append(divContent);
        $('.likeButton').on('click',voteExp);
    });
}

function voteExp() {
var id = $(this).attr('rel');
console.log("id" + id)
console.log("current value" + $('#voteList #'+ id + ' #noUpVotes').html());
var i = parseInt($('#voteList #'+ id + ' #noUpVotes').html());
$('#voteList #'+ id + ' #noUpVotes').html(i+1);
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
//     $('#upvote').on('click',showMsg);
    

});

