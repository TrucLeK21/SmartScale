# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:5123"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def build_prompt(user_data):
    # record = sorted(user_data["records"], key=lambda x: x["date"])[-1]  # Lấy record mới nhất
    record = user_data["records"]

    # Map activityFactor -> mô tả
    activity_levels = {
        1.2: "Ít vận động (ngồi nhiều, ít đi lại)",
        1.375: "Vận động nhẹ (đi bộ nhẹ, ít tập luyện)",
        1.55: "Vận động vừa (tập thể thao 3-5 ngày/tuần)",
        1.725: "Vận động nhiều (tập thể thao 6-7 ngày/tuần)",
        1.9: "Vận động rất nhiều (tập nặng, vận động viên)"
    }
    activity_description = activity_levels.get(user_data.get("activityFactor"), "Không rõ")

    prompt = f"""
    Bạn là một chuyên gia về **dinh dưỡng, thể hình và sức khoẻ tổng quát**. Dưới đây là thông tin của một người dùng, hãy phân tích dữ liệu và tạo ra **kế hoạch cá nhân hóa** bao gồm tổng quan sức khoẻ, khuyến nghị dinh dưỡng và tập luyện. Kết quả phải ở dạng **JSON** đúng chuẩn, như ví dụ được yêu cầu.

    ## Thông tin người dùng:
    - Tuổi: {record.get("age")}
    - Giới tính: {user_data.get("gender")}
    - Chủng tộc: {user_data.get("race")}
    - Chiều cao: {record.get("height")} cm
    - Cân nặng: {record.get("weight")} kg
    - Tỷ lệ mỡ cơ thể: {record.get("fatPercentage")}%
    - Khối lượng cơ: {record.get("muscleMass")} kg
    - Tỷ lệ nước: {record.get("waterPercentage")}%
    - Khối lượng xương: {record.get("boneMass")} kg
    - Tỷ lệ protein trong cơ thể: {record.get("proteinPercentage")}%
    - Mỡ nội tạng: {record.get("visceralFat")}
    - BMI: {record.get("bmi")}
    - BMR: {record.get("bmr")}
    - TDEE: {record.get("tdee")}
    - LBM (khối nạc không mỡ): {record.get("lbm")}
    - Cân nặng lý tưởng: {record.get("idealWeight")} kg
    - Mức độ vận động: {activity_description}

    ## Yêu cầu phản hồi:
    Hãy trả lời với định dạng JSON sau, với nội dung chi tiết và hợp lý dựa trên dữ liệu:
    
    ```json
    {{
        "overview": "Tóm tắt chung về tình trạng sức khoẻ và thể hình, BMI, mỡ, cơ, những điểm mạnh/yếu nên chú ý.",
        "diet": {{
            "calories": {{
                "maintain": "... kcal/ngày",
                "cut": "... kcal/ngày (giảm mỡ)",
                "bulk": "... kcal/ngày (tăng cơ)"
            }},
            "macros": {{
                "protein": "...g (xg/kg cân nặng) - nguồn thực phẩm gợi ý",
                "carbs": "...% (...g) - nguồn thực phẩm gợi ý",
                "fats": "...% (...g) - chất béo tốt nên dùng"
            }},
            "supplements": "Đưa ra nếu có: uống đủ nước, bổ sung omega-3, thiếu protein, vitamin,..."
        }},
        "workout": {{
            "cardio": "Thời lượng mỗi ngày, loại hình như chạy bộ, đạp xe",
            "strength": [
                "Tên bài tập cụ thể, ví dụ: Squat 4x8-12, Bench Press 4x8-12, ...",
                "Gợi ý cho từng nhóm cơ chính"
            ],
            "frequency": "Số buổi/tuần phù hợp theo mục tiêu",
            "note": "Ghi chú thêm: ví dụ tập trung vào compound, giảm cardio nếu muốn tăng cơ, v.v..."
        }}
    }}
    ```

    Chỉ trả về JSON, không kèm giải thích bên ngoài. Đảm bảo các gợi ý đều **thực tế, dễ hiểu và áp dụng được ngay**.
    """.strip()

    return prompt



@app.route('/generate-advice', methods=['POST'])
def generate_advice():
    # Lấy dữ liệu JSON từ yêu cầu
    data = request.get_json()
    user_data = data["user_data"]

    prompt = build_prompt(user_data)

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=5000,
            temperature=0.5,
            system="Bạn là chuyên gia dinh dưỡng và sức khoẻ.",
            messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        )

        reply = response.content[0].text.strip()
        return jsonify({"result": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5005)