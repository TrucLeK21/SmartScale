type UserData = {
    race: string;
    gender: string;
    age: number;
    height: number;
    weight: number;
};

let userData: UserData = {
    race: "",
    gender: "",
    age: 0,
    height: 0,
    weight: 0
};

const userState = {
    set<K extends keyof UserData>(key: K, value: UserData[K]) {
        userData[key] = value;
    },

    get(key?: keyof UserData) {
        return key ? userData[key] : userData;
    },

    reset() {
        userData = { race: "", gender: "", age: 0, height: 0, weight: 0 };
    },

    isComplete(): boolean {
        const requiredKeys: (keyof UserData)[] = ["race", "age", "height", "weight", "gender"];
        return requiredKeys.every((key) => userData[key] !== undefined);
    }
};

export default userState;
