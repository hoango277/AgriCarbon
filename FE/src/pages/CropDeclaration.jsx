import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SignatureCanvas from '../components/SignatureCanvas';
import { userAPI, cropAPI } from '../services/api';

const CropDeclaration = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    
    // Form states
    const [declarationForm, setDeclarationForm] = useState({
        area_name: '',
        latitude: null,
        longitude: null,
        area_size: '',
        crop_type: '',
        planting_years: '',
        evidence_image: null
    });
    
    const [commitmentForm, setCommitmentForm] = useState({
        commitment_text: '',
        signature_data: '',
        signer_name: ''
    });

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'farmer') {
                navigate('/');
                return;
            }
            setUser(userInfo);
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDeclarationForm(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (error) => {
                    alert('Không thể lấy vị trí GPS. Vui lòng cho phép truy cập vị trí.');
                }
            );
        } else {
            alert('Trình duyệt không hỗ trợ GPS.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeclarationForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setDeclarationForm(prev => ({
            ...prev,
            evidence_image: e.target.files[0]
        }));
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        try {
            // Create declaration
            const declarationData = { ...declarationForm };
            delete declarationData.evidence_image;
            
            const newDeclaration = await cropAPI.createDeclaration(declarationData);
            
            // Upload evidence if provided
            if (declarationForm.evidence_image) {
                const formData = new FormData();
                formData.append('file', declarationForm.evidence_image);
                await cropAPI.uploadEvidence(newDeclaration.id, formData);
            }
            
            setSelectedDeclaration(newDeclaration);
            setCurrentStep(2);
        } catch (error) {
            alert('Có lỗi xảy ra khi tạo khai báo: ' + error.response?.data?.detail);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        try {
            const commitmentData = {
                ...commitmentForm,
                crop_declaration_id: selectedDeclaration.id
            };
            
            await cropAPI.createCommitment(selectedDeclaration.id, commitmentData);
            setCurrentStep(3);
        } catch (error) {
            alert('Có lỗi xảy ra khi tạo cam kết: ' + error.response?.data?.detail);
        }
    };

    const handleStep3Submit = async () => {
        try {
            await cropAPI.submitDeclaration(selectedDeclaration.id);
            alert('Nộp khai báo thành công! Đang chờ xác nhận từ admin.');
            // Reset form and go back to step 1
            setCurrentStep(1);
            setDeclarationForm({
                area_name: '',
                latitude: null,
                longitude: null,
                area_size: '',
                crop_type: '',
                planting_years: '',
                evidence_image: null
            });
            setCommitmentForm({
                commitment_text: '',
                signature_data: '',
                signer_name: ''
            });
            setSelectedDeclaration(null);
        } catch (error) {
            alert('Có lỗi xảy ra khi nộp khai báo: ' + error.response?.data?.detail);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Layout user={user}>
            <div className="max-w-6xl mx-auto px-4 md:px-0">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Khai báo thông tin cây trồng</h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">Khai báo và quản lý thông tin cây trồng của bạn</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-center space-x-4 md:space-x-8">
                        {/* Step 1 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 1 ? '✓' : '1'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Khai báo</span>
                        </div>
                        
                        <div className="w-8 md:w-16 h-1 bg-gray-300">
                            <div className={`h-full transition-all ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 2 ? '✓' : '2'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Ký Cam Kết</span>
                        </div>
                        
                        <div className="w-8 md:w-16 h-1 bg-gray-300">
                            <div className={`h-full transition-all ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="flex items-center">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                                currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                                {currentStep > 3 ? '✓' : '3'}
                            </div>
                            <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700">Xác nhận</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6">
                    {currentStep === 1 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Thông tin khai báo cây trồng</h3>
                            <form onSubmit={handleStep1Submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Khu vực
                                        </label>
                                        <input
                                            type="text"
                                            name="area_name"
                                            value={declarationForm.area_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diện tích (hecta)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="area_size"
                                            value={declarationForm.area_size}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Loại cây trồng
                                        </label>
                                        <input
                                            type="text"
                                            name="crop_type"
                                            value={declarationForm.crop_type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số năm trồng
                                        </label>
                                        <input
                                            type="number"
                                            name="planting_years"
                                            value={declarationForm.planting_years}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* GPS Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vị trí GPS
                                    </label>
                                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-md text-xs md:text-sm"
                                        >
                                            Lấy vị trí hiện tại
                                        </button>
                                        {declarationForm.latitude && declarationForm.longitude && (
                                            <span className="text-xs md:text-sm text-gray-600">
                                                Lat: {declarationForm.latitude.toFixed(6)}, 
                                                Long: {declarationForm.longitude.toFixed(6)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Evidence Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ảnh minh chứng (tuỳ chọn)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!declarationForm.latitude || !declarationForm.longitude}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 md:px-6 md:py-2 rounded-md text-sm md:text-base font-medium disabled:bg-gray-400"
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Cam kết của nông dân</h3>
                            <form onSubmit={handleStep2Submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nội dung cam kết
                                    </label>
                                    <textarea
                                        name="commitment_text"
                                        value={commitmentForm.commitment_text}
                                        onChange={(e) => setCommitmentForm(prev => ({...prev, commitment_text: e.target.value}))}
                                        rows="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Tôi cam kết thông tin khai báo là chính xác và chịu trách nhiệm trước pháp luật..."
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên người ký
                                    </label>
                                    <input
                                        type="text"
                                        value={commitmentForm.signer_name}
                                        onChange={(e) => setCommitmentForm(prev => ({...prev, signer_name: e.target.value}))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={user?.full_name}
                                        required
                                    />
                                </div>
                                
                                {/* Canvas Signature */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chữ ký
                                    </label>
                                    <SignatureCanvas
                                        onSignatureChange={(signature) => 
                                            setCommitmentForm(prev => ({...prev, signature_data: signature}))
                                        }
                                        width={window.innerWidth > 768 ? 400 : Math.min(window.innerWidth - 100, 300)}
                                        height={200}
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-md text-sm md:text-base font-medium"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!commitmentForm.signature_data}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 md:px-6 md:py-2 rounded-md text-sm md:text-base font-medium disabled:bg-gray-400"
                                    >
                                        Ký cam kết
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Xác nhận và nộp khai báo</h3>
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Xác nhận thông tin
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>Vui lòng kiểm tra lại tất cả thông tin trước khi nộp. Sau khi nộp, bạn sẽ không thể chỉnh sửa và cần chờ admin xác nhận.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Thông tin khai báo</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Khu vực:</span> {declarationForm.area_name}</p>
                                            <p><span className="font-medium">Diện tích:</span> {declarationForm.area_size} hecta</p>
                                            <p><span className="font-medium">Loại cây:</span> {declarationForm.crop_type}</p>
                                            <p><span className="font-medium">Số năm trồng:</span> {declarationForm.planting_years} năm</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Thông tin cam kết</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Người ký:</span> {commitmentForm.signer_name}</p>
                                            <p><span className="font-medium">Chữ ký:</span> Đã ký</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-md text-sm md:text-base font-medium"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleStep3Submit}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 md:px-6 md:py-2 rounded-md text-sm md:text-base font-medium"
                                    >
                                        NỘP
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </Layout>
    );
};

export default CropDeclaration;