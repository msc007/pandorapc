const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(url) {
  const user = "pandorapcparts@gmail.com";
  const pass = "ughlscdwdnhrwrcp";

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass
    }
  });

  console.log("Transporter created successfully");

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"PandoraPC" <${user}>`,
    to: "tl492@hotmail.com", // list of receivers
    subject: "Ryzen CPU deal is arrived!",
    text: `The Price of ${url} fell down Check it out!!`
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports.sendEmail = sendEmail;
