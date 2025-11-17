import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Student, LogType, AttendanceLog, RecognitionStatus } from '../../types';
import { MOCK_STUDENTS } from '../../constants';
import { Icon } from '../ui/Icon';

interface LiveRecognitionFeedProps {
    addLog: (student: Student, type: LogType) => void;
    logs: AttendanceLog[];
}

const LiveRecognitionFeed: React.FC<LiveRecognitionFeedProps> = ({ addLog, logs }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<RecognitionStatus>(RecognitionStatus.IDLE);
    const [message, setMessage] = useState('Looking for faces...');
    const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
    const [isCameraError, setCameraError] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraOn(true);
                    setCameraError(false);
                }
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError(true);
            setMessage("Camera access denied. Please enable camera permissions.");
        }
    }, []);
    
    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
        }
    }, []);
    
    const drawBoundingBox = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (status === RecognitionStatus.SUCCESS && recognizedStudent) {
            // Simulate a bounding box
            const x = canvas.width * 0.3;
            const y = canvas.height * 0.2;
            const width = canvas.width * 0.4;
            const height = canvas.height * 0.6;
            
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = '#2563eb';
            ctx.font = '20px sans-serif';
            ctx.fillText(recognizedStudent.name, x, y > 25 ? y - 10 : y + height + 20);
        } else {
             ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [status, recognizedStudent]);
    
    useEffect(() => {
        if (isCameraOn) {
            const intervalId = setInterval(() => {
                drawBoundingBox();
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [isCameraOn, drawBoundingBox]);


    useEffect(() => {
        if (!isCameraOn) return;

        const recognitionInterval = setInterval(() => {
            setStatus(RecognitionStatus.RECOGNIZING);
            setMessage('Recognizing...');

            setTimeout(() => {
                const isRecognized = Math.random() > 0.2; // 80% chance of recognition
                if (isRecognized) {
                    const student = MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
                    const lastLog = logs.find(log => log.student.usn === student.usn);
                    const logType = !lastLog || lastLog.type === LogType.OUT ? LogType.IN : LogType.OUT;
                    
                    addLog(student, logType);
                    setRecognizedStudent(student);
                    setStatus(RecognitionStatus.SUCCESS);
                    setMessage(`Welcome ${student.name} - Checked ${logType === LogType.IN ? 'IN' : 'OUT'}`);
                } else {
                    setRecognizedStudent(null);
                    setStatus(RecognitionStatus.FAILURE);
                    setMessage('Face not recognized. Please try again.');
                }
            }, 1500); // Simulate recognition time

            setTimeout(() => {
                setStatus(RecognitionStatus.IDLE);
                setMessage('Looking for faces...');
                setRecognizedStudent(null);
            }, 5000); // Reset after 5 seconds
        }, 8000); // Run recognition every 8 seconds

        return () => clearInterval(recognitionInterval);
    }, [addLog, logs, isCameraOn]);
    
    useEffect(() => {
        // Cleanup camera on component unmount
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const getStatusStyles = () => {
        switch (status) {
            case RecognitionStatus.RECOGNIZING: return 'bg-yellow-500 text-white animate-pulse-fast';
            case RecognitionStatus.SUCCESS: return 'bg-green-500 text-white';
            case RecognitionStatus.FAILURE: return 'bg-red-500 text-white';
            default: return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
        }
    };
    
    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Live Recognition Feed</h3>
            <div className="relative aspect-video bg-black rounded-md overflow-hidden flex-grow">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                {!isCameraOn && (
                     <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
                        {isCameraError ? (
                            <>
                                <Icon name="VideoOff" className="w-16 h-16 text-red-400 mb-4" />
                                <p className="text-lg font-semibold">Camera Error</p>
                                <p className="text-center max-w-sm">{message}</p>
                            </>
                        ) : (
                            <>
                                <Icon name="Camera" className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-semibold">Camera is off</p>
                                <button onClick={startCamera} className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors">
                                    Start Camera
                                </button>
                            </>
                        )}
                    </div>
                )}
                 {isCameraOn && (
                     <button onClick={stopCamera} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10">
                         <Icon name="Power" className="w-5 h-5"/>
                     </button>
                 )}
            </div>
            <div className={`p-4 mt-4 rounded-md text-center font-semibold transition-colors ${getStatusStyles()}`}>
                {message}
            </div>
        </div>
    )
}

export default LiveRecognitionFeed;
