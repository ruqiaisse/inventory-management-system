// Password Reset Email Template
const passwordResetEmail = (resetLink, userName) => {
  const subject = "Reset Your Password - InvenPro";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #2c3e50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          background-color: #ecf0f1;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-radius: 0 0 5px 5px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 20px 0;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>InvenPro</h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          
          <p>We received a request to reset your InvenPro password. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
            ${resetLink}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link expires in <strong>1 hour</strong>. If you need another reset link, please request a new one.
          </div>
          
          <p>If you have questions, contact our support team.</p>
          
          <p>Best regards,<br><strong>InvenPro Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 InvenPro. All rights reserved.</p>
          <p>This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Low Stock Alert Email Template
const lowStockEmail = (product) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const subject = `Low Stock Alert: ${product.name}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #e74c3c;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .alert-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 3px;
        }
        .product-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          background-color: #ecf0f1;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-radius: 0 0 5px 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
          <p>InvenPro Inventory System</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <div class="alert-box">
            <strong>The following product is running low on stock:</strong>
          </div>
          
          <div class="product-info">
            <div class="info-row">
              <strong>Product:</strong>
              <span>${product.name}</span>
            </div>
            <div class="info-row">
              <strong>SKU:</strong>
              <span>${product.sku || "N/A"}</span>
            </div>
            <div class="info-row">
              <strong>Current Stock:</strong>
              <span style="color: #e74c3c; font-weight: bold;">${product.stock} units</span>
            </div>
            <div class="info-row">
              <strong>Minimum Stock:</strong>
              <span>${product.minStock} units</span>
            </div>
          </div>
          
          <p><strong>Action Required:</strong> Please review your inventory and consider placing a purchase order.</p>
          
          <a href="${clientUrl}/products" class="button">View Product Details</a>
          
          <p>Best regards,<br><strong>InvenPro Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 InvenPro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// PO Approval Email Template
const poApprovedEmail = (po) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const subject = `Purchase Order Approved: ${po.poNumber}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #27ae60;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .success-box {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 20px 0;
          border-radius: 3px;
          color: #155724;
        }
        .po-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          background-color: #ecf0f1;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-radius: 0 0 5px 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Purchase Order Approved</h1>
          <p>InvenPro Purchase Order System</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <div class="success-box">
            <strong>Your purchase order has been approved!</strong>
          </div>
          
          <div class="po-info">
            <div class="info-row">
              <strong>PO Number:</strong>
              <span>${po.poNumber}</span>
            </div>
            <div class="info-row">
              <strong>Supplier:</strong>
              <span>${po.supplier?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <strong>Total Amount:</strong>
              <span style="font-weight: bold;">$${po.totalAmount?.toFixed(2) || "0.00"}</span>
            </div>
            <div class="info-row">
              <strong>Approved By:</strong>
              <span>${po.approvedBy?.name || "Admin"}</span>
            </div>
            <div class="info-row">
              <strong>Status:</strong>
              <span style="color: #27ae60; font-weight: bold;">Approved</span>
            </div>
          </div>
          
          <p>Your purchase order has been approved and is being processed. You can track the status in your InvenPro dashboard.</p>
          
          <a href="${clientUrl}/purchase-orders" class="button">View Purchase Orders</a>
          
          <p>Best regards,<br><strong>InvenPro Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 InvenPro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

module.exports = {
  passwordResetEmail,
  lowStockEmail,
  poApprovedEmail,
};