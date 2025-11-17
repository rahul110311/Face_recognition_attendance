import React, { useState, useMemo } from 'react';
import { MOCK_STUDENTS } from '../../constants';
import { Student } from '../../types';
import { Icon } from '../ui/Icon';
import Modal from '../ui/Modal';

const StudentsListPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [searchTerm, setSearchTerm] = useState('');

    type ModalType = 'add' | 'view' | 'edit' | 'delete' | 'closed';
    interface ModalState {
        type: ModalType;
        student: Student | null;
    }
    const [modalState, setModalState] = useState<ModalState>({ type: 'closed', student: null });

    const [formData, setFormData] = useState({ name: '', usn: '', dpt: '' });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.dpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, students]);

    const resetForm = () => {
        setFormData({ name: '', usn: '', dpt: '' });
        setPhotoPreview(null);
    };

    const handleCloseModal = () => {
        resetForm();
        setModalState({ type: 'closed', student: null });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.usn || !formData.dpt || !photoPreview) {
            alert('Please fill all fields and upload a photo.');
            return;
        }
        const newStudent: Student = { ...formData, avatar: photoPreview };
        setStudents(prev => [newStudent, ...prev]);
        handleCloseModal();
    };
    
    const handleEditStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalState.student) return;

        setStudents(prev => prev.map(s => 
            s.usn === modalState.student!.usn 
            ? { ...formData, avatar: photoPreview || modalState.student!.avatar } 
            : s
        ));
        handleCloseModal();
    };

    const handleDeleteStudent = () => {
        if (!modalState.student) return;
        setStudents(prev => prev.filter(s => s.usn !== modalState.student!.usn));
        handleCloseModal();
    };
    
    const openAddModal = () => {
        resetForm();
        setModalState({ type: 'add', student: null });
    };

    const openViewModal = (student: Student) => {
        setModalState({ type: 'view', student });
    };

    const openEditModal = (student: Student) => {
        setFormData({ name: student.name, usn: student.usn, dpt: student.dpt });
        setPhotoPreview(student.avatar);
        setModalState({ type: 'edit', student });
    };

    const openDeleteModal = (student: Student) => {
        setModalState({ type: 'delete', student });
    };
    
    const getModalTitle = () => {
        switch (modalState.type) {
            case 'add': return 'Add New Student';
            case 'view': return 'Student Details';
            case 'edit': return 'Edit Student';
            case 'delete': return 'Confirm Deletion';
            default: return '';
        }
    };

    const renderModalContent = () => {
        const { type, student } = modalState;

        const StudentForm = (
             <form onSubmit={type === 'add' ? handleAddStudent : handleEditStudent} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Photo</label>
                     <div className="mt-1 flex items-center space-x-4">
                        <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Student preview" className="h-full w-full object-cover" />
                            ) : (
                                <Icon name="Users" className="h-full w-full text-gray-300 dark:text-gray-500 p-4" />
                            )}
                        </span>
                        <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <span>{photoPreview ? 'Change' : 'Upload'} Photo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                     </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                 <div>
                    <label htmlFor="usn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">USN</label>
                    <input type="text" id="usn" name="usn" value={formData.usn} onChange={handleFormChange} required readOnly={type==='edit'} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 read-only:bg-gray-100 dark:read-only:bg-gray-600" />
                </div>
                <div>
                    <label htmlFor="dpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <input type="text" id="dpt" name="dpt" value={formData.dpt} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                 <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        {type === 'add' ? 'Save Student' : 'Update Student'}
                    </button>
                </div>
            </form>
        );

        switch (type) {
            case 'add':
            case 'edit':
                return StudentForm;

            case 'view':
                return student ? (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                             <img src={student.avatar} alt={student.name} className="w-32 h-32 rounded-full object-cover shadow-lg"/>
                        </div>
                        <div><strong>Name:</strong> <span className="text-gray-600 dark:text-gray-300">{student.name}</span></div>
                        <div><strong>USN:</strong> <span className="text-gray-600 dark:text-gray-300">{student.usn}</span></div>
                        <div><strong>Department:</strong> <span className="text-gray-600 dark:text-gray-300">{student.dpt}</span></div>
                         <div className="flex justify-end pt-4">
                             <button onClick={handleCloseModal} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Close</button>
                         </div>
                    </div>
                ) : null;

            case 'delete':
                return student ? (
                    <div>
                        <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete the student <strong className="text-red-500">{student.name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end pt-6 space-x-2">
                            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDeleteStudent} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ) : null;
            
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Students</h1>
                <button
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Icon name="Plus" className="w-5 h-5 mr-2" />
                    Add Student
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                     <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Icon name="Search" className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 font-semibold">Photo</th>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">USN</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.usn} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4">
                                        <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                                    </td>
                                    <td className="p-4 font-medium">{student.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{student.usn}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{student.dpt}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2 justify-center">
                                            <button onClick={() => openViewModal(student)} className="p-2 text-gray-500 hover:text-primary-500 transition-colors" aria-label={`View details for ${student.name}`}><Icon name="Eye" /></button>
                                            <button onClick={() => openEditModal(student)} className="p-2 text-gray-500 hover:text-yellow-500 transition-colors" aria-label={`Edit ${student.name}`}><Icon name="Edit" /></button>
                                            <button onClick={() => openDeleteModal(student)} className="p-2 text-gray-500 hover:text-red-500 transition-colors" aria-label={`Delete ${student.name}`}><Icon name="Trash2" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredStudents.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <Icon name="Users" className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold">No students found.</p>
                        <p className="text-sm">Try adjusting your search or add a new student.</p>
                    </div>
                 )}
            </div>
            
             <Modal title={getModalTitle()} isOpen={modalState.type !== 'closed'} onClose={handleCloseModal}>
                {renderModalContent()}
             </Modal>
        </div>
    );
};

export default StudentsListPage;
