import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import './CardComponent.css'

interface CardProps {
  imageUrl: string;
  title: string;
  navigateTo: string;
}

const CardComponent: React.FC<CardProps> = ({ imageUrl, title, navigateTo }) => {
  const navigate = useNavigate();

  return (
      <Card className="cardButton" onClick={() => navigate(navigateTo)}>
        <div className="d-flex flex-column align-items-center gap-3">
            <Card.Img
              src={imageUrl}
              alt={title}
              style={{ height: "150px", width: "auto", objectFit: "contain" }}
            />
            <Card.Body className="p-0">
              <Card.Title className="cardTitle">{title}</Card.Title>
            </Card.Body>
        </div>
      </Card>
  );
};

export default CardComponent;
