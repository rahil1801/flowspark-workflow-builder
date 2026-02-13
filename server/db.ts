// const mongoose: any = require("mongoose");
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongodbUri: any = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("MONGODB_URI must be set.");
}

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

const workflowStepSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
  },
  { _id: false },
);

const workflowSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    steps: { type: [workflowStepSchema], required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);

const runStepOutputSchema = new mongoose.Schema(
  {
    stepType: { type: String, required: true },
    output: { type: String, required: true },
    error: { type: String },
    durationMs: { type: Number, required: true },
    attempts: { type: Number, required: true },
  },
  { _id: false },
);

const runSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    workflowId: { type: Number, required: true, index: true },
    inputText: { type: String, required: true },
    stepOutputs: { type: [runStepOutputSchema], required: true },
    finalOutput: { type: String, required: true },
    createdAt: { type: Date, required: true, index: true },
  },
  { versionKey: false },
);

export const CounterModel = mongoose.model("Counter", counterSchema, "counters");
export const WorkflowModel = mongoose.model("Workflow", workflowSchema, "workflows");
export const RunModel = mongoose.model("Run", runSchema, "runs");

export async function connectDatabase() {
  await mongoose.connect(mongodbUri);
}

export async function pingDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }

  await mongoose.connection.db?.admin().command({ ping: 1 });
}

export async function nextId(key: string): Promise<number> {
  const result = await CounterModel.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 }, $setOnInsert: { _id: key } },
    { upsert: true, new: true },
  ).lean();

  return result?.seq ?? 1;
}
