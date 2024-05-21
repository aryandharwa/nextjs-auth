import User from '@/models/userModel';
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';

export const sendEmail = async({email, emailType, userId} :any) => {
    try {

        const hashedToken = await bcryptjs.hash(userId.toString(), 10 )

        if(emailType === 'VERIFY') {
            //send verification email
            await User.findByIdAndUpdate
            (userId, {
              $set: {
                verificationToken: hashedToken,
                verificationTokenExpire: Date.now() + 3600000,
              }
            });

        } else if (emailType === 'RESET') {
            await User.findByIdAndUpdate
            (userId, { 
              $set: {
                forgotPasswordToken: hashedToken,
                  forgotPasswordTokenExpire: Date.now() + 3600000,
                
            }
          })      
        }

        var transport = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "fec1b6f0dfc359",
            pass: "b60b9f0a03643f"
          }
        });


          const mailOptions = {
            from: 'aryan@dharwa.com', // sender address
            to: email, // list of receivers
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password", // Subject line
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} 
            or copy and paste the link below in your browser.
            <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`, // html body
          };

          const mailResponse = await transport.sendMail(mailOptions)
          return mailResponse


    } catch (error: any) {
        throw new Error(error.message)
    }
}