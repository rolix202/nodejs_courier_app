// packageRoutes.js
import { Router } from 'express';

const router = Router()
import Package from '../models/package.js'

// Basic routes
router.get('/dashboard', (req, res) => {
  res.render('dashboard/dashboard')
});

// Route to render the addPackage.html form
router.get('/add', (req, res) => {
  res.render('addPackage/addPackage')
});

// Route to add a new package
router.post('/add', async (req, res) => {
    
  try {
    // Extract package details from the request body
    const { receiverDetails, senderDetails, transitInfo, } = req.body;

    // Create a new package
    const newPackage = new Package({
      receiverDetails,
      senderDetails,
      transitInfo,
      transitHistory,
    });

    // Save the package to the database
    await newPackage.save();

    console.log(newPackage);

    res.status(200).json({ message: 'Package created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create the package' });
  }
});

// Route to view package details by tracking number
// Assuming you are rendering the viewPackage.ejs template in a route like this


router.get('/detail', async (req, res) => {
  try {
    const { trackingNumber } = req.query;
    const packag = await Package.findOne({ trackingNumber });

    if (!packag) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.render('trackingPage/viewPackage', { packag, trackingNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
  
  // Route to update transit information by tracking number
  router.post('/update/:trackingNumber', async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const { transitInfo } = req.body;
  
      // Find and update the package by tracking number
      const updatedPackage = await Package.findOneAndUpdate(
        { trackingNumber },
        {
          $set: { 'transitInfo.status': transitInfo.status },
          $push: { transitHistory: { status: transitInfo.status } }
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }
  
      // Redirect to the view page after updating transit information
      // res.redirect(`/packages/details/${trackingNumber}`);
      res.redirect('/packages/allpackage')
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Route to render the updatePackage.ejs template for GET requests
router.get('/update/:trackingNumber', (req, res) => {
    const { trackingNumber } = req.params;
    res.render('updatePackage/update', { trackingNumber });
  });
  
  router.get('/allpackage', async (req, res) => {
    try {
      const packages = await Package.find();
      // console.log(packages);
      res.render('allPackages/getAllPackages', { packages });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Route to handle package deletion by tracking number
router.post('/delete/:trackingNumber', async (req, res) => {
    try {
      const { trackingNumber } = req.params;
  
      // Find and delete the package by tracking number
      const deletedPackage = await Package.findOneAndDelete({ trackingNumber });
  
      if (!deletedPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }
  
      // Redirect to the package list page after deletion
      res.redirect('/packages/allpackage')
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

export default router
