export const emailTemplates = {
    passwordReset: (resetLink: string) => `
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #131313; color: #E0E0E0; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1E1E1E; padding: 20px; border-radius: 10px;">
                <header style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #00c885;">CampusLink</h1>
                    <p style="font-size: 18px; color: #878787;">Helping International Students Connect</p>
                </header>
                <section style="padding: 20px; background-color: #1E1E1E; border-radius: 5px;">
                    <h2 style="color: #00c885;">Password Reset Request</h2>
                    <p>Hi,</p>
                    <p>You requested a password reset for your CampusLink account. Click the button below to reset your password:</p>
                    <a href="${resetLink}" style="display: inline-block; background-color: #00c885; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; text-align: center;">
                        Reset Password
                    </a>
                    <p>If the button above doesn't work, click this link: <a href="${resetLink}" style="color: #00c885;">${resetLink}</a></p>
                    <p>If you did not request this, please ignore this email.</p>
                </section>
                <footer style="text-align: center; margin-top: 40px; color: #5A5A5A; font-size: 12px;">
                    <p>&copy; 2024 CampusLink. All rights reserved.</p>
                </footer>
            </div>
        </body>
        </html>
    `,
    verifyEmail: (verificationLink: string, name: string) => `
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #131313; color: #E0E0E0; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1E1E1E; padding: 20px; border-radius: 10px;">
                <header style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #00c885;">CampusLink</h1>
                    <p style="font-size: 18px; color: #878787;">Welcome to CampusLink, ${name}!</p>
                </header>
                <section style="padding: 20px; background-color: #1E1E1E; border-radius: 5px;">
                    <h2 style="color: #00c885;">Verify Your Email</h2>
                    <p>Hi ${name},</p>
                    <p>Thanks for signing up for CampusLink. To complete your registration, please verify your email address by clicking the button below:</p>
                    <a href="${verificationLink}" style="display: inline-block; background-color: #00c885; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; text-align: center;">
                        Verify Email
                    </a>
                    <p>If the button above doesn't work, click this link: <a href="${verificationLink}" style="color: #00c885;">${verificationLink}</a></p>
                    <p>If you did not sign up for CampusLink, please ignore this email.</p>
                </section>
                <footer style="text-align: center; margin-top: 40px; color: #5A5A5A; font-size: 12px;">
                    <p>&copy; 2024 CampusLink. All rights reserved.</p>
                    <p><a href="#" style="color: #00c885; text-decoration: none;">Unsubscribe</a></p>
                </footer>
            </div>
        </body>
        </html>
    `,
    emailChangeVerification: (verificationLink: string, name: string) => `
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #131313; color: #E0E0E0; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1E1E1E; padding: 20px; border-radius: 10px;">
                <header style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #00c885;">CampusLink</h1>
                    <p style="font-size: 18px; color: #878787;">Helping International Students Connect</p>
                </header>
                <section style="padding: 20px; background-color: #1E1E1E; border-radius: 5px;">
                    <h2 style="color: #00c885;">Verify Your New Email</h2>
                    <p>Hi ${name},</p>
                    <p>You requested to update the email address for your CampusLink account. To verify your new email, click the button below:</p>
                    <a href="${verificationLink}" style="display: inline-block; background-color: #00c885; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; text-align: center;">
                        Verify New Email
                    </a>
                    <p>If the button above doesn't work, click this link: <a href="${verificationLink}" style="color: #00c885;">${verificationLink}</a></p>
                    <p>If you did not request this change, please ignore this email.</p>
                </section>
                <footer style="text-align: center; margin-top: 40px; color: #5A5A5A; font-size: 12px;">
                    <p>&copy; 2024 CampusLink. All rights reserved.</p>
                    <p><a href="#" style="color: #00c885; text-decoration: none;">Unsubscribe</a></p>
                </footer>
            </div>
        </body>
        </html>
    `,
};
