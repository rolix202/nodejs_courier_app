import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import packageRoutes from './routes/packageRoutes.js'
const app = express()
import * as dotenv from "dotenv"
dotenv.config();
import { renderFile } from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use(express.static(__dirname + "/public/"));

// Set 'html' as the view engine
app.engine('ejs', renderFile);
app.set('view engine', 'ejs');

// Set the views directory to the 'views' folder
app.set('views', path.join(__dirname, 'views'));

// Basic routes
app.get('/', (req, res) => {
    res.render('homepage/index.ejs')
  });
app.get('/contact-us', (req, res) => {
    res.render('contact/contactH.ejs')
})

app.use('/packages', packageRoutes);

const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
    console.log('Connected to MongoDB');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});