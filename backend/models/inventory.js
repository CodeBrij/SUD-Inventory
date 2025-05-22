import mongoose from 'mongoose';


const urlEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    // validate: {
    //   validator: function(v) {
    //     return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
    //   },
    //   message: props => `${props.value} is not a valid URL!`
    // }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false }); 

const inventorySchema = new mongoose.Schema({
  appId: {
    type: String,
    unique: true
  },
  applicationName: {
    type: String,
  },
  urls: {
    externalProd: [urlEntrySchema],
    externalUAT: [urlEntrySchema],
    internalProd: [urlEntrySchema],
    internalUAT: [urlEntrySchema],
    api: [urlEntrySchema]
  },
  severity: {
    type: String,
    enum: ['Critical', 'Non-Critical'],
  },
  deployment: {
    type: String,
    enum: [
      'Onprem',
      'DC',
      'DR',
      'Cloud',
      'Hybrid',
      'Vendor Site'
    ],
  },
  cloudProvider: {
    type: String,
    enum: ['AWS', 'Azure', 'GCP', ''], 
    default: null ,
    required: function () {
      return this.deployment === 'Cloud';
    },
  },
  
  stage: {
    type: String,
    enum: ['Live', 'Preprod', 'Sunset', 'Decom'],
  },
  publish: {
    type: String,
    enum: ['Internet', 'Non-Internet'],
  },
  availabilityRating: {
    type: Number,
    min: 1,
    max: 4,
  },
  criticalityRating: {
    type: Number,
    min: 1,
    max: 4,
  },
  goLiveDate: {
    type: Date
  },
  applicationType: {
    type: String,
    enum: ['Business', 'Infra', 'Security'],
    required: true,
  },
  developedBy: {
    type: String,
    enum: ['In-House', 'OEM', 'Vendor'],
    required: true
  },
  socMonitoring: {
    type: Boolean,
    default: false
  },
  endpointSecurity: {
    type: String,
    enum: ['HIPS', 'EDR', 'NA']
  },
  accessControl: {
    type: String,
    enum: ['PAM', 'NA']
  },
  manager: {
    type: String,
    enum: ['Business', 'IT']
  },
  vaptStatus: [
    {
      status: {
        type: String,
        enum: ['VA', 'PT', 'API'],
      },
      from: {
        type: Date,
      },
      to: {
        type: Date,
        validate: {
          validator: function (value) {
            return this.from < value;
          },
          message: 'To date must be after from date'
        }
      },
      dateAdded: {
        type: Date,
        default: Date.now
      },
      result: {
        type: String,
        enum: ['Scheduled', 'InProgress', 'Completed', 'Failed'],
        default: 'Scheduled'
      },
    }
  ],  
  riskAssessmentDate: {
    type: Date
  },
  smtpEnabled: {
    type: Boolean,
    default: false
  },
  businessOwner: {
    type: String,
  },
  businessDeptOwner: {
    type: String,
  },
  serviceType: {
    type: String,
  },
  serviceWindow: {
    type: String,
  },
  businessSeverity: {
    type: String,
  },
  technologyStack: {
    type: [String],
  },
  applicationDescription: {
    type: String,
  }
}, { timestamps: true });

const InventoryModel = mongoose.models.Inventory ||  mongoose.model('Inventory', inventorySchema);

export default InventoryModel;