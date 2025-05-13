import requests
import time
from playsound import playsound

# Thay thế bằng API Key của bạn
API_KEY = "pBpLkepkK4A2YJbaM19MQRmtyidzc2Zi"

# Endpoint API Text-to-Speech (TTS) của Zalo
url = "https://api.zalo.ai/v1/tts/synthesize"


# tts_message = (
#     "Xin chào! Hệ thống nhận diện bạn là {gioi_tinh}, thuộc chủng tộc {chung_toc}. "
#     "Độ tuổi ước tính của bạn là {do_tuoi} tuổi. "
#     "Chiều cao của bạn là {chieu_cao} cm và cân nặng của bạn là {can_nang} kg."
# )

tts_message = "Hãy đứng thẳng người, đưa mặt vào khung xanh và giữ yên trong 3 giây. "

tts_message = tts_message.format(
    gioi_tinh="nam",
    chung_toc="châu Á",
    do_tuoi=25,
    chieu_cao=175,
    can_nang=70
)

print(tts_message)

# Dữ liệu đầu vào, văn bản cần chuyển thành giọng nói
data = {
    "input": tts_message,
    "speaker_id": "1",
    "speed": 1
}

# Thêm API Key vào header
headers = {
    "apikey": API_KEY
}

# Gửi request đến API với dữ liệu URL-encoded
response = requests.post(url, headers=headers, data=data)

# Kiểm tra và xử lý phản hồi
if response.status_code == 200:
    result = response.json()
    # Kiểm tra nếu không có lỗi trong kết quả trả về
    if result["error_code"] == 0:
        # Lấy URL của file âm thanh từ phản hồi
        audio_url = result["data"]["url"]
        
        # Số lần thử lại khi tải file thất bại
        retries = 3
        for attempt in range(retries):
            print(f"Đang thử tải file, lần {attempt + 1}...")
            # Tải file âm thanh từ URL
            audio_data = requests.get(audio_url)
            
            # Kiểm tra mã trạng thái HTTP của yêu cầu tải file
            if audio_data.status_code == 200:
                # Kiểm tra xem file có kích thước hợp lý không
                if len(audio_data.content) > 0:
                    audio_file = "output.wav"
                    
                    # Lưu file âm thanh vào máy
                    with open(audio_file, "wb") as f:
                        f.write(audio_data.content)
                    print("Tải âm thanh thành công!")
                    
                    try:
                        print("Đang phát âm thanh...")
                        playsound(audio_file)
                    except Exception as e:
                        print("Lỗi khi phát âm thanh:", e)
                    
                    break  # Thoát khỏi vòng lặp nếu tải thành công
                else:
                    print("File tải về không có nội dung hợp lệ.")
            else:
                print(f"Lỗi khi tải file: {audio_data.status_code}")
            
            # Nếu không tải được, thử lại sau một khoảng thời gian
            if attempt < retries - 1:
                print("Đang thử lại sau 2 giây...")
                time.sleep(2)
        else:
            print("Tải file không thành công sau nhiều lần thử.")
    else:
        print(f"Lỗi: {result['error_message']}")
else:
    print(f"Lỗi khi gọi API: {response.status_code}")
