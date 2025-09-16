import path from "path";
import { app } from "electron";
import { JSONFilePreset } from "lowdb/node";
import { nanoid } from "nanoid"; // thêm nanoid

let db: Awaited<ReturnType<typeof JSONFilePreset<DBData>>>;

export async function initDB() {
  const file = path.join(app.getPath("userData"), "db.json");
  console.log("DB file path:", file);

  // Khởi tạo db với mặc định records rỗng
  db = await JSONFilePreset<DBData>(file, {
    records: [],
  });

  await db.read();

  // Nếu chưa có dữ liệu (records rỗng), thì tạo dữ liệu ảo mẫu
  if (!db.data || !db.data.records || db.data.records.length === 0) {
    const sampleRecords: RecordData[] = [
      {
        id: nanoid(), // thêm id
        gender: "male",
        race: "asian",
        activityFactor: 1.2,
        record: {
          date: new Date(),
          height: 170,
          weight: 65,
          age: 30,
          bmi: 22.5,
          bmr: 1600,
          tdee: 2200,
          lbm: 50,
          fatPercentage: 15,
          waterPercentage: 60,
          boneMass: 3,
          muscleMass: 40,
          proteinPercentage: 18,
          visceralFat: 5,
          idealWeight: 68,
          overviewScore: null,
        },
      },
      {
        id: nanoid(), // thêm id
        gender: "female",
        race: "caucasian",
        activityFactor: 1.4,
        record: {
          date: new Date(),
          height: 160,
          weight: 55,
          age: 28,
          bmi: 21.5,
          bmr: 1400,
          tdee: 2000,
          lbm: 45,
          fatPercentage: 22,
          waterPercentage: 55,
          boneMass: 2.8,
          muscleMass: 35,
          proteinPercentage: 16,
          visceralFat: 6,
          idealWeight: 57,
          overviewScore: null,
        },
      },
    ];

    db.data = { records: sampleRecords };
    await db.write();
  }
}

export async function getAllRecords(): Promise<RecordData[]> {
  await db.read();
  return db.data?.records ?? [];
}

