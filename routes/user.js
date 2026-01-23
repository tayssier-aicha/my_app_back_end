const express=require('express'); 
const router=express.Router(); 
const User=require('../models/user'); 
const bcrypt=require('bcrypt'); 
const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const nodemailer=require('nodemailer');

async function sendVerificationEmail(email, token, subject = 'Verify Your Email', isNew = false) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verifyUrl = `${process.env.VERIFY}${token}`;

    //email template
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; color: #1f2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="480" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                                <h1 style="margin:0; font-size: 28px; color: white; font-weight: 600;">
                                    ${isNew ? 'Confirm Your New Email' : 'Welcome! Verify Your Email'}
                                </h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px 30px;">
                                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
                                    Hello,
                                </p>
                                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
                                    ${isNew 
                                        ? 'You recently updated your email address. To complete the change and keep your account secure, please confirm your new email.' 
                                        : 'Thank you for signing up! Please verify your email address to activate your account and get started.'}
                                </p>
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${verifyUrl}" 
                                       target="_blank" 
                                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); transition: all 0.2s;">
                                        Verify Email Address
                                    </a>
                                </div>
                                <p style="font-size: 15px; line-height: 1.5; color: #6b7280; margin: 0 0 20px; text-align: center;">
                                    If the button above doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="font-size: 14px; color: #4b5563; word-break: break-all; text-align: center; margin: 0 0 32px; background: #f1f5f9; padding: 12px; border-radius: 8px;">
                                    <a href="${verifyUrl}" style="color: #6366f1; text-decoration: underline;">${verifyUrl}</a>
                                </p>
                                <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin: 0;">
                                    This link will expire in 24 hours for security reasons.<br>
                                    If you didn't request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background: #f8fafc; padding: 24px 30px; text-align: center; font-size: 13px; color: #9ca3af;">
                                <p style="margin: 0 0 8px;">
                                    © ${new Date().getFullYear()} Lost & Founs — All rights reserved.
                                </p>
                                <p style="margin: 0;">
                                    You're receiving this because you signed up / updated your email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    await transporter.sendMail({
        from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html
    });
};

async function sendPasswordResetEmail(email, plainResetToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ← App Password if 2FA is on
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${plainResetToken}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f7fa;color:#1f2937;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
      <tr><td align="center">
        <table width="100%" max-width="480" border="0" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, #6366f1, #8b5cf6);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:white;font-weight:600;">Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px;">Hello,</p>
              <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px;">
                You requested to reset your password for your Lost & Found account.<br>
                Click the button below to set a new password:
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" target="_blank"
                   style="display:inline-block;background:linear-gradient(135deg, #6366f1, #8b5cf6);color:white;font-size:16px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:12px;box-shadow:0 4px 14px rgba(99,102,241,0.3);">
                  Reset Password
                </a>
              </div>
              <p style="font-size:14px;color:#6b7280;margin:0 0 20px;text-align:center;">
                Or copy and paste this link:<br>
                <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
              </p>
              <p style="font-size:14px;line-height:1.5;color:#6b7280;margin:0;">
                This link will expire in <strong>60 minutes</strong> for security reasons.<br>
                If you did not request a password reset, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:24px 30px;text-align:center;font-size:13px;color:#9ca3af;">
              © ${new Date().getFullYear()} Lost & Found — All rights reserved
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Lost & Found',
    html,
  });
}


// Add a new user 
router.post('/add', async (req, res) => {
    try {
        const data = req.body;
        const email_exist = await User.findOne({ email: data.email });

        if (email_exist) {
            return res.status(409).send("Email already exists");
        }

        const token = crypto.randomBytes(32).toString('hex');

        const usr = new User(data);

        usr.verificationtoken = token;
        usr.isVerified = false; 

        // Hash password
        const salt = await bcrypt.genSalt(10);
        usr.password = await bcrypt.hash(data.password, salt);

        await sendVerificationEmail(usr.email, token, 'Verify Your Email');

        await usr.save();

        res.status(201).send("Verification email sent. Please check your inbox.");

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user", error: err.message });
    }
});

