import path from 'path'
import { app } from 'electron'
import { JSONFilePreset } from 'lowdb/node'



let db: Awaited<ReturnType<typeof JSONFilePreset<DBData>>>

export async function initDB() {
  const file = path.join(app.getPath('userData'), 'db.json')
  console.log('DB file path:', file)

  // Khởi tạo db với mặc định records rỗng
  db = await JSONFilePreset<DBData>(file, {
    records: [],
  })

  await db.read()

  // Nếu chưa có dữ liệu (records rỗng), thì tạo dữ liệu ảo mẫu
  if (!db.data || !db.data.records || db.data.records.length === 0) {
    const sampleRecords: RecordData[] = [
      {
        gender: 'male',
        race: 'asian',
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
        }
      },
      {
        gender: 'female',
        race: 'caucasian',
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
        }
      }
    ]

    db.data = { records: sampleRecords }
    await db.write()
  }
}

export async function getAllRecords(): Promise<RecordData[]> {
  await db.read()
  return db.data?.records ?? []
}

export async function getRecordsByDatePaginated(
  startDate: Date,
  endDate: Date,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  data: RecordData[],
  totalRecords: number,
  totalPages: number,
  currentPage: number
}> {
  await db.read();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  console.log(`Filtering records from ${start.toISOString()} to ${end.toISOString()}`);

  // Lọc các record theo ngày (và bỏ qua record null)
  const filtered = (db.data?.records ?? []).filter((item) => {
    if (!item.record?.date) return false;
    const recordDate = new Date(item.record.date);
    return recordDate >= start && recordDate <= end;
  });

  console.log(`Found ${filtered.length} records in the specified date range.`);

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Đảm bảo page hợp lệ
  const safePage = Math.max(1, Math.min(page, totalPages || 1));

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = filtered.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalRecords,
    totalPages,
    currentPage: safePage
  };
}




export async function getRecord(index: number): Promise<RecordData | null> {
  await db.read()
  if (!db.data || index < 0 || index >= db.data.records.length) return null
  return db.data.records[index]
}

export async function addRecord(record: RecordData): Promise<void> {
  await db.read()
  db.data?.records.push(record)
  await db.write()
}

export async function updateRecord(index: number, record: Partial<RecordData>): Promise<boolean> {
  await db.read()
  if (!db.data || index < 0 || index >= db.data.records.length) return false
  db.data.records[index] = { ...db.data.records[index], ...record }
  await db.write()
  return true
}

export async function deleteRecord(index: number): Promise<boolean> {
  await db.read()
  if (!db.data || index < 0 || index >= db.data.records.length) return false
  db.data.records.splice(index, 1)
  await db.write()
  return true
}
