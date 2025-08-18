import { useState, useEffect } from 'react';
import SignatureCanvas from '../components/SignatureCanvas';
import Layout from '../components/Layout';
import { promotionAPI } from '../services/api';

const PromotionRegister = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // Check if user is company
                const companyToken = localStorage.getItem('company_token');
                if (companyToken) {
                    const companyData = localStorage.getItem('company_data');
                    if (companyData) {
                        const parsedData = JSON.parse(companyData);
                        setUser({ ...parsedData, role: 'company' });
                    }
                } else {
                    // Check if regular user
                    const token = localStorage.getItem('token');
                    if (token) {
                        try {
                            const response = await fetch('/api/user/profile', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                                const userData = await response.json();
                                setUser(userData);
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    }
                }

                // Check for extension data from Company History
                const extendData = localStorage.getItem('extend_registration_data');
                if (extendData) {
                    try {
                        const parsedExtendData = JSON.parse(extendData);
                        console.log('Found extension data:', parsedExtendData);
                        
                        // Pre-fill form with extension data - mapping backend fields to frontend form fields
                        setFormData(prevData => ({
                            ...prevData,
                            companyName: parsedExtendData.company_name || '',
                            taxCode: parsedExtendData.business_license || '', // business_license -> taxCode
                            headquarters: parsedExtendData.address || '', // address -> headquarters
                            implementationArea: parsedExtendData.project_area ? String(parsedExtendData.project_area) : '', // project_area -> implementationArea
                            coordinates: parsedExtendData.project_location || '', // project_location -> coordinates
                            monitoringPackage: parsedExtendData.project_description || '', // project_description -> monitoringPackage
                            phone: parsedExtendData.phone || '',
                            email: parsedExtendData.email || '',
                            representativeName: parsedExtendData.representative_name || '',
                            representativePhone: parsedExtendData.representative_phone || '',
                            representativeEmail: parsedExtendData.representative_email || ''
                        }));
                        
                        // Clear the extension data after using it
                        localStorage.removeItem('extend_registration_data');
                        console.log('Form pre-filled with extension data');
                    } catch (error) {
                        console.error('Error parsing extension data:', error);
                        localStorage.removeItem('extend_registration_data');
                    }
                }
            } catch (error) {
                console.error('Error in fetchUserData:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const [formData, setFormData] = useState({
        companyName: '',
        taxCode: '',
        headquarters: '',
        phone: '',
        email: '',
        representativeName: '',
        // passportVisa: '',
        representativePhone: '',
        representativeEmail: '',
        implementationArea: '',
        coordinates: '',
        monitoringPackage: ''
    });
    
    const [signature, setSignature] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [hasReadTermsPreviously, setHasReadTermsPreviously] = useState(false);

    const handleNextStep = () => {
        if (step === 1) {
            // Validate step 1
            if (!formData.companyName || !formData.taxCode || !formData.headquarters || 
                !formData.representativeName || !formData.implementationArea ||
                !formData.coordinates || !formData.monitoringPackage) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
        }
        if (step === 2) {
            // Validate step 2
            if (!agreed) {
                alert('Vui lòng đọc và chấp thuận các điều khoản cam kết!');
                return;
            }
            if (!signature) {
                alert('Vui lòng ký tên xác nhận!');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };

    const monitoringPackages = [
        { value: '6', label: '6 tháng' },
        { value: '12', label: '12 tháng' },
        { value: '24', label: '24 tháng' }
    ];

    const commitments = [
        "Cam kết tuân thủ các tiêu chuẩn quốc tế về carbon credit (Verra, Gold Standard)",
        "Thực hiện đúng quy trình đánh giá và giám sát dự án theo quy định",
        "Cung cấp thông tin chính xác và minh bạch về hoạt động của tổ chức",
        "Hỗ trợ phát triển bền vững các dự án carbon tại Việt Nam",
        "Tuân thủ các quy định pháp luật về môi trường và khí hậu"
    ];

    const allTerms = [
        {
            section: "Điều khoản cam kết dịch vụ",
            items: [
                {
                    title: "Cam kết tuân thủ tiêu chuẩn quốc tế",
                    content: "Cam kết tuân thủ các tiêu chuẩn quốc tế về carbon credit (Verra, Gold Standard) và các quy định về chất lượng dịch vụ. Đảm bảo mọi hoạt động đều được thực hiện theo đúng các chuẩn mực được quốc tế công nhận."
                },
                {
                    title: "Quy trình đánh giá và giám sát",
                    content: "Thực hiện đúng quy trình đánh giá và giám sát dự án theo quy định. Tuân thủ các bước kiểm tra, đánh giá chất lượng và báo cáo định kỳ để đảm bảo hiệu quả dự án."
                },
                {
                    title: "Minh bạch thông tin",
                    content: "Cung cấp thông tin chính xác và minh bạch về hoạt động của tổ chức. Cam kết công khai các báo cáo, kết quả đánh giá và tiến độ thực hiện dự án một cách trung thực."
                },
                {
                    title: "Phát triển bền vững",
                    content: "Hỗ trợ phát triển bền vững các dự án carbon tại Việt Nam. Đóng góp tích cực vào mục tiêu giảm phát thải khí nhà kính và bảo vệ môi trường của quốc gia."
                },
                {
                    title: "Tuân thủ pháp luật môi trường",
                    content: "Tuân thủ các quy định pháp luật về môi trường và khí hậu. Đảm bảo mọi hoạt động đều phù hợp với luật pháp Việt Nam và các cam kết quốc tế về biến đổi khí hậu."
                }
            ]
        },
        {
            section: "Điều khoản thanh toán ưu đãi",
            items: [
                {
                    title: "Ưu đãi dành cho khách hàng mới",
                    content: "Chương trình ưu đãi đặc biệt dành cho khách hàng đăng ký lần đầu với mức giảm giá lên đến 30% cho gói giám sát 12 tháng và 50% cho gói 24 tháng."
                },
                {
                    title: "Điều kiện áp dụng ưu đãi",
                    content: "Ưu đãi chỉ áp dụng cho doanh nghiệp có diện tích triển khai từ 10ha trở lên và cam kết duy trì hợp tác trong thời gian tối thiểu theo gói đã đăng ký."
                },
                {
                    title: "Thanh toán và bảo mật",
                    content: "Thanh toán qua mã QR được bảo mật cao, không hoàn lại sau khi giao dịch thành công. Khách hàng cần kiểm tra kỹ thông tin trước khi thanh toán."
                },
                {
                    title: "Quyền lợi và cam kết",
                    content: "Khách hàng được hưởng đầy đủ quyền lợi của gói dịch vụ đã đăng ký, bao gồm hỗ trợ kỹ thuật 24/7, báo cáo định kỳ và tư vấn chuyên môn miễn phí."
                }
            ]
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignatureChange = (signatureData) => {
        setSignature(signatureData);
    };

    // Handle scroll tracking trong modal
    const handleScroll = (e) => {
        const element = e.target;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(Math.max(scrolled, 0), 100));
        
        // Cho phép tick khi scroll đến 90% cuối trang
        if (scrolled >= 90) {
            setHasReadTerms(true);
        }
    };

    const openTermsModal = () => {
        setShowTermsModal(true);
        setScrollProgress(0);
        setHasReadTerms(hasReadTermsPreviously);
    };

    const closeTermsModal = () => {
        if (hasReadTerms || hasReadTermsPreviously) {
            setShowTermsModal(false);
        } else {
            alert('Vui lòng đọc hết các điều khoản trước khi đóng popup!');
        }
    };

    const cancelTermsModal = () => {
        setShowTermsModal(false);
        if (!hasReadTermsPreviously) {
            setHasReadTerms(false);
            setScrollProgress(0);
        }
    };

    const handleAgreeTerms = () => {
        if (hasReadTerms) {
            setAgreed(true);
            setHasReadTermsPreviously(true);
            setShowTermsModal(false);
        } else {
            alert('Vui lòng đọc hết các điều khoản trước khi đồng ý!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.companyName || !formData.taxCode || !formData.headquarters || 
            !formData.representativeName || !formData.implementationArea ||
            !formData.coordinates || !formData.monitoringPackage) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (!signature) {
            alert('Vui lòng ký tên xác nhận!');
            return;
        }

        if (!agreed) {
            alert('Vui lòng đọc và chấp thuận các điều khoản cam kết!');
            return;
        }

        setSubmitting(true);

        try {
            // Prepare data for API
            const registrationData = {
                company_name: formData.companyName,
                business_license: formData.taxCode,
                address: formData.headquarters,
                phone: formData.phone || '',
                email: formData.email || '',
                representative_name: formData.representativeName,
                representative_position: 'Đại diện',
                representative_phone: formData.representativePhone || '',
                representative_email: formData.representativeEmail || '',
                project_name: `Dự án carbon tại ${formData.implementationArea}`,
                project_location: formData.coordinates,
                project_area: parseFloat(formData.implementationArea) || 0,
                project_description: `Gói theo dõi: ${formData.monitoringPackage}`,
                signature_data: signature,
                terms_accepted: agreed
            };

            // Call API to create registration
            const response = await promotionAPI.createRegistration(registrationData);
            
            if (response) {
                alert('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.');
                
                // Reset form
                setFormData({
                    companyName: '',
                    taxCode: '',
                    headquarters: '',
                    phone: '',
                    email: '',
                    representativeName: '',
                    // passportVisa: '',
                    representativePhone: '',
                    representativeEmail: '',
                    implementationArea: '',
                    coordinates: '',
                    monitoringPackage: ''
                });
                setSignature('');
                setAgreed(false);
                setHasReadTerms(false);
                setHasReadTermsPreviously(false);
                setStep(1); // Reset to first step
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại!';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout user={user}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-6 px-8 rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold mb-2">Chương trình ưu đãi đặc biệt</h1>
                        <p className="text-emerald-100 text-lg">Giảm giá lên đến 50% cho gói giám sát Carbon</p>
                        <div className="mt-4 flex justify-center space-x-6 text-sm">
                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Gói 6 tháng:</span> Giá chuẩn
                            </div>
                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Gói 12 tháng:</span> Giảm 30%
                            </div>
                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Gói 24 tháng:</span> Giảm 50%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        <div className={`flex items-center ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 1 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-400'}`}>1</div>
                            <span className="ml-2 font-medium hidden sm:inline">Thông tin</span>
                        </div>
                        <div className={`flex-1 mx-2 sm:mx-4 h-1 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 2 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-400'}`}>2</div>
                            <span className="ml-2 font-medium hidden sm:inline">Cam kết</span>
                        </div>
                        <div className={`flex-1 mx-2 sm:mx-4 h-1 rounded-full ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 3 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-400'}`}>3</div>
                            <span className="ml-2 font-medium hidden sm:inline">Thanh toán</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <>
                                {/* Company Information */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Thông tin doanh nghiệp
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tên doanh nghiệp <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập tên doanh nghiệp"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mã số thuế <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="taxCode"
                                                value={formData.taxCode}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập mã số thuế"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Trụ sở chính <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="headquarters"
                                                value={formData.headquarters}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập địa chỉ trụ sở chính"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Representative Information */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Thông tin người đại diện
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ tên người đại diện <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="representativeName"
                                                value={formData.representativeName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập họ tên người đại diện"
                                                required
                                            />
                                        </div>

                                
                                    </div>
                                </div>

                                {/* Project Information */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Thông tin dự án
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số ha triển khai <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="implementationArea"
                                                value={formData.implementationArea}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập số hecta"
                                                min="0"
                                                step="0.1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gói giám sát <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="monitoringPackage"
                                                value={formData.monitoringPackage}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Chọn gói giám sát</option>
                                                {monitoringPackages.map((pkg) => (
                                                    <option key={pkg.value} value={pkg.value}>
                                                        {pkg.label} {pkg.value === '12' ? '(Giảm 30%)' : pkg.value === '24' ? '(Giảm 50%)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tọa độ <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="coordinates"
                                                value={formData.coordinates}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                placeholder="Nhập tọa độ (VD: 21.0285, 105.8542)"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                {/* Terms and Commitments */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Điều khoản cam kết
                                    </h2>
                                    
                                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                        <h3 className="font-medium text-gray-800 mb-4">Cam kết cơ bản:</h3>
                                        <ul className="space-y-2 mb-6">
                                            {commitments.map((commitment, index) => (
                                                <li key={index} className="flex items-start">
                                                    <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">{commitment}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <button
                                            type="button"
                                            onClick={openTermsModal}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                                        >
                                            Xem chi tiết đầy đủ các điều khoản
                                        </button>
                                        
                                        <div className="mt-4 flex items-center">
                                            <input
                                                type="checkbox"
                                                id="agree-terms"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
                                                Tôi đã đọc và đồng ý với các điều khoản cam kết <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Signature */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Chữ ký xác nhận
                                    </h2>
                                    
                                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Vui lòng ký tên để xác nhận thông tin đăng ký:
                                        </p>
                                        <div className="w-full max-w-md mx-auto">
                                            <SignatureCanvas
                                                onSignatureChange={handleSignatureChange}
                                                width={200}
                                                height={100}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                {/* QR Code Payment */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Thanh toán
                                    </h2>
                                    
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 sm:p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Sử dụng ứng dụng banking để quét mã QR và thực hiện thanh toán
                                                </p>
                                                
                                                {formData.monitoringPackage && (
                                                    <div className="bg-white rounded-lg p-4 border border-emerald-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium">Gói đã chọn:</span>
                                                            <span className="text-emerald-600 font-semibold">
                                                                {monitoringPackages.find(p => p.value === formData.monitoringPackage)?.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-sm font-medium">Ưu đãi:</span>
                                                            <span className="text-red-500 font-semibold">
                                                                {formData.monitoringPackage === '12' ? '-30%' : 
                                                                 formData.monitoringPackage === '24' ? '-50%' : 'Giá chuẩn'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex justify-center">
                                                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-dashed border-emerald-300">
                                                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <div className="text-center">
                                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">QR Code</p>
                                                            <p className="text-xs text-gray-400">Thanh toán</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}


                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                                >
                                    Quay lại
                                </button>
                            )}
                            <div className="flex-grow"></div>
                            {step < 3 && (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                >
                                    Tiếp theo
                                </button>
                            )}
                            {step === 3 && (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`
                                        px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-white transition-all duration-200 transform
                                        ${submitting 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
                                        }
                                    `}
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="hidden sm:inline">Đăng ký và </span>Thanh toán
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Điều khoản và Cam kết Chi tiết
                            </h3>
                            <div className="flex items-center space-x-4">
                                {/* Progress Bar */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Tiến độ đọc:</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${scrollProgress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{Math.round(scrollProgress)}%</span>
                                </div>
                                <button
                                    onClick={cancelTermsModal}
                                    className="text-gray-400 hover:text-gray-600 p-1 sm:p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div 
                            className="flex-1 overflow-y-auto p-4 sm:p-6"
                            onScroll={handleScroll}
                        >
                            {allTerms.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-8">
                                    <h4 className="text-lg font-semibold text-emerald-600 mb-4 border-b border-emerald-200 pb-2">
                                        {section.section}
                                    </h4>
                                    <div className="space-y-4">
                                        {section.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="bg-gray-50 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-800 mb-2">{item.title}</h5>
                                                <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 text-center sm:text-left">
                                {hasReadTerms ? (
                                    <span className="flex items-center text-emerald-600">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Đã đọc hết các điều khoản
                                    </span>
                                ) : (
                                    'Vui lòng cuộn xuống để đọc hết các điều khoản'
                                )}
                            </div>
                            <div className="flex space-x-3 w-full sm:w-auto">
                                <button
                                    onClick={cancelTermsModal}
                                    className="flex-1 sm:flex-none px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAgreeTerms}
                                    disabled={!hasReadTerms}
                                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium ${
                                        hasReadTerms
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Đồng ý các điều khoản
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
            )}
        </Layout>
    );
};

export default PromotionRegister;
