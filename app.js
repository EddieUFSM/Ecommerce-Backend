const express = require('express');
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const { check, validationResult} = require('express-validator');
const cookieParser = require('cookie-parser')

const app = express();

require('dotenv').config()

//import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')

/** Connect to DB */
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=> console.log("DB Connected"));
//mongoose.connect(process.env.MDB_KEY);

//middleware
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.json());

app.get('/', function(req, res) {
    res.send('Olá mundo');
});
//routes middleware
app.use("/api", authRoutes)
app.use("/api", userRoutes)
app.use("/api/category", categoryRoutes)

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})