import { Router } from "express";
import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get('/login', (req, res) => {
    res.render('loginPage/loginH', { msg: '' });
  })

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username: username });

        if (!admin) {
            return res.render('loginPage/loginH', { msg: 'Invalid username or password' });
        }

        const verifyPass = await bcrypt.compare(password, admin.password);

        if (verifyPass) {
            req.session.admin = admin; // Set the session variable
            res.redirect('/packages/dashboard');
        } else {
            return res.render('loginPage/loginH', { msg: 'Invalid username or password' });
            
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});


//   router.post('/register', async(req, res) => {

//     //L0v3P@ss

//     try {
//        const {username, password} = req.body;
//        console.log(username);
//        console.log(password);

//        const hashedPassword = await bcrypt.hash(password, 10);

//        // creating new Admin instance

//        const admin = new Admin({
//         username,
//         password: hashedPassword,
//        });

//        const data = await admin.save();

//         res.status(200).json({msg: 'user created successfully', data})
//     } catch (error) {
//         res.status(500).json({msg: 'Admin not created'})
//     }
    
//   })

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ msg: 'Failed to log out' });
        } else {
            res.redirect('/login');
        }
    });
});


  export default router;