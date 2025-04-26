type Gender = 'male' | 'female';
type Race = 'asian' | 'other';

const BMI_THRESHOLDS: Record<Race | string, {
    underweight: number;
    normal: number;
    overweight: number;
    obese: number;
}> = {
    asian: { underweight: 18.5, normal: 23, overweight: 27.5, obese: 27.5 },
    other: { underweight: 18.5, normal: 25, overweight: 30, obese: 30 },
};


interface HealthRecord {
    date: Date;
    height: number;
    weight: number;
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
    overviewScore: OverallHealthEvaluation;
}

interface BMIEvaluation {
    status: string;
    message: string;
    recommendation: string | null;
}

interface OverallHealthEvaluation {
    status: string;
    evaluation: string[];
    recommendations: string[];
    overall_status: string;
}

// function getAge(dateOfBirth: string | Date): number | null {
//     const today = new Date();
//     const birthDate = new Date(dateOfBirth);
//     if (isNaN(birthDate.getTime()) || birthDate > today) return null;

//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     const dayDiff = today.getDate() - birthDate.getDate();

//     if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
//     return age;
// }

function getBmi(weight: number, height: number): number | null {
    if (weight > 0 && height > 0) {
        const heightM = height / 100;
        return parseFloat((weight / (heightM ** 2)).toFixed(2));
    }
    return null;
}

function getBmr(weight: number, height: number, age: number, gender: Gender): number | null {
    return gender === 'male'
        ? parseFloat((88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)).toFixed(2))
        : parseFloat((447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)).toFixed(2));
}

function getTdee(weight: number, height: number, age: number, gender: Gender, activityFactor: number): number | null {
    const bmr = getBmr(weight, height, age, gender);
    return bmr ? parseFloat((bmr * activityFactor).toFixed(2)) : null;
}

function getLbm(weight: number, height: number, gender: Gender): number | null {
    return gender === 'male'
        ? parseFloat(((0.32810 * weight) + (0.33929 * height) - 29.5336).toFixed(2))
        : parseFloat(((0.29569 * weight) + (0.41813 * height) - 43.2933).toFixed(2));
}

function getFatPercentage(weight: number, height: number, age: number, gender: Gender): number | null {
    const lbm = getLbm(weight, height, gender);
    if (!lbm) return null;
    const fat = ((1.20 * (weight - lbm) / weight * 100) + (0.23 * age) - (gender === 'male' ? 10.8 : 0) - 5.4);
    return parseFloat(fat.toFixed(2));
}

function getWaterPercentage(weight: number, height: number, age: number, gender: Gender): number | null {
    const fat = getFatPercentage(weight, height, age, gender);
    if (!fat) return null;
    const water = (100 - fat) * (gender === 'male' ? 0.55 : 0.49);
    return parseFloat(water.toFixed(2));
}

function getBoneMass(weight: number, height: number, gender: Gender): number | null {
    const lbm = getLbm(weight, height, gender);
    if (!lbm) return null;
    return parseFloat((lbm * (gender === 'male' ? 0.175 : 0.15)).toFixed(2));
}

function getMuscleMass(weight: number, height: number, age: number, gender: Gender): number | null {
    const fat = getFatPercentage(weight, height, age, gender);
    const bone = getBoneMass(weight, height, gender);
    if (!fat || !bone) return null;
    const muscle = weight - (fat * 0.01 * weight) - bone;
    return parseFloat(muscle.toFixed(2));
}

function getProteinPercentage(weight: number, height: number, age: number, gender: Gender): number | null {
    const muscle = getMuscleMass(weight, height, age, gender);
    const water = getWaterPercentage(weight, height, age, gender);
    if (!muscle || !water) return null;
    const protein = ((muscle * 0.19 + weight * water * 0.01 * 0.16) / weight * 100);
    return parseFloat(protein.toFixed(2));
}

function getVisceralFat(weight: number, height: number, age: number, gender: Gender): number | null {
    const ratio = weight / height;
    const vf = gender === 'male'
        ? weight * 0.1 + age * 0.05 + 0.1 * ratio
        : weight * 0.08 + age * 0.06 + 0.08 * ratio;
    return parseFloat(vf.toFixed(2));
}

function getIdealWeight(height: number, gender: Gender): number {
    const baseHeight = 152.4; // 5 feet in cm
    const additionalPerInch = 2.3;
    const heightInches = (height - baseHeight) / 2.54;

    return gender === 'male'
        ? parseFloat((50 + additionalPerInch * heightInches).toFixed(2))
        : parseFloat((45.5 + additionalPerInch * heightInches).toFixed(2));
}

