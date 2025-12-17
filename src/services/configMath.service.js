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
const getRandomNumberByDigits = require("~/utils/square");
const getRandomCubeByDigits = require("~/utils/cube");
const getMulDiv = require("~/utils/multiDiv");
const getRandomSquareNumberByDigits = require("~/utils/squareRoot");
const getRandomCubeNumberByDigits = require("~/utils/cubeRoot");
const { StatusCodes } = require("~/utils/httpStatusCode");
const sha1 = require("sha1");

const moment = require('moment');
const { Long } = require('mongodb');
const mongoose = require('mongoose');
const sorobanService = require("./soroban.service");

class ConfigMathService {
    updateConfigFingerMath = async ({ mathTypeId, mathTypeName, numberQuestion, calculationLength, timePerCalculation, timeAnswer, keyLesson, valueLesson, keyParent, valueParent, rangeResult, firstNumber, secondNumber, displayStyle, displayStyleName, soundEnabled, soundEnabledName, allowExceed, fullname, teachername, caculation }, user) => {
        const id = user._id.toString()
        const finger_math = {
            "mathTypeId": +mathTypeId,
            "mathTypeName": mathTypeName,
            "caculation": +1,
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
            "caculation": +caculation,
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
        let result = await sorobanService.randomOperations({
            ...body,
            main: sorobanService.getRandomChildId(+main),
            allowExceed
        })
        while (!result || Object.keys(result).length === 0) {
            result = sorobanService.randomOperations({
                ...body,
                main: sorobanService.getRandomChildId(+main),
                allowExceed
            })
        }
        return result
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
        return sorobanService.runOperations(body.number, { ...body, allowExceed })
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

    practiceFingerMathMultiplyDivision = (body, user) => {
        //500=> B 

        const caculation = +body?.caculation
        const count = +body?.count
        const main = +body?.main
        const digits1 = +body?.digits1
        const digits2 = +body?.digits2


        if (caculation == 2 || caculation == '2') {

            if (main == 500 || main == "500") {
                //bình phương
                const square = getRandomNumberByDigits(digits1);
                return {
                    expression: `${square?.number}<sup>2</sup> = ?`,
                    result: +square?.result
                }

            } else if (main == 501 || main == "501") {
                //Lập phương
                const cube = getRandomCubeByDigits(digits1);
                console.log(cube)
                return {
                    expression: `${cube?.number}<sup>3</sup> = ?`,
                    result: +cube?.result
                }

            } else if (main == 502 || main == "502") {
                //Nhân 2 số hạng
                const mulDiv = getMulDiv(digits1, digits2, count)
                return {
                    expression: mulDiv?.expression,
                    result: mulDiv?.result
                }

            } else if (main == 503 || main == "503") {
                //căn bậc 2
                const squareRoot = getRandomSquareNumberByDigits(digits1);
                return {
                    expression: `&radic;${squareRoot?.number}=?`,
                    result: squareRoot?.sqrt
                }
            } else if (main == 504 || main == "504") {
                //căn bậc 3
                const cubeRoot = getRandomCubeNumberByDigits(digits1);
                return {
                    expression: `&#179;&radic;${cubeRoot?.number}`,
                    result: cubeRoot?.cbrt
                }
            } else if (main == 505 || main == "505") {
                //Nhân 2 số hạng
                const mulDiv = getMulDiv(digits1, digits2, count)
                return {
                    expression: mulDiv?.expression,
                    result: mulDiv?.result
                }
            }

        }


        // const { count,
        //     main,
        //     digits1,
        //     digits2,
        // } = body
        // if (!count || !main || !digits1 || !digits2) {
        //     throw new UnprocessableEntityError("Missing required fields")
        // }
        // let allowExceed = body.allowExceed === "yes" ? true : false
        // return sorobanService.randomOperations({
        //     ...body,
        //     //allowExceed
        // })


    }



}
module.exports = new ConfigMathService();
