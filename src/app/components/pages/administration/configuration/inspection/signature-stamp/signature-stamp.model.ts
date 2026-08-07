export interface InspectionSignatureStampItem {
  signatureCode: string;
  user: string;
  signatureName: string;
  signatureImage: string;
  stampImage: string;
  digitalSignatureCertificate: string;
  effectiveDate: string;
  expiryDate: string;
  defaultSignature: boolean;
  defaultStamp: boolean;
  allowManualSignature: boolean;
  allowUploadedSignature: boolean;
  allowBoth: boolean;
  status: boolean;
  passwordConfirmationBeforeSigning: boolean;
  otpConfirmation: boolean;
  signatureUsageLog: string;
  ipAddress: string;
  deviceInformation: string;
  timestamp: string;
  signatureHash: string;
}

export interface InspectionSignatureStampRow extends InspectionSignatureStampItem {
  selected?: boolean;
}
