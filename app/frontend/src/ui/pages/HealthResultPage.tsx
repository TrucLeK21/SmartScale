import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import QRCodePage from './QRCodePage';
import AIPage from './AIPage';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faDatabase, faDna } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import useHealthStore from '../hooks/healthStore';
import { showToast } from '../utils/toastUtils';
import HealthMetrics from '../components/HealthMetrics';

// const mockData = {
//     height: 175,
//     weight: 67.5,
//     date: new Date("2025-04-10"),
//     age: 22,
//     bmi: 21.97,
//     bmr: 1580,
//     tdee: 2450,
//     lbm: 54.8,
//     fatPercentage: 17.0,
//     waterPercentage: 59.0,
//     boneMass: 3.1,
//     muscleMass: 43.0,
//     proteinPercentage: 18.5,
//     visceralFat: 8,
//     idealWeight: 68.0,
//     overviewScore: {
//         "status": "Bình thường",
//         "evaluation": [
//             "BMI (22.96): Bình thường - Cân nặng của bạn trong mức khỏe mạnh",
//             "Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định",
//             "Giới tính: Nam - Thường có cơ bắp nhiều hơn",
//             "Chủng tộc: asian - Áp dụng ngưỡng sức khỏe phù hợp"
//         ],
//         "recommendations": [
//             "Duy trì chế độ ăn uống và vận động hợp lý"
//         ],
//         "overall_status": "Sức khỏe tổng quan: Tốt - Tiếp tục duy trì lối sống lành mạnh"
//     }
// };

const HealthResultPage: React.FC = () => {
  const navigate = useNavigate();

  // const record = mockData;
  // const isComplete = true;

  // useHealthStore(state => state.set ({
  //   record: mockData
  // }))
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(false);
  const [isEnd, setIsEnd] = useState(true);

  const record = useHealthStore(state => state.getRecord());
  const isComplete = useHealthStore(state => state.isComplete);

  const onSwiper = (swiper: SwiperType | null) => {
    if (!swiper) return; // Exit early if swiper is null

    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);

    swiper.on('slideChange', () => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    });
};

  useEffect(() => {
      // Check if the user has completed the health record
      if (!isComplete) {
          showToast.error("Health record is incomplete. Redirecting to input page.");
      }
  }, [isComplete]);

  const styles: { [key: string]: React.CSSProperties } = {
    swiperWrapperContainer: {
      position: 'relative',
      height: '100%',
    },
    swiperContainer: {
      width: '100%',
    },
    swiperButtonPrevCustom: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      width: '50px',
      height: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(6px)',
      color: '#5f55e8',
      fontSize: '24px',
      borderRadius: '50px 0 0 50px',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      left: 0,
    },
    swiperButtonNextCustom: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      width: '50px',
      height: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(6px)',
      color: '#5f55e8',
      fontSize: '24px',
      borderRadius: '0 50px 50px 0',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      right: 0,
    },
  };

  return (
    <div style={styles.swiperWrapperContainer}>
      <Swiper
        modules={[Navigation, EffectCoverflow]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        effect="coverflow"
        initialSlide={1}
        slidesPerView={1}
        spaceBetween={50}
        onSwiper={onSwiper}
        style={{
          height: '100%',
        }}
      >
        <SwiperSlide>
          <QRCodePage />
        </SwiperSlide>
        <SwiperSlide>
          <div className="container-fluid d-flex flex-column align-items-center"
          style={{ height: "100%" }}>
              {record ? (
                  <>
                      <HealthMetrics data={record} />
                      <div className="mt-3 d-flex justify-content-center align-items-center gap-3">
                        <button className="custom-btn fs-5" onClick={() => swiperRef.current?.slidePrev()}>
                          Lưu bản ghi <FontAwesomeIcon icon={faDatabase} />
                        </button>
                          <button className="custom-btn fs-5 complete-btn" onClick={() => navigate("/")}><FontAwesomeIcon icon={faCheck} /></button>
                          <button className="custom-btn fs-5" onClick={() => swiperRef.current?.slideNext()}>
                            Tư vấn AI <FontAwesomeIcon icon={faDna} />
                          </button>
                      </div>
                  </>
              ) : (
                  <div className="alert alert-danger mt-4 text-center" role="alert">
                      Không tìm thấy dữ liệu sức khỏe. Vui lòng quay lại và nhập thông tin.
                  </div>
              )}
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <AIPage />
        </SwiperSlide>
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div
        className="swiper-button-prev-custom"
        style={{
          ...styles.swiperButtonPrevCustom,
          visibility: isBeginning ? 'hidden' : 'visible',
          pointerEvents: isBeginning ? 'none' : 'auto',
        }}
      >
        <FontAwesomeIcon icon={faAngleLeft} />
      </div>

      <div
        className="swiper-button-next-custom"
        style={{
          ...styles.swiperButtonNextCustom,
          visibility: isEnd ? 'hidden' : 'visible',
          pointerEvents: isEnd ? 'none' : 'auto',
        }}
      >
        <FontAwesomeIcon icon={faAngleRight} />
      </div>

    </div>
  );
};

export default HealthResultPage;