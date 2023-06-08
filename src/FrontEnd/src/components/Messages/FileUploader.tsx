import React, { ChangeEvent } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import IconButton from '@mui/material/IconButton';
import { lookup } from 'mime-types';
import config from '../../config.json';

interface FileUploaderProps {
  baseUrl: string;
  uploadEndpoint: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ baseUrl, uploadEndpoint }) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const accessToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('Access-Token'))
      ?.split('=')[1];

    console.log(accessToken);

    const mimeType = file.type || lookup(file.name);

    let fileId;
    if (mimeType === 'application/pdf') {
      fileId = config.pdfID;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileId = config.docID;
    } else {
      console.error('Unsupported file type:', mimeType);
      return;
    }

    formData.append('FileTypeId', fileId);

    try {
      const response = await fetch(`${baseUrl}${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        // File uploaded successfully
        console.log('File uploaded successfully');
      } else {
        // Error uploading file
        console.error('Error uploading file:', response.status);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.docx';
    fileInput.addEventListener('change', handleFileChange);
    fileInput.click();
  };

  return (
    <IconButton style={{ color: 'white' }} onClick={handleButtonClick}>
      <AttachFileIcon style={{ marginRight: '10px' }} />
    </IconButton>
  );
};

export default FileUploader;
