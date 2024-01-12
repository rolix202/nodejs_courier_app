import mongoose from "mongoose";
import shortid from "shortid";

const packageSchema = new mongoose.Schema({
    trackingNumber: {
        type: String,
        default: shortid.generate,
        unique: true
    },

    senderDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true },
        country: { type: String, required: true},
    },

    receiverDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        destinationAddress: { type: String, required: true },
        country: { type: String, required: true},
        referenceNumber: { type: String, unique: true },
        productName: {type: String, required: true},
        productDetails: {type: String, required: true},
        expectedDeliveryDate: {type: Date, required: true}
    },


    transitInfo: {
        status: { type: String, enum: ['Accepted', 'Processing', 'Out for Delivery', 'In Transit', 'Delay', 'Change of Route', 'On Hold', 'Released', 'Package Delivered'], default: 'Accepted' }
    },

    transitHistory: [{
        status: { type: String, default: 'Accepted' },
        date: { type: Date, default: Date.now }
      }]

      
});

// Middleware to generate a unique reference number before saving for the receiver
packageSchema.pre('save', function (next) {
    if (!this.receiverDetails.referenceNumber) {
        this.receiverDetails.referenceNumber = 'borderCross' + shortid.generate();
    }
    next();
});

const Package = mongoose.model('Package', packageSchema)

export default Package;