import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import './CardComponent.css'

interface CardProps {
  imageUrl: string;
  title: string;
  navigateTo: string;
  callback?: () => void; // Optional prop for sound function
}

const CardComponent: React.FC<CardProps> = ({ imageUrl, title, navigateTo, callback }) => {
  const navigate = useNavigate();

  return (
      <Card 
        className="cardButton"
        onClick={() => {
          if (callback) callback(); // Run callback if function is provided
          navigate(navigateTo)
        }}
      >
        <div className="d-flex flex-column align-items-center gap-3">
            <Card.Img
              src={imageUrl}
              alt={title}
              style={{ height: "150px", width: "auto", objectFit: "contain" }}
            />
            <Card.Body className="p-0 px-3 text-center" style={{height: "50px"}}>
              <Card.Title className="cardTitle">{title}</Card.Title>
            </Card.Body>
        </div>
      </Card>
  );
};

export default CardComponent;
