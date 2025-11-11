const { ObjectId } = require("mongodb");
const StatusResponse = require("~/utils/statusResponse");
const {
    ForbiddenRequestError,
    UnprocessableEntityError,
    NotFoundError,
} = require("~/core/error.response");
const rbacService = require("./rbac.service");
const getUserModel = require("~/models/user.model");
const getMathModel = require("~/models/math.model");
const { INSTANCE_KEY } = require("~/constants/constant");
const convertToMD5 = require("~/utils/md5");
const { StatusCodes } = require("~/utils/httpStatusCode");
const sha1 = require("sha1");

const moment = require('moment');
const { Long } = require('mongodb');
const mongoose = require('mongoose');
const sorobanService = require("./soroban.service");

class ConfigMathService {
    updateConfigFingerMath = async ({ mathTypeId, mathTypeName, numberQuestion, calculationLength, timePerCalculation, timeAnswer, keyLesson, valueLesson, keyParent, valueParent, rangeResult, firstNumber, secondNumber, displayStyle, displayStyleName, soundEnabled, soundEnabledName, allowExceed, fullname, teachername }, user) => {
        console.log({ mathTypeId, mathTypeName, numberQuestion, calculationLength, timePerCalculation, timeAnswer, keyLesson, valueLesson, keyParent, valueParent, rangeResult, firstNumber, secondNumber, displayStyle, displayStyleName, soundEnabled, soundEnabledName, allowExceed, fullname, teachername })
        const id = user._id.toString()
        const finger_math = {
            "mathTypeId": +mathTypeId,
            "mathTypeName": mathTypeName,
            "numberQuestion": numberQuestion,
            "calculationLength": calculationLength,
            "timePerCalculation": timePerCalculation,
            "timeAnswer": +timeAnswer,
            "keyLesson": +keyLesson,
            "valueLesson": valueLesson,
            "keyParent": +keyParent,
            "valueParent": valueParent,
            "rangeResult": +rangeResult,
            "firstNumber": +firstNumber,
            "secondNumber": +secondNumber,
            "displayStyle": +displayStyle,
            "displayStyleName": displayStyleName,
            "soundEnabled": +soundEnabled,
            "soundEnabledName": soundEnabledName,
            "allowExceed": 0,
            "fullname": fullname,
            "teachername": teachername,
        }
        const soroban_math = {
            "mathTypeId": +mathTypeId,
            "mathTypeName": mathTypeName,
            "numberQuestion": numberQuestion,
            "calculationLength": calculationLength,
            "timePerCalculation": timePerCalculation,
            "timeAnswer": +timeAnswer,
            "keyLesson": +keyLesson,
            "valueLesson": valueLesson,
            "keyParent": +keyParent,
            "valueParent": valueParent,
            "rangeResult": +rangeResult,
            "firstNumber": +firstNumber,
            "secondNumber": +secondNumber,
            "displayStyle": +displayStyle,
            "displayStyleName": displayStyleName,
            "soundEnabled": +soundEnabled,
            "soundEnabledName": soundEnabledName,
            "allowExceed": +allowExceed,
            "fullname": fullname,
            "teachername": teachername,
        }


        console.log("finger_math", finger_math)
        console.log("id", id)
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $set: +mathTypeId === 1
                    ? { finger_math }
                    : { soroban_math }
            },
            { new: true }
        );
        return updatedUser;
    }

    createPracticeFingerMath = async (body, user) => {
        const { count,
            main,
            digits1,
            digits2,
        } = body
        if (!count || !main || !digits1 || !digits2) {
            throw new UnprocessableEntityError("Missing required fields")
        }
        let allowExceed = body.allowExceed === "yes" ? true : false
        return sorobanService.randomOperations({
            ...body,
            allowExceed
        })
    }

    runOperations = async (body) => {
        const { count,
            main,
            digits1,
            digits2,
             } = body
        if (!count || !main || !digits1 || !digits2) {
            throw new UnprocessableEntityError("Missing required fields")
        }
         let allowExceed = body.allowExceed === "yes" ? true : false
        return sorobanService.runOperations(body.number, {...body, allowExceed})
    }



    savePracticeFingerMath = async (math, user) => {
        const id = user._id.toString()
        const username = user.username
        const mathArray = Object.values(math);

        const payload = {
            userId: id,
            math: mathArray,
            totalCorrect: mathArray.filter(item => item?.result === 1).length,
            totalWrong: mathArray.filter(item => item?.result === 0 || item?.result === undefined).length
        }

        const stored = await this.getStore(user)
        const mathModel = await getMathModel(INSTANCE_KEY.PRIMARY, stored)
        const create = await mathModel.create(payload)

        //tính tổng số bài toán đúng của user này để sau này dễ làm report

        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")

        const checkUser = await userModel.findOne({ username: username });
        const payloadUser = {
            totalCorrect: +payload?.totalCorrect + checkUser?.totalCorrect,
            totalWrong: +payload?.totalWrong + checkUser?.totalWrong
        }
        await userModel.findByIdAndUpdate(id, payloadUser, {
            new: true,
        })
        return create
    }

    historyMathByUser = async ({ userId, page, limit }, user) => {
        let queryUser = {
            _id: new ObjectId(userId)
        }
        const userModel = await getUserModel(INSTANCE_KEY.PRIMARY, "admin")
        const findUser = await userModel.findOne(queryUser)

        const stored = await this.getStore(findUser)

        const query = {
            userId: userId
        }


        const skip = (+page - 1) * +limit;



        const mathModel = await getMathModel(INSTANCE_KEY.PRIMARY, stored)
        const maths = await mathModel.find(query).skip(skip).limit(limit).lean().exec();
        // console.log("maths", JSON.stringify(maths, null, 2))
        const count = await mathModel.countDocuments(query);
        return { data: maths, total: count }
    }

    randomExpression = () => {
        // const operators = ['+', '-'];
        // let expression = '';

        // for (let i = 0; i < 6; i++) {
        //     const num = Math.floor(Math.random() * 10); // số 0-9
        //     expression += num;

        //     if (i < 5) {
        //         const op = operators[Math.floor(Math.random() * operators.length)];
        //         expression += ` ${op} `;
        //     }
        // }

        // // Tính kết quả bằng eval (cẩn thận khi dùng eval)
        // const result = eval(expression);

        return { expression: '8 + 6 ', result: 14 }
        // return { expression: '8 + 6 + 2 + 1 - 2 - 4 + 5 + 1 + 2 - 3 + 5 + 7 - 4', result: 14 }
    }

    getStore = async (user) => {
        const position = user?.position
        let stored = ""
        if (position === 2) stored = user._id.toString()
        if (position === 3) stored = user._id.toString()
        if (position === 4 || position === 5) stored = user.centerId.toString()
        return stored
    }

    getStoreById = async (user) => {
        const position = user?.position
        let stored = ""
        if (position === 2) stored = user._id.toString()
        if (position === 3) stored = user._id.toString()
        if (position === 4 || position === 5) stored = user.centerId.toString()
        return stored
    }



}
module.exports = new ConfigMathService();