export async function getRecordsByDatePaginated(
  startDate: Date,
  endDate: Date,
  page: number = 1,
  pageSize: number = 10,
  sortDirection: "asc" | "desc" = "asc",
  gender: "all" | "male" | "female" = "all",
  race: "all" | "asian" | "caucasian" = "all"
): Promise<{
  data: RecordData[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}> {
  await db.read();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  console.log(
    `Filtering records from ${start.toISOString()} to ${end.toISOString()}`
  );

  const filtered = (db.data?.records ?? []).filter((item) => {
    if (!item.record?.date) return false;
    const recordDate = new Date(item.record.date);
    if (recordDate < start || recordDate > end) return false;
    if (gender !== "all" && item.gender !== gender) return false;
    if (race !== "all" && item.race !== race) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const dateA = new Date(a.record!.date).getTime();
    const dateB = new Date(b.record!.date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalRecords = sorted.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = sorted.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalRecords,
    totalPages,
    currentPage: safePage,
  };
}

export async function getRecordById(id: string): Promise<RecordData | null> {
  await db.read();
  if (!db.data) return null;

  const record = db.data.records.find((r) => r.id === id);
  return record ?? null;
}

export async function getOverviewData(
  startDate: Date,
  endDate: Date
): Promise<OverviewData> {
  await db.read();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Nếu chưa có records thì return luôn
  if (!db.data?.records || db.data.records.length === 0) {
    return {
      totalRecords: 0,
      averageWeight: 0,
      averageBMI: 0,
      averageFatPercentage: 0,
    };
  }

  // Lọc theo khoảng thời gian
  const filtered = db.data.records.filter((item) => {
    if (!item.record?.date) return false;
    const recordDate = new Date(item.record.date);
    return recordDate >= start && recordDate <= end;
  });

  const totalRecords = filtered.length;

  // Nếu không có record nào trong khoảng thì return 0
  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      averageWeight: 0,
      averageBMI: 0,
      averageFatPercentage: 0,
    };
  }

  // Tính tổng bằng reduce
  const totalWeight = filtered.reduce(
    (sum, r) => sum + (r.record?.weight ?? 0),
    0
  );
  const totalBMI = filtered.reduce((sum, r) => sum + (r.record?.bmi ?? 0), 0);
  const totalFatPercentage = filtered.reduce(
    (sum, r) => sum + (r.record?.fatPercentage ?? 0),
    0
  );

  // Trả về dữ liệu tổng quan
  return {
    totalRecords,
    averageWeight: parseFloat((totalWeight / totalRecords).toFixed(2)),
    averageBMI: parseFloat((totalBMI / totalRecords).toFixed(2)),
    averageFatPercentage: parseFloat(
      (totalFatPercentage / totalRecords).toFixed(2)
    ),
  };
}
type MetricKey = keyof RecordData | keyof HealthRecord;

export async function getLineChartData(
  startDate: Date,
  endDate: Date,
  metricKey: MetricKey = "weight"
): Promise<ChartData[]> {
  await db.read();

  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(23, 59, 59, 999);

  const records = db.data?.records ?? [];
  if (records.length === 0) {
    return [];
  }

  // Gom dữ liệu theo ngày
  const grouped: Record<string, number[]> = {};

  records.forEach((record) => {
    const recordDate = record.record?.date
      ? new Date(record.record.date)
      : null;

    const metricValue =
      record[metricKey as keyof RecordData] ??
      record.record?.[metricKey as keyof HealthRecord];

    if (
      recordDate !== null &&
      recordDate >= normalizedStartDate &&
      recordDate <= normalizedEndDate &&
      metricValue != null
    ) {
      const dayKey = recordDate.toISOString().split("T")[0];

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(metricValue as number);
    }
  });

  // Tính trung bình mỗi ngày
  const chartData = Object.entries(grouped)
    .map(([date, values]) => ({
      date,
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
}

export async function getBMIGroupData(
  startDate: Date,
  endDate: Date
): Promise<BMIGroupData[]> {
  const groups: BMIGroupData[] = [
    { name: "Gầy (<18.5)", value: 0 },
    { name: "Bình thường (18.5 - 24.9)", value: 0 },
    { name: "Thừa cân (25 - 29.9)", value: 0 },
    { name: "Béo phì (≥30)", value: 0 },
  ];

  await db.read();

  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(23, 59, 59, 999);

  const records = db.data?.records ?? [];
  if (records.length === 0) {
    return groups;
  }

  const filtered = db.data.records.filter((item) => {
    if (!item.record?.date) return false;
    const recordDate = new Date(item.record.date);
    return recordDate >= normalizedStartDate && recordDate <= normalizedEndDate;
  });

  filtered.forEach((record) => {
    const bmi = record.record?.bmi;
    if (bmi == null) return;

    if (bmi < 18.5) {
      groups[0].value++;
    } else if (bmi < 25) {
      groups[1].value++;
    } else if (bmi < 30) {
      groups[2].value++;
    } else {
      groups[3].value++;
    }
  });

  return groups;
}

export async function getBMIGroupByGender(
  startDate: Date,
  endDate: Date
): Promise<BMIGroupByGender[]> {
  const groups: BMIGroupByGender[] = [
    { ageGroup: "<18", maleBMI: 0, femaleBMI: 0 },
    { ageGroup: "18-25", maleBMI: 0, femaleBMI: 0 },
    { ageGroup: "26-35", maleBMI: 0, femaleBMI: 0 },
    { ageGroup: "36-45", maleBMI: 0, femaleBMI: 0 },
    { ageGroup: "46-55", maleBMI: 0, femaleBMI: 0 },
    { ageGroup: "56+", maleBMI: 0, femaleBMI: 0 },
  ];

  await db.read();

  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(23, 59, 59, 999);

  const records = db.data?.records ?? [];
  if (records.length === 0) return groups;

  const filtered = records.filter((item) => {
    if (!item.record?.date) return false;
    const recordDate = new Date(item.record.date);
    return recordDate >= normalizedStartDate && recordDate <= normalizedEndDate;
  });

  const totals = groups.map(() => ({
    maleSum: 0,
    maleCount: 0,
    femaleSum: 0,
    femaleCount: 0,
  }));

  filtered.forEach((item) => {
    const record = item.record;
    if (!record) return; // <-- thêm kiểm tra record null

    const age = record.age;
    const bmi = record.bmi;
    const gender = item.gender;

    if (bmi == null) return;

    let index = -1;
    if (age < 18) index = 0;
    else if (age >= 18 && age <= 25) index = 1;
    else if (age >= 26 && age <= 35) index = 2;
    else if (age >= 36 && age <= 45) index = 3;
    else if (age >= 46 && age <= 55) index = 4;
    else if (age >= 56) index = 5;

    if (index === -1) return;

    if (gender === "male") {
      totals[index].maleSum += bmi;
      totals[index].maleCount += 1;
    } else if (gender === "female") {
      totals[index].femaleSum += bmi;
      totals[index].femaleCount += 1;
    }
  });

  totals.forEach((t, i) => {
    groups[i].maleBMI = t.maleCount
      ? parseFloat((t.maleSum / t.maleCount).toFixed(1))
      : 0;
    groups[i].femaleBMI = t.femaleCount
      ? parseFloat((t.femaleSum / t.femaleCount).toFixed(1))
      : 0;
  });

  return groups;
}

export async function addRecord(record: RecordData): Promise<void> {
  await db.read();

  let newId = record.id ?? nanoid();

  // Kiểm tra trùng ID và tạo lại nếu cần
  while (db.data?.records.some((r) => r.id === newId)) {
    newId = nanoid();
  }

  const newRecord = { ...record, id: newId };
  db.data?.records.push(newRecord);
  await db.write();
}

export async function updateRecord(
  index: number,
  record: Partial<RecordData>
): Promise<boolean> {
  await db.read();
  if (!db.data || index < 0 || index >= db.data.records.length) return false;
  db.data.records[index] = { ...db.data.records[index], ...record };
  await db.write();
  return true;
}

export async function deleteRecord(index: number): Promise<boolean> {
  await db.read();
  if (!db.data || index < 0 || index >= db.data.records.length) return false;
  db.data.records.splice(index, 1);
  await db.write();
  return true;
}
