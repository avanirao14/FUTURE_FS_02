import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  leadSource: 'Website' | 'LinkedIn' | 'Instagram' | 'Referral' | 'Advertisement' | 'Other';
  status: 'New' | 'Contacted' | 'Converted';
  notesSummary?: string;
  lastContactedAt?: Date | null;
  followUpDate?: Date | null;
  budget?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: { type: String, required: [true, 'Email address is required'], trim: true, lowercase: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    leadSource: {
      type: String,
      required: true,
      enum: ['Website', 'LinkedIn', 'Instagram', 'Referral', 'Advertisement', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      required: true,
      enum: ['New', 'Contacted', 'Converted'],
      default: 'New',
    },
    budget: { type: String, trim: true },
    message: { type: String, trim: true },
    notesSummary: { type: String },
    lastContactedAt: { type: Date, default: null },
    followUpDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const LeadModel = mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);
