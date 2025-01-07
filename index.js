require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // For session management
const paypal = require('./services/paypal');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(
    session({
        secret: 'D3r!s9Tq8@q9!34M5A7n2LzR6nFh9X8b#4XzL%k2dR8@xY6wF!9r1T2vE9bRjZ6o9S7K9sU#V0j5J', 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Use `true` only with HTTPS
    })
);

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/pay', async (req, res) => {
    try {
        const price = req.body.price; // Get price from form
        const url = await paypal.createOrder(price);

        // Save user details in the session
        req.session.userData = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            price, // Save price in session
        };

        res.redirect(url);
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

app.get('/complete-order', async (req, res) => {
    try {
        await paypal.capturePayment(req.query.token);

        // Retrieve user details from session
        const { name, email, phoneNumber, price } = req.session.userData;

        // HTML response with blue background and animated success message
        res.send(`
            <html>
                <head>
                    <style>
                        body {
                            background-color: #1167b1;
                            color: white;
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }

                        .message {
                            text-align: center;
                            font-size: 2rem;
                        }

                        .tick {
                            font-size: 5rem;
                            opacity: 0;
                            animation: tickAnimation 1s forwards, slideIn 1s 1s ease-in-out;
                        }

                        .message-text {
                            font-size: 2rem;
                            opacity: 0;
                            animation: fadeIn 1s 1s forwards;
                        }

                        @keyframes tickAnimation {
                            0% {
                                transform: scale(0);
                            }
                            50% {
                                transform: scale(1.2);
                            }
                            100% {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }

                        @keyframes slideIn {
                            0% {
                                transform: translateY(-100%);
                            }
                            100% {
                                transform: translateY(0);
                            }
                        }

                        @keyframes fadeIn {
                            0% {
                                opacity: 0;
                            }
                            100% {
                                opacity: 1;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <div class="tick">✔</div>
                        <div class="message-text">Payment successfully completed!</div>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});



app.get('/cancel-order', (req, res) => {
    res.redirect('/');
});

app.listen(3000, () => console.log('Server started on port 3000'));
