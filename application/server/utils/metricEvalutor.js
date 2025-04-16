const BMI_THRESHOLDS = {
    "asian": { "underweight": 18.5, "normal": 23, "overweight": 27.5, "obese": 27.5 },
    "caucasian": { "underweight": 18.5, "normal": 25, "overweight": 30, "obese": 30 }
}


export function evaluate_bmi(bmi, age, gender, race) {
    const thresholds = BMI_THRESHOLDS[race ? race : "asian"];
    let status, message, recommendation = "";
    if (bmi && age && gender) {


        if (age >= 65) {
            thresholds["normal"] += 1;
            thresholds["overweight"] += 1;
            thresholds["obese"] += 1;
        }

        if (bmi < thresholds["underweight"]) {
            status = "Thiếu cân";
            message = "Bạn có nguy cơ thiếu dinh dưỡng";
            recommendation = "Tăng cân bằng chế độ ăn giàu calo và protein";
        }
        else if (bmi >= thresholds["underweight"] && bmi < thresholds["normal"]) {
            status = "Bình thường";
            message = "Cân nặng của bạn trong mức khỏe mạnh";
            recommendation = null;
        }
        else if (bmi >= thresholds["normal"] && bmi < thresholds["overweight"]) {
            status = "Thừa cân"
            message = "Bạn có nguy cơ về sức khỏe nếu không kiểm soát cân nặng"
            recommendation = "Giảm cân bằng chế độ ăn và tập thể dục"
        }
        else {
            status = "Béo phì"
            message = "Nguy cơ cao về bệnh tim mạch, tiểu đường"
            recommendation = "Tham khảo ý kiến bác sĩ để giảm cân"
        }

        if (gender === "female" && bmi < 18.5) {
            message += " Phụ nữ cần duy trì mức mỡ tối thiểu cho hormone."
            recommendation = "Tăng cân để đảm bảo sức khỏe sinh sản"
        }


    }
    return {
        "status": status,
        "message": message,
        "recommendation": recommendation
    }

}

export function evaluate_bmr(bmr) {
    return `Cần ${bmr} kcal mỗi ngày để duy trì năng lượng cơ bản`;
}

export function evaluate_tdee(tdee) {
    return `Cần ${tdee} kcal mỗi ngày để duy trì cân nặng hiện tại`;
}

export function evaluate_overall_health(bmi, age, gender, race) {
    let bmi_eval = evaluate_bmi(bmi, age, gender, race);
    let evaluation = [`BMI (${bmi}): ${bmi_eval.status} - ${bmi_eval.message}`];
    let recommendations = bmi_eval.recommendation ? [bmi_eval.recommendation] : [];
    let overall_status = "Sức khỏe tổng quan: ";

    if (age < 18) {
        evaluation.push("Độ tuổi: Trẻ - Cần theo dõi sự phát triển cơ thể");
        recommendations.push("Đảm bảo dinh dưỡng cân bằng để phát triển");
    }
    else if (age >= 18 && age < 40) {
        evaluation.push("Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định");
    }
    else if (age >= 40 && age < 65) {
        evaluation.push("Độ tuổi: Trung niên - Nguy cơ bệnh mãn tính tăng");
        recommendations.push("Kiểm tra sức khỏe định kỳ");
    }
    else {
        evaluation.push("Độ tuổi: Cao tuổi - Cần chú ý xương và cơ bắp");
        recommendations.push("Tập thể dục nhẹ và bổ sung canxi");
    }

    if (gender === "male") {
        evaluation.push("Giới tính: Nam - Thường có cơ bắp nhiều hơn");
    }
    else {
        evaluation.push("Giới tính: Nữ - Cần chú ý cân bằng mỡ và cơ");
    }

    evaluation.push(`Chủng tộc: ${race ? race : "asian"} - Áp dụng ngưỡng sức khỏe phù hợp`);

    if (bmi_eval.status.includes("Bình thường") && age < 65) {
        overall_status += "Tốt - Tiếp tục duy trì lối sống lành mạnh";
    } else if (bmi_eval.status.includes("Thiếu cân") || bmi_eval.status.includes("Béo phì")) {
        overall_status += "Cần cải thiện - Có nguy cơ sức khỏe cần điều chỉnh";
    } else {
        overall_status += "Khá ổn - Theo dõi và điều chỉnh nếu cần";
    }

    return {
        "status": bmi_eval.status,
        "evaluation": evaluation,
        "recommendations": recommendations,
        "overall_status": overall_status
    }
}
