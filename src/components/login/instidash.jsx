import React, { useState } from 'react';
import axios from 'axios';
import './InstiDash.css'; // Import the CSS file for styling

const FormData = require('form-data');
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2NTZmYTg0Yy1hZmRiLTRiZDktYjY0YS1jYmYwY2E4NDE3NWUiLCJlbWFpbCI6Im5pdmVkbmFyYXlhbmFuNjdAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ0ZTA3ZjUzOTNjOGNjOTNmNmJlIiwic2NvcGVkS2V5U2VjcmV0IjoiYmM2ZTJhMjhkOGVhNzU5M2U2NGVjZDU4NzdlYWYzZmQ0ODYzNjcyYWE0ZWEzYjZmNDE5ZDRmYTE4MmJmZDRjNiIsImlhdCI6MTcxMDYxMzE1OH0.AZP__ZpTeWSKgZ_LFZSpUlDx7MJRKbioVRnHVjCtLLc';

const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
        name: file.name,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(res.data);
        return res.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error pinning file to IPFS');
    }
}

const InstiDash = () => {
    const [userId, setUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        try {
            // Upload file to IPFS and get the hash value
            const hashValue = await pinFileToIPFS(file);
            console.log('File pinned to IPFS:', hashValue);

            // Make PUT request to update user record with document hash
            await axios.put(`http://localhost:3001/documents/${userId}`, { docHash: hashValue.IpfsHash });

            console.log('Document hash updated successfully for user:', userId);
        } catch (error) {
            console.error('Error updating document hash:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleUserIdChange = (event) => {
        setUserId(event.target.value);
    };

    return (
        <div className="insti-dash-container">
            <input className="input-field" type="text" value={userId} onChange={handleUserIdChange} placeholder="Enter userId" />
            <input className="file-input" type="file" onChange={handleFileUpload} />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default InstiDash;
