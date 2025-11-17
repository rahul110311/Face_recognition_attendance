import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceLog, LogType, RecognitionStatus, Student } from '../../types';
import { MOCK_STUDENTS } from '../../constants';
import Card from '../ui/Card';
import { Icon } from '../ui/Icon';
import LiveRecognitionFeed from './LiveRecognitionFeed';
import AttendanceChart from '../charts/AttendanceChart';

const DashboardPage: React.FC = () => {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [todayPresent, setTodayPresent] = useState(0);
    const [todayAbsent, setTodayAbsent] = useState(MOCK_STUDENTS.length);

    const addLog = useCallback((student: Student, type: LogType) => {
        setLogs(prevLogs => [
            { id: Date.now(), student, type, timestamp: new Date() },
            ...prevLogs
        ].slice(0, 100)); // Keep max 100 logs
    }, []);

    useEffect(() => {
        const presentStudents = new Set(
            logs
                .filter(log => log.type === LogType.IN)
                .map(log => log.student.usn)
        );
        const checkedOutStudents = new Set(
             logs
                .filter(log => log.type === LogType.OUT)
                .map(log => log.student.usn)
        );

        // A student is present if they checked in and haven't checked out.
        const presentCount = [...presentStudents].filter(usn => !checkedOutStudents.has(usn)).length;

        setTodayPresent(presentCount);
        setTodayAbsent(MOCK_STUDENTS.length - presentCount);
    }, [logs]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Today Present" value={todayPresent.toString()} icon={<Icon name="UserCheck" className="text-green-500"/>} />
                <Card title="Today Absent" value={todayAbsent.toString()} icon={<Icon name="UserX" className="text-red-500"/>} />
                <Card title="Total Students" value={MOCK_STUDENTS.length.toString()} icon={<Icon name="Users" className="text-blue-500"/>} />
                <Card title="Late Today" value="0" icon={<Icon name="Clock" className="text-yellow-500"/>} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <LiveRecognitionFeed addLog={addLog} logs={logs} />
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
                        <div className="space-y-3 h-96 overflow-y-auto">
                            {logs.length > 0 ? logs.slice(0,10).map(log => (
                                <div key={log.id} className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    <img src={log.student.avatar} alt={log.student.name} className="w-10 h-10 rounded-full"/>
                                    <div className="ml-3 flex-grow">
                                        <p className="font-semibold text-sm">{log.student.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp.toLocaleTimeString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                        log.type === LogType.IN ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    }`}>{log.type === LogType.IN ? 'Checked In' : 'Checked Out'}</span>
                                </div>
                            )) : <p className="text-center text-gray-500 pt-10">No logs yet today.</p>}
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Last 7 Days Attendance</h3>
                        <div className="h-60">
                           <AttendanceChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashboardPage;
