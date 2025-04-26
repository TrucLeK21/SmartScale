import { motion } from "framer-motion";

const ClickableCard = () => {
  return (
    <motion.div
      className="clickable-card"
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
      onClick={() => alert("Clicked!")}
      style={{
        width: "200px",
        height: "200px",
        backgroundColor: "#f0f8ff",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <span>Tap here</span>
    </motion.div>
  );
};

export default ClickableCard;
