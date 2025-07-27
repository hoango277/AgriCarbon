import google.generativeai as genai
from PIL import Image
import io
import json
from configs.settings import settings
from schemas.user import CCCDInfo
from fastapi import HTTPException

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def extract_cccd_info(self, front_image_bytes: bytes, back_image_bytes: bytes) -> CCCDInfo:
        try:
            # Convert bytes to PIL Image
            front_image = Image.open(io.BytesIO(front_image_bytes))
            back_image = Image.open(io.BytesIO(back_image_bytes))
            
            # Prompt for extracting info from front side
            front_prompt = """
            Đây là ảnh mặt trước của CCCD/CMND. Hãy trích xuất các thông tin sau và trả về dạng JSON:
            - full_name: Họ và tên
            - birth_date: Ngày sinh (format: YYYY-MM-DD)
            - gender: Giới tính (Nam/Nữ)
            - cccd: Số CCCD/CMND
            - hometown: Quê quán (thường nằm ở dòng trên cùng của địa chỉ)
            - current_address: Nơi thường trú (thường nằm ở dòng dưới cùng của địa chỉ, không phải quê quán)

            Lưu ý: 
            - Đảm bảo phân biệt rõ giữa quê quán và nơi thường trú. 
            - Quê quán là nơi có thể liên quan đến quê gốc, trong khi nơi thường trú là địa chỉ hiện tại.
            - Chỉ trả về JSON, không giải thích gì thêm.
            """

            # Prompt for extracting info from back side
            back_prompt = """
            Đây là ảnh mặt sau của CCCD/CMND. Hãy trích xuất các thông tin sau và trả về dạng JSON:
            - issue_date: Ngày cấp (format: YYYY-MM-DD)
            - issue_place: Nơi cấp
            
            Chỉ trả về JSON, không giải thích gì thêm.
            """
            
            # Process front side
            front_response = self.model.generate_content([front_prompt, front_image])
            front_data = self._parse_json_response(front_response.text)
            
            # Process back side
            back_response = self.model.generate_content([back_prompt, back_image])
            back_data = self._parse_json_response(back_response.text)
            
            # Combine data
            cccd_data = {**front_data, **back_data}
            
            # Validate and return
            return CCCDInfo(**cccd_data)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Không thể xử lý ảnh CCCD: {str(e)}")
    
    def _parse_json_response(self, response_text: str) -> dict:
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            # Find JSON content
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            return json.loads(cleaned_text.strip())
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError("Không thể parse JSON từ response")

gemini_service = GeminiService() 