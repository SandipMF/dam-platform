import mongoose from "mongoose";
import { connectDB } from "../db-config.ts";

jest.mock("mongoose");

describe("connectDB", () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalProcessExit = process.exit;

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    process.exit = jest.fn() as unknown as () => never;
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  it("should connect to MongoDB with default URI", async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(true);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.MONGO_URI || "mongodb://localhost:27017/dam"
    );
    expect(console.log).toHaveBeenCalledWith(
      "MongoDB connected:",
      process.env.MONGO_URI || "mongodb://localhost:27017/dam"
    );
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("should log error and exit process if connection fails", async () => {
    const error = new Error("Connection failed");
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    await connectDB();

    expect(console.error).toHaveBeenCalledWith(
      "MongoDB connection error:",
      error
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
