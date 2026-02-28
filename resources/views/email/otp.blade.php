<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 5px;
            margin: 20px 0;
            letter-spacing: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ Shopcart</h1>
        <p>Password Reset Request</p>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the following OTP to proceed:</p>
        
        <div class="otp-code">
            {{ $otp }}
        </div>
        
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </div>
    
    <div class="footer">
        <p>&copy; {{ date('Y') }} Shopcart. All rights reserved.</p>
    </div>
</body>
</html>