// Verify with URL
router.get('/verify/:token',async(req,res)=>{
    try{
        const token=req.params.token;
        const user=await User.findOne({verificationtoken:token});
        if(!user){
            res.status(400).send("Invalid token");
        }
        else{
            user.isVerified=true;
            user.verificationtoken=undefined;
            await user.save();
            res.status(200).send("Email verified successfully");
            
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

 //login user 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).send("Invalid email or password");
        }

        // if not verified → resend email
        if (!user.isVerified) {
            const newToken = crypto.randomBytes(32).toString('hex');
            user.verificationtoken = newToken;
            await user.save();

            await sendVerificationEmail(
                user.email,
                newToken,
                'Please Verify Your Email',
                false
            );

            return res.status(403).json({
                message: "Email not verified. We sent you a new verification link. Please check your inbox (including spam).",
                success: false
            });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            res.status(401).send("Invalid email or password");
        }

        const payload = {
            _id: user._id,
            email: user.email,
            isVerified: user.isVerified,
            name:user.name
            // Avoid sending password or sensitive data
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: "Login successful",
            user: payload,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


// ────────────────────────────────────────────────
//                   FORGOT PASSWORD
// ────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security: always return same message (timing attack prevention)
    if (!user || !user.isVerified) {
      return res.status(200).json({
        success: true,
        message:
          'If an account with this email exists and is verified, you will receive a password reset link shortly.',
      });
    }

    // Generate secure token
    const resetTokenPlain = crypto.randomBytes(32).toString('hex');
    const resetTokenHashed = crypto
      .createHash('sha256')
      .update(resetTokenPlain)
      .digest('hex');

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 60 minutes

    await user.save({ validateBeforeSave: false });

    // Send email with **plain** token (user gets the usable version)
    await sendPasswordResetEmail(user.email, resetTokenPlain);

    return res.status(200).json({
      success: true,
      message:
        'If an account with this email exists and is verified, you will receive a password reset link shortly.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
});


router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, passwordConfirm } = req.body;

    if (!token || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Token and both password fields are required',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// Get all users 
router.get('/getall',async(req,res)=>{ 
    try{ 
       const users=await User.find();
        res.status(200).send(users);
   } 
    catch(err){ 
        res.status(400).send(err);    
}
}); 

// Get user by ID 
router.get('/get/:id',async(req,res)=>{ 
    try{ 
        const id=req.params.id; 
        const users=await User.findOne({_id:id}); 
        res.status(200).send(users); 
    }
    catch(err){ 
        res.status(400).send(err); 
    } 
}); 

// Update user by ID 
router.put('/update/:id',async(req,res)=>{
    try{ 
        const id=req.params.id; 
        const data=req.body;  
        const existUser=await User.findById({_id:id});
        if(!existUser){
            res.status(404).send("user not found");
        }
        else{
            if(data.password){
                const salt=bcrypt.genSaltSync(10); 
                const cryptpass=await bcrypt.hashSync(data.password,salt); 
                data.password=cryptpass;
            }
        }
        const updateUser=await User.findByIdAndUpdate({_id:id},data);
        if(data.email){
            if(data.email !== existUser.email){
                const token=crypto.randomBytes(32).toString('hex');
                existUser.verificationtoken = token;
                existUser.isVerified = false;
                await existUser.save();
                console.log(token);
                const url=process.env.VERIFY+token;
                const html = `<h3>Click to confirm your new email</h3><a href="${url}">${url}</a>`;
                await sendVerificationEmail(data.email,token,'Confirm your email',html);
            }
        }
        res.status(200).send(updateUser);
         
    } 
    catch(err){ 
        console.log(err);
        res.status(400).send(err); 
    } 
}); 


// Delete user by ID 
router.delete('/delete/:id',async(req,res)=>{ 
    try{ 
        const id=req.params.id; 
        const user=await User.findById({_id:id});
        if(!user){
            res.status(404).send("user not found");
        }
        else{
            const deleteUser= await User.findByIdAndDelete({_id:id});
            res.status(200).send(deleteUser);
        }
    } 
    catch(err){ 
        res.status(400).send(err); 
    } 
});
module.exports=router;