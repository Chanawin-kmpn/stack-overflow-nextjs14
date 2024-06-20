import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDatabase = async () => {
	mongoose.set('strictQuery', true);

	if (!process.env.MONGODB_URL) {
		return console.log('MISSING MONGODB_URL');
	}

	if (isConnected) {
		console.log('MongoDb is already connected');
	}

	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			dbName: 'devflow',
		});
		isConnected = true;
		console.log('MongoDb is connected');
	} catch (error) {
		console.error('Database not found!');
	}
};
