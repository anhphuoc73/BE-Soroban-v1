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
    updateConfigFingerMath = async ({ mathTypeId, mathTypeName, numberQuestion, calculationLength, timePerCalculation, timeAnswer, keyLesson, valueLesson, keyParent, valueParent, rangeResult, firstNumber, secondNumber, displayStyle, displayStyleName, soundEnabled, soundEnabledName, allowExceed }, user) => {
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
            "allowExceed": 0
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
            "allowExceed": +allowExceed
        }


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
            allowExceed } = body
        if (!count || !main || !digits1 || !digits2 || allowExceed === undefined) {
            throw new UnprocessableEntityError("Missing required fields")
        }
        return sorobanService.randomOperations(body)
    }

    runOperations = async (body) => {
        const { count,
            main,
            digits1,
            digits2,
            allowExceed } = body
        if (!count || !main || !digits1 || !digits2 || allowExceed === undefined) {
            throw new UnprocessableEntityError("Missing required fields")
        }
        return sorobanService.runOperations(body.number, body)
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



}
module.exports = new ConfigMathService();
