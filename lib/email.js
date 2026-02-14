const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendAdminNotification(endorsement) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Endorsement from ${endorsement.name}`,
            html: `
                <h2>New Endorsement Submission</h2>
                <p><strong>From:</strong> ${endorsement.name}</p>
                <p><strong>Email:</strong> ${endorsement.email}</p>
                <p><strong>Role:</strong> ${endorsement.role}</p>
                <p><strong>Relationship:</strong> ${endorsement.relationship}</p>
                <p><strong>LinkedIn:</strong> <a href="${endorsement.linkedin}">${endorsement.linkedin}</a></p>
                <br>
                <p><strong>Endorsement:</strong></p>
                <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea;">
                    ${endorsement.endorsement}
                </blockquote>
                <br>
                <p><strong>Submitted:</strong> ${new Date(endorsement.submittedDate).toLocaleString()}</p>
                <br>
                <p><a href="${process.env.ADMIN_URL || 'https://your-site.com'}/endorsements-admin.html" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Panel</a></p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification sent');
    } catch (error) {
        console.error('❌ Error sending admin notification:', error);
    }
}

async function sendApprovalNotification(endorsement) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: endorsement.email,
            subject: 'Your Endorsement Has Been Approved!',
            html: `
                <h2>Thank You for Your Endorsement!</h2>
                <p>Hi ${endorsement.name},</p>
                <p>Your professional endorsement for Ansh has been approved and is now live on the website!</p>
                <br>
                <p><strong>Your endorsement:</strong></p>
                <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea;">
                    "${endorsement.endorsement}"
                </blockquote>
                <br>
                <p>Thank you for taking the time to share your experience.</p>
                <p>Best regards,<br>Ansh's Portfolio Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Approval notification sent');
    } catch (error) {
        console.error('❌ Error sending approval notification:', error);
    }
}

module.exports = { sendAdminNotification, sendApprovalNotification };