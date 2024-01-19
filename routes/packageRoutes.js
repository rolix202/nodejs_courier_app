// packageRoutes.js
import { Router } from 'express';

const router = Router()
import Package from '../models/package.js'
import { isAuthenticated } from '../middleware/authenticationMiddleware.js';
import { validateInput } from '../middleware/validationMiddleware.js';

// sRprhYYMkCVZ

// Basic routes
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard/dashboard')
});


// Route to render the addPackage.html form
router.get('/add', isAuthenticated, (req, res) => {
  res.render('addPackage/addPackage')
});

// Route to add a new package
router.post('/add', isAuthenticated, async (req, res) => {

  try {
    // Extract package details from the request body
    const { receiverDetails, senderDetails, transitInfo, } = req.body;

    // Create a new package
    const newPackage = new Package({
      receiverDetails,
      senderDetails,
      transitInfo,
      transitHistory: [{
        status: 'Accepted',
        comment: 'Package accepted for processing',
        location: 'Initial location' // Update with actual initial location
      }],
    });

    // Save the package to the database
    await newPackage.save();

    // console.log(newPackage);

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
      return res.render('homepage/index.ejs', { msg: 'Package not found' });
    }
    // trackingPage/viewPackage
    res.render('track/main', { packag, trackingNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Route to update transit information by tracking number
router.post('/update/:trackingNumber', validateInput, isAuthenticated, async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { transitInfo, comment, location, receiverDetails } = req.body;

    // Find the package by tracking number
    const packageToUpdate = await Package.findOne({ trackingNumber });

    if (!packageToUpdate) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Update transit information
    packageToUpdate.transitInfo.status = transitInfo.status;

    // Add a new entry to the transit history array
    packageToUpdate.transitHistory.push({
      status: transitInfo.status,
      comment,
      location,
      date: new Date(),
    });

    // Update receiver details
    if (receiverDetails) {
      packageToUpdate.receiverDetails = receiverDetails;
    }


    // console.log(packageToUpdate);

    // Save the updated package
    await packageToUpdate.save();

    // Redirect to the view page after updating transit information
    res.redirect('/packages/allpackage');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






// Route to render the updatePackage.ejs template for GET requests
router.get('/update/:trackingNumber', isAuthenticated, async (req, res) => {
  const { trackingNumber } = req.params;

  try {
    const packageToUpdate = await Package.findOne({ trackingNumber });

    if (!packageToUpdate) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.render('updatePackage/update', { trackingNumber, packageToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







router.get('/allpackage', isAuthenticated, async (req, res) => {
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
router.post('/delete/:trackingNumber', isAuthenticated, async (req, res) => {
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


router.get('/view-history/:trackingNumber', isAuthenticated, async(req, res) => {

  try {
    const { trackingNumber } = req.params;
    const history = await Package.findOne({ trackingNumber })

    if (!history){
        return res.render('allPackages/getAllPackages.ejs', { msg: 'Reference number not found' });
    }

    const { transitHistory } = history;

    res.render('viewHistory/viewH.ejs', { transitHistory, trackingNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

router.get('/edit-transit/:trackingNumber/:getStatus', isAuthenticated, async (req, res) => {
  try {
    const { trackingNumber, getStatus } = req.params;
    
    const user = await Package.findOne({ trackingNumber });

    const transHistory = user.transitHistory.find(transit => transit.status === getStatus);

    if (!transHistory) {
      return res.render('viewHistory/viewH.ejs', {msg: 'Transit history not found'});
  }

  res.render('statusEdit/editM.ejs', { trackingNumber, transHistory });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post('/update-status', validateInput, isAuthenticated, async (req, res) => {
  try {
    const { trackingNumber, status, location, comment } = req.body;

    const userInfo = await Package.findOne({trackingNumber})
    const history = userInfo.transitHistory.find(transit => transit.status === status)

    // console.log(history);

    if (!history) {
      return res.status(404).json({ error: 'Transit history not found' });
  }

  history.status = status;
  history.location = location;
  history.comment = comment;

  // console.log(history);

  await userInfo.save();

  res.redirect(`/packages/view-history/${trackingNumber}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.post('/delete', isAuthenticated, async(req, res) => {
  try {
    const {trackingNumber, history_id} = req.body;

    const packageToUpdate = await Package.findOne({ trackingNumber });

    if (!packageToUpdate) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Find and remove the specified transit history entry by _id
    packageToUpdate.transitHistory = packageToUpdate.transitHistory.filter(
      (transit) => transit._id.toString() !== history_id
    );

    // console.log(packageToUpdate);
   
    await packageToUpdate.save();

    // Redirect to the view page after updating transit information
    res.redirect(`/packages/view-history/${trackingNumber}`);

  } catch (error) {
    
  }
})


export default router
