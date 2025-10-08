import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/loading-animation.json";

type LoadingScreenProps = {
  message?: string;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Processing, please wait...",
}) => {
  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center">
      <Lottie
        animationData={loadingAnimation}
        loop
        style={{ height: 150, width: 150 }}
      />
      <p className="mt-4 text-lg font-medium text-white fs-4">{message}</p>
    </div>
  );
};

export default LoadingScreen;
