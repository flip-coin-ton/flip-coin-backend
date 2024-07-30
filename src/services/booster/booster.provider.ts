import { Request, Response  } from 'express';
import { AuthRequest } from '../../middleware/authentication/jsonToken';
import { HttpStatusCodes as Code } from '../../utils/Enum';
import { GenResObj } from '../../utils/ResponseFormat';
import {UserTokenInfo} from '../../schema/userTokenInfo.schema';
import {User} from '../../schema/user.schema';
import {MultiTapLevel} from '../../schema/multiTapLevel.schema';
import {EnergyTankLevel} from '../../schema/energyTankLevel.schema';
import {EnergyChargingLevel} from '../../schema/energyChargingLevel.schema';
import { Types } from 'mongoose';
import { literal, Op } from 'sequelize';
import sequelize from 'sequelize/types/sequelize';

export const getBoosterInfo = async(req:AuthRequest) => {
    try {
        const { telegramId } = req;

        const checkAvlUser : any = await User.findOne({where :{ telegramId }});

        const checkAvlUserTokenInfo : any = await UserTokenInfo.findOne({where :{ userId : checkAvlUser.id}});

        // *************** Get next avaialable level for different booster *************** //
        const nextAvlMultitapLevel = parseInt(checkAvlUserTokenInfo?.multiTapLevel.split('-')[1]) + 1;

        const nextAvlEnergyTankLevel = parseInt(checkAvlUserTokenInfo?.energyTankLevel.split('-')[1]) + 1;

        const nextAvlEnergyChargingLevel = parseInt(checkAvlUserTokenInfo?.energyChargingLevel.split('-')[1]) + 1;

        // *************** Checking next level for difference boosters *************** //
        const checkAvlNextAvlMultitapLevel = await MultiTapLevel.findOne({where:{ level : nextAvlMultitapLevel }});

        const checkAvlNextAvlEnergyTankLevel = await EnergyTankLevel.findOne({where :{ level : nextAvlEnergyTankLevel }});

        const checkAvlNextAvlEnergyChargingLevel = await EnergyChargingLevel.findOne({where:{ level : nextAvlEnergyChargingLevel }});

        const resObj = {
            dailyChargingBooster : checkAvlUserTokenInfo?.dailyChargingBooster,
            dailyTappingBoosters : checkAvlUserTokenInfo?.dailyTappingBoosters,
            avlNextMultiTapLevel : checkAvlNextAvlMultitapLevel,
            avlNextEnergyTankLevel : checkAvlNextAvlEnergyTankLevel,
            avlNextEnergyChargingLevel : checkAvlNextAvlEnergyChargingLevel
        }

        return GenResObj(Code.OK, true, "Boost info fetched successfully.", resObj)
    } catch (error) {
        console.log("Getting error for getting boost info :", error);
        return GenResObj(
          Code.INTERNAL_SERVER,
          false,
          "Internal server error",
          null
        );  
    }
};

export const updateDailyBooster = async (req: AuthRequest) => {
    try {
        const { telegramId } = req;
        const { boosterType } = req.body;

        const checkAvlUser : any = await User.findOne({where :{ telegramId } });

        const checkAvlUserTokenInfo = await UserTokenInfo.findOne({where :{ userId : checkAvlUser?.id, [boosterType] : { [Op.lte] : 7} }});

        if(checkAvlUserTokenInfo) {
            await checkAvlUserTokenInfo.update({
                [boosterType]: literal(`${boosterType} - 1`)
              });
           const updateBoosterInfo = await checkAvlUserTokenInfo.reload();
            // const updateBooster = await UserTokenInfo.findOneAndUpdate({ userId : new Types.ObjectIdcheckAvlUser?.i) }, { $inc : { [boosterType] : -1 } }, { new : true });
            return GenResObj(Code.OK, true, "Booster updated successfully.", updateBoosterInfo )
        }

        return GenResObj(Code.NOT_FOUND, false, "Booster not found.", null);        
    } catch (error) {
        console.log("Getting error for updating booster :", error);
        return GenResObj(
          Code.INTERNAL_SERVER,
          false,
          "Internal server error",
          null
        ); 
    }
};

export const updatelevel = async (req: AuthRequest) => {
    try {
        const { telegramId } = req;
        const { boosterType } = req.body;

        const checkAvlUser : any = await User.findOne({where :{ telegramId }});

        const checkAvlUserTokenInfo:any = await UserTokenInfo.findOne({where :{ userId : (checkAvlUser?._id)}});

        const collectionType:any = boosterType == 'multiTapLevel' ? MultiTapLevel : boosterType == 'energyTankLevel' ? EnergyTankLevel : EnergyChargingLevel;

        const checkAvlLevelNameInfUserTokenInfo:any = boosterType == 'multiTapLevel' ? checkAvlUserTokenInfo?.multiTapLevel : boosterType == 'energyTankLevel' ? checkAvlUserTokenInfo?.energyTankLevel : checkAvlUserTokenInfo?.energyChargingLevel;
        
        const updatedNextLevelName = "LEVEL-" + (parseInt(checkAvlLevelNameInfUserTokenInfo?.split('-')[1]) + 1);
        
        const checkAvlNextLevelInfo:any = await collectionType.findOne({ levelName : updatedNextLevelName});
        
        if(checkAvlNextLevelInfo.amount <= checkAvlUserTokenInfo.currentBalance ) {
            const udpatedCurrenetBalance = checkAvlUserTokenInfo.currentBalance - checkAvlNextLevelInfo.amount;

            const updateUserTokenInfo = await UserTokenInfo.update({
                [boosterType]: updatedNextLevelName,
                currentBalance: udpatedCurrenetBalance
              }, {
                where: {
                  userId: checkAvlUser._id
                },
                returning: true
              });

            // const updateUserTokenInfo:any = await UserTokenInfo.findOneAndUpdate({ userId : new Types.ObjectId(checkAvlUser?._id) }, { $set : { [boosterType] : updatedNextLevelName, currentBalance : udpatedCurrenetBalance} }, { new : true });

            return GenResObj(Code.OK, true, "Level updated successfully", updateUserTokenInfo)
        }else {
            return GenResObj(Code.NOT_FOUND, false, "Insufficient balance.", null);
        }
        return GenResObj(Code.NOT_FOUND, false, "Something went wrong", null);
    } catch (error) {
        console.log("Getting error for updating booster :", error);
        return GenResObj(
          Code.INTERNAL_SERVER,
          false,
          "Internal server error",
          null
        );
    }
}