function evaluate_bmi(bmi: number, age: number, gender: Gender, race: Race): BMIEvaluation {
    const thresholds = { ...BMI_THRESHOLDS[race ?? 'asian'] };

    if (age >= 65) {
        thresholds.normal += 1;
        thresholds.overweight += 1;
        thresholds.obese += 1;
    }

    let status = '';
    let message = '';
    let recommendation: string | null = null;

    if (bmi < thresholds.underweight) {
        status = "Thiếu cân";
        message = "Bạn có nguy cơ thiếu dinh dưỡng";
        recommendation = "Tăng cân bằng chế độ ăn giàu calo và protein";
    } else if (bmi < thresholds.normal) {
        status = "Bình thường";
        message = "Cân nặng của bạn trong mức khỏe mạnh";
        recommendation = "Duy trì chế độ ăn uống và vận động hợp lý";
    } else if (bmi < thresholds.overweight) {
        status = "Thừa cân";
        message = "Bạn có nguy cơ về sức khỏe nếu không kiểm soát cân nặng";
        recommendation = "Giảm cân bằng chế độ ăn và tập thể dục";
    } else {
        status = "Béo phì";
        message = "Nguy cơ cao về bệnh tim mạch, tiểu đường";
        recommendation = "Tham khảo ý kiến bác sĩ để giảm cân";
    }

    if (gender === "female" && bmi < 18.5) {
        message += " Phụ nữ cần duy trì mức mỡ tối thiểu cho hormone.";
        recommendation = "Tăng cân để đảm bảo sức khỏe sinh sản";
    }

    return { status, message, recommendation };
}

function evaluate_overall_health(bmi: number, age: number, gender: Gender, race: Race): OverallHealthEvaluation {
    const bmiEval = evaluate_bmi(bmi, age, gender, race);
    const evaluation: string[] = [
        `BMI (${bmi}): ${bmiEval.status} - ${bmiEval.message}`
    ];
    const recommendations: string[] = bmiEval.recommendation ? [bmiEval.recommendation] : [];

    if (age < 18) {
        evaluation.push("Độ tuổi: Trẻ - Cần theo dõi sự phát triển cơ thể");
        recommendations.push("Đảm bảo dinh dưỡng cân bằng để phát triển");
    } else if (age < 40) {
        evaluation.push("Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định");
    } else if (age < 65) {
        evaluation.push("Độ tuổi: Trung niên - Nguy cơ bệnh mãn tính tăng");
        recommendations.push("Kiểm tra sức khỏe định kỳ");
    } else {
        evaluation.push("Độ tuổi: Cao tuổi - Cần chú ý xương và cơ bắp");
        recommendations.push("Tập thể dục nhẹ và bổ sung canxi");
    }

    evaluation.push(`Giới tính: ${gender === 'male' ? "Nam - Thường có cơ bắp nhiều hơn" : "Nữ - Cần chú ý cân bằng mỡ và cơ"}`);
    evaluation.push(`Chủng tộc: ${race === 'asian' ? 'Châu Á' : 'Người không phải châu Á'} - Áp dụng ngưỡng sức khỏe phù hợp`);

    let overall_status = "Sức khỏe tổng quan: ";
    if (bmiEval.status === "Bình thường" && age < 65) {
        overall_status += "Tốt - Tiếp tục duy trì lối sống lành mạnh";
    } else if (["Thiếu cân", "Béo phì"].includes(bmiEval.status)) {
        overall_status += "Cần cải thiện - Có nguy cơ sức khỏe cần điều chỉnh";
    } else {
        overall_status += "Khá ổn - Theo dõi và điều chỉnh nếu cần";
    }

    return { status: bmiEval.status, evaluation, recommendations, overall_status };
}

function calculateRecord(
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityFactor: number,
    race: Race
): HealthRecord {
    const date = new Date();
    if (age === null) throw new Error("Invalid date of birth");

    const bmi = getBmi(weight, height)!;
    const bmr = getBmr(weight, height, age, gender)!;
    const tdee = getTdee(weight, height, age, gender, activityFactor)!;
    const lbm = getLbm(weight, height, gender)!;
    const fatPercentage = getFatPercentage(weight, height, age, gender)!;
    const waterPercentage = getWaterPercentage(weight, height, age, gender)!;
    const boneMass = getBoneMass(weight, height, gender)!;
    const muscleMass = getMuscleMass(weight, height, age, gender)!;
    const proteinPercentage = getProteinPercentage(weight, height, age, gender)!;
    const visceralFat = getVisceralFat(weight, height, age, gender)!;
    const idealWeight = getIdealWeight(height, gender);
    const overviewScore = evaluate_overall_health(bmi, age, gender, race);

    return {
        date,
        height,
        weight,
        age,
        bmi,
        bmr,
        tdee,
        lbm,
        fatPercentage,
        waterPercentage,
        boneMass,
        muscleMass,
        proteinPercentage,
        visceralFat,
        idealWeight,
        overviewScore
    };
}

export default calculateRecord;