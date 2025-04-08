import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  appId: {
    type: String,
    unique: true
  },
  applicationName: {
    type: String,
  },
  urls: {
    externalProd: String,
    externalUAT: String,
    internalProd: String,
    internalUAT: String,
    api: String
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
    enum: ['Azure', 'AWS', 'GCP'],
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
  vaptStatus: {
    type: String,
    enum: ['VA', 'PT', 'API']
  },
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