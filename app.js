require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const app = express();

var name, email, contact, amount;

const razorpay = new Razorpay({
    key_id: "rzp_test_0GnYME0C4w8jeV",
    key_secret: "nQcSFX73S37NRwOgtDJysvNv"
});

app.set("views", "views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }))


app.route("/").get(function(req, res){
    res.render("index.ejs");
});

app.route("/donate").post(function(req, res){
    console.log("donate");
    name = req.body.name;
    email = req.body.email;
    contact = req.body.mobileNumber;
    amount = req.body.amount;
    console.log(name, email, contact, amount);



    // res.redirect("/order");
});

app.route("/order").post(function(req, res){
    console.log(req.body);
    var options = {
        amount: amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        prefill: {
            "name": name,
            "email": email,
            "contact": contact
        }
      };
      razorpay.orders.create(options, function(err, order){
          if(err){
              console.log(err);
          }
          console.log(order);
          res.json(order);
      });
});

app.route("/payment-status").post(function(req, res){
    razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
        console.log(paymentDocument);
        if(paymentDocument.status == "captured"){
            res.render("thankyou.ejs", {title: "Thank you for donating.", message: "Have a good day."});
            async function main() {
                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
                let testAccount = await nodemailer.createTestAccount();
              
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                  host: "smtp.ethereal.email",
                  port: 587,
                  secure: false, // true for 465, false for other ports
                  auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                  },
                });
              
                // send mail with defined transport object
                let info = await transporter.sendMail({
                  from: '"Fred Foo 👻" <foo@example.com>', // sender address
                  to: "gawanderamanshu@gmail.com", // list of receivers
                  subject: "Hello ✔", // Subject line
                  text: "Hello world?", // plain text body
                  html: "<b>Hello world?</b>", // html body
                });
              
                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
              
                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
              }
              
              main().catch(console.error);

        }
        else{
            res.render("thankyou.ejs", {title: "Error Occured", message: "Please, try again."});
        }
    })
});

app.listen("3000", function(){
    console.log("Server is running at port 3000.");
});