import express from "express";
import dotenv from "dotenv";
import protect from "../middleware/middleware.js";
dotenv.config();
import rateLimit from 'express-rate-limit';


const router = express.Router();
const _baseUrl = "https://api.anthropic.com/v1/messages";
const _apiVersion = "2023-06-01";
const _model = "claude-3-haiku-20240307";
const _maxTokens = 1024;
const _claudeKey = process.env.ANTHROPIC_API_KEY;

function buildPrompt(userData) {
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
    messages: [{ "role": "user", "content": [{ "type": "text", "text": messages }] }],
    max_tokens: _maxTokens
  });
}

// Rate limit cơ bản cho endpoint AI
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 30, // tối đa 30 requests / phút cho 1 IP 
  message: { error: 'Too many requests, please slow down.' }
});

function buildSystemPrompt(profile, record) {
  const prompt = `
Bạn hãy vào vai là một chuyên gia về dinh dưỡng, thể hình và sức khỏe tổng quát.  
Hãy trả lời câu hỏi của người dùng dựa trên các thông tin và chỉ số sức khỏe dưới đây.

## Thông tin người dùng:
- Giới tính: ${profile?.gender || 'Không rõ'}
- Chủng tộc: ${profile?.race || 'Không rõ'}
- Mức độ vận động: ${profile?.activityFactor || 'Không rõ'}

## Các chỉ số sức khỏe gần nhất:
- Tuổi: ${record?.age || 'Không rõ'}
- Chiều cao: ${record?.height || 'Không rõ'} cm
- Cân nặng: ${record?.weight || 'Không rõ'} kg
- Tỷ lệ mỡ cơ thể: ${record?.fatPercentage || 'Không rõ'}%
- Khối lượng cơ: ${record?.muscleMass || 'Không rõ'} kg
- Tỷ lệ nước: ${record?.waterPercentage || 'Không rõ'}%
- Khối lượng xương: ${record?.boneMass || 'Không rõ'} kg
- Tỷ lệ protein trong cơ thể: ${record?.proteinPercentage || 'Không rõ'}%
- Mỡ nội tạng: ${record?.visceralFat || 'Không rõ'}
- BMI: ${record?.bmi || 'Không rõ'}
- BMR: ${record?.bmr || 'Không rõ'}
- TDEE: ${record?.tdee || 'Không rõ'}
- LBM (khối nạc không mỡ): ${record?.lbm || 'Không rõ'}
- Cân nặng lý tưởng: ${record?.idealWeight || 'Không rõ'} kg

### Thang đo mức độ vận động tham khảo:
- 1.2: Ít vận động (ngồi nhiều, ít đi lại)
- 1.375: Vận động nhẹ (đi bộ nhẹ, ít tập luyện)
- 1.55: Vận động vừa (tập thể thao 3-5 ngày/tuần)
- 1.725: Vận động nhiều (tập thể thao 6-7 ngày/tuần)
- 1.9: Vận động rất nhiều (tập nặng, vận động viên)

## Hướng dẫn trả lời:
- Hãy trả lời ngắn ngọn, tổng quát và rõ ràng
- Nếu người dùng hỏi những câu không liên quan đến sức khỏe, hãy trả lời: 
  "Xin lỗi, câu hỏi của bạn không nằm trong chuyên môn của tôi."
`;

  return prompt;
}



router.post('/generate-advice', aiLimiter, async (req, res) => {
  const userData = req.body.user_data;

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







router.post('/chat', protect, aiLimiter, async (req, res) => {
  const { profile, record, messages } = req.body;

  try {
    const response = await fetch(_baseUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        'model': _model,
        'system': buildSystemPrompt(profile, record),
        'messages': messages,
        'max_tokens': _maxTokens,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
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