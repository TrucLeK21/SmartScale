type UserData = {
    race: 'asian' | 'other';
    gender: 'male' | 'female';
    age: number;
    height: number;
    weight: number;
    activityFactor: number;
};

let userData: UserData = {
    race: "asian",
    gender: "male",
    age: 0,
    height: 0,
    weight: 0,
    activityFactor: 0
};

const userState = {
    set<K extends keyof UserData>(key: K, value: UserData[K]) {
        userData[key] = value;
    },

    update(partial: Partial<UserData>) {
        Object.assign(userData, partial);
    },

    get(key?: keyof UserData) {
        return key ? userData[key] : userData;
    },

    reset() {
        userData = { race: "asian", gender: "male", age: 0, height: 0, weight: 0, activityFactor: 0 };
    },

    isComplete(allowZeroKeys: (keyof UserData)[] = []): boolean {
        const requiredKeys: (keyof UserData)[] = ["race", "age", "height", "weight", "gender", "activityFactor"];
    
        return requiredKeys.every((key) => {
            const value = userData[key];
    
            if (value === undefined) return false;
    
            if (typeof value === 'number') {
                // Cho phép = 0 nếu key nằm trong allowZeroKeys
                return allowZeroKeys.includes(key) || value > 0;
            }
    
            return true;
        });
    }    
};

export default userState;
