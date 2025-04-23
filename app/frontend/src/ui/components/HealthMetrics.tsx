import React from "react";
import { Card, Row, Col, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./HealthMetrics.css";

interface HealthMetricsProps {
  data: {
    height: number;
    weight: number;
    date: Date;
    age: number;
    bmi: number;
    bmr: number;
    tdee: number;
    lbm: number;
    fatPercentage: number;
    waterPercentage: number;
    boneMass: number;
    muscleMass: number;
    proteinPercentage: number;
    visceralFat: number;
    idealWeight: number;
  };
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ data }) => {
  const formattedDate = new Date(data.date).toLocaleDateString("en-GB");

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
    <Container className="pt-4 d-flex flex-column align-items-center">
        <div className="header-section mb-4 text-center text-white">
            <h3>Chỉ Số Sức Khỏe</h3>
            <div className="date-display">Ngày đo: {formattedDate}</div>
        </div>
        <Row lg={4}  className="g-4">
            {metrics.map((metric, index) => {
            const explanation = explanations[metric.label];
            const hasExplanation = Boolean(explanation);

            return (
                <Col key={index}>
                    <Card className="metric-card h-100 position-relative">
                        {hasExplanation && (
                            <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 200 }}
                            overlay={
                                <Tooltip id={`tooltip-${index}`}>
                                {explanation}
                                </Tooltip>
                            }
                            >
                            <div className="info-icon-wrapper">
                                <span className="info-icon">?</span>
                            </div>
                            </OverlayTrigger>
                        )}
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                            <Card.Title className="metric-label">{metric.label}</Card.Title>
                            <Card.Text className="metric-value">{metric.value}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            );
            })}
        </Row>
    </Container>
  );
};

export default HealthMetrics;
