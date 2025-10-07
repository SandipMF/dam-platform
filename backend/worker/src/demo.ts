import dotenv from "dotenv";
import logger from "./config/logger";
import { getPubSubConnection, closeRedisConnection } from "./config/redis";
import imageWorker from "./workers/image.worker";
import imageThumbnailWorker from "./workers/imageThumbnail.worker";
import { imageQueue } from "./queues/image.queue";
 
// Load environment variables
dotenv.config();
 
// Event-driven architecture - listen to Redis events
 
// Get Redis connection using the connection manager
const connection = getPubSubConnection();
 
// Listen for image job events from BullMQ app
connection.subscribe("image_worker_events", (err, count) => {
	if (err) {
		logger.error("❌ Error subscribing to image_worker_events:", err);
		return;
	}
	logger.info(`📡 Subscribed to image_worker_events channel (${count} subscribers)`);
});
 
// Handle incoming image job events
connection.on("message", async (channel, message) => {
	if (channel === "image_worker_events") {
		try {
			const event = JSON.parse(message);
			await handleImageJobEvent(event);
		} catch (error) {
			logger.error("❌ Error processing image job event:", error);
		}
	}
});
 
// Track processing assets to prevent duplicates
const processingAssets = new Set<string>();
const processingTimeouts = new Map<string, NodeJS.Timeout>();
 
// Clean up processing assets after timeout
function cleanupProcessingAsset(asset_id: string) {
	processingAssets.delete(asset_id);
	const timeout = processingTimeouts.get(asset_id);
	if (timeout) {
		clearTimeout(timeout);
		processingTimeouts.delete(asset_id);
	}
	logger.info(`🧹 Cleaned up processing asset: ${asset_id}`);
}
 
/**
* Handle image job events from BullMQ app
*/
async function handleImageJobEvent(event: any) {
	const { type, data } = event;
	if (type === "image_job") {
		const { asset_id, storage_path } = data;
		// Check if asset is already being processed
		if (processingAssets.has(asset_id)) {
			logger.info(`⏭️ Skipping duplicate image job event for asset: ${asset_id} (already processing)`);
			return;
		}
 
		// Mark asset as being processed
		processingAssets.add(asset_id);
		logger.info(`📥 Received image job event for asset: ${asset_id}`);
 
		// Set timeout to clean up processing asset after 5 minutes
		const timeout = setTimeout(() => {
			cleanupProcessingAsset(asset_id);
		}, 5 * 60 * 1000); // 5 minutes
		processingTimeouts.set(asset_id, timeout);
 
		try {
			// Enqueue image processing job with unique job ID to prevent duplicates
			const job = await imageQueue.add("process-image", {
				asset_id,
				storage_path
			}, {
				jobId: `image-${asset_id}-${Date.now()}`,
				removeOnComplete: 10,
				removeOnFail: 5
			});
			logger.info(`🖼️ Enqueued image processing job ${job.id} for asset: ${asset_id}`);
		} catch (error) {
			logger.error(`❌ Error enqueueing image job for ${asset_id}:`, error);
			// Remove from processing set on error
			cleanupProcessingAsset(asset_id);
		}
	}
}
 
async function startImageWorkerApp() {
	try {
		logger.info("🚀 Starting Image Worker Application...");
 
		// Test Redis connection
		await connection.ping();
		logger.info("[Redis] Connected to Redis ✅");
 
		// Initialize workers
		await Promise.all([
			imageWorker.waitUntilReady(),
			imageThumbnailWorker.waitUntilReady(),
		]);
 
		// Add event listeners to clean up processing assets
		imageWorker.on("completed", (job) => {
			if (job && job.data) {
				cleanupProcessingAsset(job.data.asset_id);
				logger.info(`✅ Image processing completed for asset: ${job.data.asset_id}`);
			}
		});
 
		imageWorker.on("failed", (job) => {
			if (job && job.data) {
				cleanupProcessingAsset(job.data.asset_id);
				logger.info(`❌ Image processing failed for asset: ${job.data.asset_id}`);
			}
		});
 
		imageThumbnailWorker.on("completed", (job) => {
			if (job && job.data) {
				logger.info(`✅ Thumbnail processing completed for asset: ${job.data.asset_id}`);
			}
		});
 
		imageThumbnailWorker.on("failed", (job) => {
			if (job && job.data) {
				logger.info(`❌ Thumbnail processing failed for asset: ${job.data.asset_id}`);
			}
		});
 
		logger.info("✅ All image workers initialized successfully");
 
		// Log worker status
		logger.info("👷 Workers running:");
		logger.info("   - Image Processing Worker: image-processing");
		logger.info("   - Image Thumbnail Worker: image-thumbnail");
 
		logger.info("🎉 Image Worker Application is running and ready to process jobs!");
 
		// Graceful shutdown
		process.on("SIGINT", async () => {
			logger.info("🛑 Shutting down Image Worker Application...");
			await Promise.all([
				imageWorker.close(),
				imageThumbnailWorker.close(),
			]);
			await closeRedisConnection(); // Close all connections
			process.exit(0);
		});
 
		process.on("SIGTERM", async () => {
			logger.info("🛑 Shutting down Image Worker Application...");
			await Promise.all([
				imageWorker.close(),
				imageThumbnailWorker.close(),
			]);
			await closeRedisConnection(); // Close all connections
			process.exit(0);
		});
 
	} catch (error) {
		logger.error("❌ Failed to start Image Worker Application:", error);
		process.exit(1);
	}
}
 
// Start the application
startImageWorkerApp();