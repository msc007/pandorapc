const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(url, item) {
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

  //send deal notification to the subscribers
  let info = await transporter.sendMail({
    from: `"PandoraPC" <${user}>`,
    to: `${item.subscribers.join()}`, // list of receivers
    subject: `${item.name} now on sale!!`,
    text: `${item.name} price dropped, you can check out at: \n ${url}`
  });
  


  console.log("Message sent: %s", info.messageId);
}

module.exports.sendEmail = sendEmail;
