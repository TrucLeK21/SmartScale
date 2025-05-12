import express from "express";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();
const _baseUrl = "https://api.anthropic.com/v1/messages";
const _apiVersion = "2023-06-01";
const _model = "claude-3-5-sonnet-20241022";
const _maxTokens = 5000;
const _claudeKey = process.env.ANTHROPIC_API_KEY;

function buildPrompt(userData) {
    console.log(userData);
    const record = userData.records.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-1)[0];

    const activityLevels = {
        1.2: "Ít vận động (ngồi nhiều, ít đi lại)",
        1.375: "Vận động nhẹ (đi bộ nhẹ, ít tập luyện)",
        1.55: "Vận động vừa (tập thể thao 3-5 ngày/tuần)",
        1.725: "Vận động nhiều (tập thể thao 6-7 ngày/tuần)",
        1.9: "Vận động rất nhiều (tập nặng, vận động viên)"
    };

    const activityDescription = activityLevels[userData.activityFactor] || "Không rõ";

    const prompt = `
Bạn là một chuyên gia về **dinh dưỡng, thể hình và sức khoẻ tổng quát**. Dưới đây là thông tin của một người dùng, hãy phân tích dữ liệu và tạo ra **kế hoạch cá nhân hóa** bao gồm tổng quan sức khoẻ, khuyến nghị dinh dưỡng và tập luyện. Kết quả phải ở dạng **JSON** đúng chuẩn, như ví dụ được yêu cầu.

## Thông tin người dùng:
- Họ tên: ${userData.fullName || "Không có"}
- Tuổi: ${record.age}
- Giới tính: ${userData.gender}
- Chủng tộc: ${userData.race}
- Chiều cao: ${record.height} cm
- Cân nặng: ${record.weight} kg
- Tỷ lệ mỡ cơ thể: ${record.fatPercentage}%
- Khối lượng cơ: ${record.muscleMass} kg
- Tỷ lệ nước: ${record.waterPercentage}%
- Khối lượng xương: ${record.boneMass} kg
- Tỷ lệ protein trong cơ thể: ${record.proteinPercentage}%
- Mỡ nội tạng: ${record.visceralFat}
- BMI: ${record.bmi}
- BMR: ${record.bmr}
- TDEE: ${record.tdee}
- LBM (khối nạc không mỡ): ${record.lbm}
- Cân nặng lý tưởng: ${record.idealWeight} kg
- Mức độ vận động: ${activityDescription}

## Yêu cầu phản hồi:
Hãy trả lời với định dạng JSON sau, với nội dung chi tiết và hợp lý dựa trên dữ liệu:

\`\`\`json
{
    "overview": "Tóm tắt chung về tình trạng sức khoẻ và thể hình, BMI, mỡ, cơ, những điểm mạnh/yếu nên chú ý.",
    "diet": {
        "calories": {
            "maintain": "... kcal/ngày",
            "cut": "... kcal/ngày (giảm mỡ)",
            "bulk": "... kcal/ngày (tăng cơ)"
        },
        "macros": {
            "protein": "...g (xg/kg cân nặng) - nguồn thực phẩm gợi ý",
            "carbs": "...% (...g) - nguồn thực phẩm gợi ý",
            "fats": "...% (...g) - chất béo tốt nên dùng"
        },
        "supplements": "Đưa ra nếu có: uống đủ nước, bổ sung omega-3, thiếu protein, vitamin,..."
    },
    "workout": {
        "cardio": "Thời lượng mỗi ngày, loại hình như chạy bộ, đạp xe",
        "strength": [
            "Tên bài tập cụ thể, ví dụ: Squat 4x8-12, Bench Press 4x8-12, ...",
            "Gợi ý cho từng nhóm cơ chính"
        ],
        "frequency": "Số buổi/tuần phù hợp theo mục tiêu",
        "note": "Ghi chú thêm: ví dụ tập trung vào compound, giảm cardio nếu muốn tăng cơ, v.v..."
    }
}
\`\`\`

Chỉ trả về JSON, không kèm giải thích bên ngoài. Đảm bảo các gợi ý đều **thực tế, dễ hiểu và áp dụng được ngay**.
    `.trim();

    return prompt;
}
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-api-key': _claudeKey,
        'anthropic-version': _apiVersion
    };
}
function getRequestBody(messages) {
    return JSON.stringify({
        model: _model,
        messages: [{"role" : "user", "content": [{"type": "text", "text": messages}]}],
        max_tokens: _maxTokens
    });
}


router.post('/generate-advice', async (req, res) => {
  const userData = req.body.user_data;
    console.log(userData);

  const prompt = buildPrompt(userData);
  try {
    const response = await fetch(_baseUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: getRequestBody(prompt)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: `Claude API error: ${response.statusText}`
      });
    }

    const data = await response.json();
    res.status(200).json({
      message: data.content?.[0]?.text || "No content received from Claude."
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  }
});


export default router;