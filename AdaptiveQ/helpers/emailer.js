var express = require('express');
var nodemailer = require('nodemailer');
var moment = require('moment-timezone');
var timezone = "AMERICA/Phoenix";

var smtpTransport = nodemailer.createTransport('SMTP',{
	service: 'Gmail',
	auth: {
		user: 'adapt.q',
		pass: 'quizoftheday'
	}
});

var footer = '<br>--<br><font size="0.6em">AdaptQ is one of the CS educational technologies created by '
+'<a href="https://sites.google.com/a/asu.edu/csi/" target="_blank">CSI Lab</a> of '
+'<a href="http://cidse.engineering.asu.edu/" target="_blank">School of Computing, Informatics & Decision Systems Engineering</a> at '
+'<a href="http://www.asu.edu/" target="_blank">Arizona State University</a> </font>';

var sendQuestion = function (hostname,fromEmail,toList,bccList,questionId,questionConcept, callback){
	var mailOptions = {
		from : fromEmail,
		to : toList,
		bcc : bccList,
		subject : 'Question of the day',
		html : 'Hello there! <br><br> Here is your question of the day! Best of Luck! <br><br>'
			+ " Quiz of the day : " + moment.tz(timezone).format('MMM D, YYYY') + "<br><br>"
			+ "Topic : <b>" + questionConcept + "</b><br><br>"
			+ "<b><a href='" + hostname + "/question?id=" + questionId + "'>Attempt Question</a></b>"
			+ "<br><br>" + footer
	}
	//console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function(error, response){
		console.log(response);
		if(error){
			callback(error, message);
		}
		else{
			callback(error, response.message);
		}
	});
}

var sendResetPasswordLink = function(fromEmail, toEmail, uri, callback){
	var mailOptions = {
		from : fromEmail,
		to : toEmail,
		subject : 'Reset your AdaptQ password',
		html : 'Hello there! <br><br> To set a new password, click on the link below:<br>'
		+ '<a href="'+uri+'"> Your custom reset link</a>'
		+ '<br><br>' + footer
	}
	//console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function(error, response){
		console.log(response);
		if(error){
			callback(error, message);
		}
		else{
			callback(error, response.message);
		}
	});
};

module.exports.sendQuestion = sendQuestion;
module.exports.sendResetPasswordLink = sendResetPasswordLink;
