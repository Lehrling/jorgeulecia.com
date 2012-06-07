var express = require('express');
var fs = require("fs")
var nodemailer = require("nodemailer");



// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Formulario de contacto - jorgeulecia.com ✔ <jorge.ulecia.actor@gmail.com>", // sender address
    to: "damianmerino@gmail.com", // list of receivers
    subject: "Mensaje web ✔" // Subject liney
}

// send mail with defined transport object
function sendEmail (body) {

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "jorge.ulecia.actor@gmail.com",
        pass: "contacto!"
    }
});

mailOptions.text = body;

	smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    
    smtpTransport.close();
});}


var app = express.createServer(express.logger());
var pubDir = __dirname + "/../public/";
var index = fs.readFileSync(pubDir + "index.html");
var thankYou = fs.readFileSync(pubDir + "thankyou.html");
app.use(express.bodyParser())
app.use(express.static(pubDir))
app.get("/", function(request, response) {
	response.setHeader("Content-Type", "text/html")
	response.send(index);
});
app.post("/contact", function(request, response) {

	var name = request.body.nombre;
	var email = request.body.email;
	var subject = request.body.asunto;
	var message = request.body.mensaje;

	var body = "\r\n" + "Formulario de contacto recibido a traves de jorgeulecia.com - Este mensaje ha sido generado automaticamente" + "\r\n" + "Nombre: " + name + "\r\n" + "Email: " + email + "\r\n" + "Asunto: " + subject + "\r\n" + "Mensaje: "  + message;
	sendEmail(body)

	response.setHeader("Content-Type", "text/html")
	response.send(thankYou);

});

var port = process.env.PORT || 80;
app.listen(80, "dev.jorgeulecia.com");

