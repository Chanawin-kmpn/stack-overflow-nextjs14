'use client';
import { Job } from '@/types';
import React, { useEffect, useState } from 'react';

const JobCard = () => {
	const [jobData, setJobData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const getJobDetail = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jobDetails`,
				{ method: 'GET' }
			);

			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const responseData = await response.json();
			console.log(responseData);
			setJobData(responseData);
		} catch (error: any) {
			setError(error.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getJobDetail();
	}, []);

	return <div>{jobData}</div>;
};

export default JobCard;
