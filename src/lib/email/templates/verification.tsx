export function getVerificationEmailHtml(url: string, username: string) {
  const brandColor = '#2563eb'; // Blue-600

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email - LinkOps</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .header {
          background-color: #ffffff;
          padding: 32px 24px 0;
          text-align: center;
        }
        .logo {
          height: 40px;
          width: auto;
        }
        .content {
          padding: 32px;
        }
        .button {
          display: inline-block;
          background-color: ${brandColor};
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin-top: 24px;
          margin-bottom: 24px;
        }
        .footer {
          padding: 24px;
          background-color: #f3f4f6;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .link-text {
          font-size: 14px;
          color: #6b7280;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_URL}/linkops-logo.png" alt="LinkOps" class="logo">
        </div>
        <div class="content">
          <h2>Verify your email address</h2>
          <p>Hi ${username},</p>
          <p>Thanks for creating an account on LinkOps. Please verify your email address to complete your registration and secure your account.</p>
          
          <div style="text-align: center;">
            <a href="${url}" class="button">Verify Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p class="link-text">${url}</p>
          
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LinkOps. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
