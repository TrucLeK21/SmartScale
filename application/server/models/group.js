
import mongoose from "mongoose";
import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;


const groupSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        unique: true
    },
    createdDate: {
        type: Date,
        default: () => new Date(),
    },
    members: {
        type: [Number], // Mảng các ID (kiểu Number)
        default: function () {
            return [this.owner]; // Mặc định chứa ID của `owner`
        }
    },
    owner: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    }
});

groupSchema.pre('save', async function(next){
    const group = this;
    
    try {
        // Hash mật khẩu trước khi lưu
        if(group.isModified('password')) {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            group.password = await bcrypt.hash(group.password, salt);
        }

        if(group.isNew) {
            const count = await mongoose.model('Group').countDocuments();
            group.id = count + 1;
            let isExisted = await mongoose.model('Group').findOne({id: group.id});
            while(isExisted){
                group.id = group.id + 1;
                isExisted = await mongoose.model('Group').findOne({id: group.id});
            }
        }
        next();

    } catch (error) {
        next(error);
    }
});

groupSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model('Group', groupSchema, 'groups');