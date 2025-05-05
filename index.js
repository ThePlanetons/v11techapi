import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'v11tech',
  database: 'v11tech_local'
});

db.connect((err) => {
  if (err) {
    // console.error('Error connecting to MySQL:', err.message);
    return;
  }
  // console.log('Connected to MySQL database.');
});

app.post('/leads', (req, res) => {
  const { name, email, phone, country, state, city, product, message } = req.body;

  // Insert data into contact_us table
  const sql = `
    INSERT INTO leads_pos (name, email, phone, country, state, city, product, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [name, email, phone, country, state, city, product, message];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting into contact_us:', err.message);
      return res.status(500).send('Database error.');
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.AUTH_EMAIL_USER,
      to: process.env.AUTH_EMAIL_USER,
      cc: process.env.ADMIN_EMAIL,
      subject: 'V11Tech Book a Demo',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Country: ${country}
        State: ${state}
        City: ${city}
        Product: ${product}
        Message: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Email sending failed.');
      }

      res.status(200).json({ message: 'Email sent successfully' });
    });
  });
});

// Start the server after routes are defined
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});