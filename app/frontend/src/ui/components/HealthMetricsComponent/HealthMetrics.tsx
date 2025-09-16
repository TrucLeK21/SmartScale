import React from "react";
import { Card, Row, Col, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./HealthMetrics.css";
import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
import { motion } from "framer-motion";

interface HealthMetricsProps {
  data: HealthRecord;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ data }) => {
  const formattedDate = new Date(data.date).toLocaleDateString("en-GB");
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const bmiColorMap: Record<string, string> = {
    "Thiếu cân": "text-primary",
    "Bình thường": "text-success",
    "Thừa cân": "text-warning",
    "Béo phì": "text-danger"
  };

  const explanations: Record<string, string> = {
    "BMI": "Chỉ số BMI cho biết tình trạng cân nặng của bạn (gầy, bình thường, thừa cân...).",
    "BMR": "Tỷ lệ trao đổi chất cơ bản (BMR) là lượng calo cơ thể bạn cần khi nghỉ ngơi.",
    "TDEE": "Tổng năng lượng tiêu hao hàng ngày (TDEE) là tổng lượng calo bạn tiêu hao mỗi ngày dựa trên mức độ vận động.",
    "LBM": "Khối lượng cơ thể không mỡ (LBM) là phần cơ thể không chứa mỡ (cơ, xương, nước...).",
    "Mỡ nội tạng": "Mỡ nội tạng là loại mỡ bao quanh các cơ quan nội tạng, ảnh hưởng đến sức khỏe tim mạch.",
    "Tỷ lệ mỡ cơ thể (%)": "Cho biết phần trăm trọng lượng cơ thể là mỡ. Mức cao có thể gây hại sức khỏe.",
    "Tỷ lệ nước trong cơ thể (%)": "Lượng nước chiếm trong cơ thể, phản ánh mức độ cân bằng và hydrat hóa.",
    "Khối lượng xương (kg)": "Tổng trọng lượng xương trong cơ thể, hỗ trợ đánh giá sức khỏe xương.",
    "Khối lượng cơ (kg)": "Tổng khối lượng cơ bắp, ảnh hưởng đến sức mạnh và trao đổi chất.",
    "Tỷ lệ protein (%)": "Phản ánh lượng protein trong cơ thể, quan trọng cho phát triển cơ và phục hồi.",
    "Cân nặng lý tưởng (kg)": "Mức cân nặng đề xuất dựa trên chiều cao và giới tính, giúp duy trì sức khỏe tối ưu.",
  };

  const metrics = [
    { label: "Chiều cao (cm)", value: data.height },
    { label: "Cân nặng (kg)", value: data.weight },
    { label: "Tuổi", value: data.age },
    { label: "BMI", value: data.bmi },
    { label: "BMR", value: data.bmr },
    { label: "TDEE", value: data.tdee },
    { label: "LBM", value: data.lbm },
    { label: "Tỷ lệ mỡ cơ thể (%)", value: data.fatPercentage },
    { label: "Tỷ lệ nước trong cơ thể (%)", value: data.waterPercentage },
    { label: "Khối lượng xương (kg)", value: data.boneMass },
    { label: "Khối lượng cơ (kg)", value: data.muscleMass },
    { label: "Tỷ lệ protein (%)", value: data.proteinPercentage },
    { label: "Mỡ nội tạng", value: data.visceralFat },
    { label: "Cân nặng lý tưởng (kg)", value: data.idealWeight },
  ];

  return (
    <Container className="px-4 py-3 d-flex flex-column align-items-center">
      <div className="header-section mb-4 text-center text-white">
        <h3>Chỉ Số Sức Khỏe</h3>
        <div className="date-display">Ngày đo: {formattedDate}</div>
      </div>
      <Row xs={4} className="g-4">
        {metrics.map((metric, index) => {
          const explanation = explanations[metric.label];
          const hasExplanation = Boolean(explanation);
          const isBMI = metric.label === "BMI";
          const bmiColorClass = isBMI ? bmiColorMap[data.overviewScore.status] || "" : "";

          return (
            <Col key={index}>
              <Card className="metric-card h-100 position-relative pb-2" style={{ backgroundColor: 'var(--sub-background-color)' }}>
                {!isBMI && hasExplanation && (
                  <OverlayTrigger
                    placement="bottom-end"
                    delay={{ show: 250, hide: 200 }}
                    overlay={<Tooltip id={`tooltip-${index}`}>{explanation}</Tooltip>}
                  >
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', top: 'auto' }} className="info-icon-wrapper">
                      <span className="info-icon fs-5">?</span>
                    </div>
                  </OverlayTrigger>
                )}

                <Card.Body
                  style={{ borderRadius: 15 }}
                  className="w-100 d-flex flex-column align-items-center text-center p-0">
                  <Card.Title
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 15,
                      height: 50
                    }}
                    className="metric-label text-light p-2 w-100 align-items-center d-flex justify-content-center">{metric.label}
                  </Card.Title>
                  {isBMI ? (
                    // Nếu là BMI, sử dụng motion.div với hiệu ứng
                    <motion.div
                      className={`metric-value ${bmiColorClass}`}
                      initial={{ scale: 1 }}
                      animate={{
                        scale: [1, 1.05, 1], // Tạo hiệu ứng pulse
                        opacity: [1, 0.9, 1], // Thêm hiệu ứng mờ nhẹ
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity, // Lặp lại mãi mãi
                        repeatType: "loop", // Lặp lại theo chu kỳ
                      }}
                      onClick={handleShowModal}
                    >
                      {metric.value}
                    </motion.div>
                  ) : (
                    // Nếu không phải BMI, dùng Card.Text bình thường
                    <Card.Text className={`metric-value text-light`}>
                      {metric.value}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal className="overview-modal" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body>
          <div className="evaluation-section mt-4">
            <h4>Tình trạng tổng quan</h4>
            <p>{data.overviewScore.overall_status}</p>
            <h4>Đánh giá chi tiết</h4>
            <ul className="evaluation-list">
              {data.overviewScore.evaluation.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            {(data.overviewScore.recommendations.length !== 0) && <div>
              <h4>Khuyến nghị</h4>
              <ul className="recommendation-list">
                {data.overviewScore.recommendations.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" onClick={() => setShowModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HealthMetrics;

