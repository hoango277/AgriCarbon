import { useRef, useEffect, useState } from 'react';

const SignatureCanvas = ({ onSignatureChange, width = 400, height = 200 }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Set drawing styles
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    }, [width, height]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        setIsEmpty(false);
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        onSignatureChange(dataURL);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        setIsEmpty(true);
        onSignatureChange('');
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    return (
        <div className="signature-canvas-container">
            <div className="border-2 border-gray-300 rounded-md p-2 bg-white">
                <canvas
                    ref={canvasRef}
                    className="border border-gray-200 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ display: 'block' }}
                />
            </div>
            <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-600">Vẽ chữ ký của bạn ở trên</p>
                <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

export default SignatureCanvas;