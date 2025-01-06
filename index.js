require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session') // Added for session management
const paypal = require('./services/paypal')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

// Configure session middleware
app.use(
    session({
        secret: 'D3r!s9Tq8@q9!34M5A7n2LzR6nFh9X8b#4XzL%k2dR8@xY6wF!9r1T2vE9bRjZ6o9S7K9sU#V0j5J', 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Use `true` only if using HTTPS
    })
)

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/pay', async (req, res) => {
    try {
        const url = await paypal.createOrder()

        // Save user details in the session
        req.session.userData = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        }

        res.redirect(url)
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/complete-order', async (req, res) => {
    try {
        await paypal.capturePayment(req.query.token)

        // Retrieve user details from the session
        const { name, email, phoneNumber } = req.session.userData

        res.send(`Payment successfully completed!<br><br>
                  Name: ${name}<br>
                  Email: ${email}<br>
                  Phone Number: ${phoneNumber}`)
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/cancel-order', (req, res) => {
    res.redirect('/')
})

app.listen(3000, () => console.log('Server started on port 3000'))
