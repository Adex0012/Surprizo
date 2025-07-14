const express = require('express');
const multer = require('multer');
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

const upload = multer({ storage: storage });

// In-memory data store
const bookings = [];

// Nodemailer transporter
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});


app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'surprizo-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to protect admin routes
function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin-login');
}

async function sendBookingNotification(booking) {
    const whatsappLink = `https://wa.me/2347037140511?text=New%20booking%20received:%20${encodeURIComponent(JSON.stringify(booking, null, 2))}`;
    let mailOptions = {
        from: '"Surprizo" <no-reply@surprizo.com>',
        to: 'bakareafeez000@gmail.com',
        subject: 'New Booking Received',
        text: `A new booking has been received:\n\n${JSON.stringify(booking, null, 2)}`,
        html: `<p>A new booking has been received:</p><pre>${JSON.stringify(booking, null, 2)}</pre><p><a href="${whatsappLink}">Send WhatsApp Notification</a></p>`
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendCompletionNotification(booking) {
    const customerPhoneNumber = booking.data['phone-number-1'] || booking.data['celebrant-phone'];
    if (!customerPhoneNumber) {
        console.error('Customer phone number not found for booking:', booking);
        return;
    }
    const whatsappLink = `https://wa.me/${customerPhoneNumber}?text=Your%20Surprizo%20booking%20has%20been%20completed!`;
    console.log(`Generated WhatsApp link for completion notification: ${whatsappLink}`);
    // In a real application, you would use a WhatsApp API to send the message directly.
    // For now, we will just log the link.
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/call-surprise', (req, res) => {
    res.sendFile(__dirname + '/call-surprise.html');
});

app.post('/book-call-surprise', upload.single('receipt'), (req, res) => {
    const booking = {
        type: 'Call Surprise',
        data: req.body,
        receipt: req.file,
        status: 'Pending'
    };
    bookings.push(booking);
    sendBookingNotification(booking);
    res.send('Booking successful!');
});

app.get('/physical-surprise', (req, res) => {
    res.sendFile(__dirname + '/physical-surprise.html');
});

app.post('/book-physical-surprise', upload.fields([{ name: 'receipt', maxCount: 1 }, { name: 'frame-photo', maxCount: 1 }]), (req, res) => {
    const booking = {
        type: 'Physical Surprise',
        data: req.body,
        files: req.files,
        status: 'Pending'
    };
    bookings.push(booking);
    sendBookingNotification(booking);
    res.send('Booking successful!');
});

app.get('/admin-login', (req, res) => {
    res.sendFile(__dirname + '/admin-login.html');
});

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Surprizo' && password === 'Surprizo@123') {
        req.session.isAdmin = true;
        res.redirect('/admin-dashboard');
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/admin-dashboard', isAdmin, (req, res) => {
    res.sendFile(__dirname + '/admin-dashboard.html');
});

app.get('/api/bookings', isAdmin, (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings/:id/complete', isAdmin, (req, res) => {
    const bookingId = req.params.id;
    if (bookings[bookingId]) {
        bookings[bookingId].status = 'Completed';
        sendCompletionNotification(bookings[bookingId]);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Booking not found' });
    }
});

app.get('/admin-logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
