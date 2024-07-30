import { TEnergyChargingLevel } from '../utils/Types';
import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey } from 'sequelize-typescript';


@Table({ tableName: 'energyChargingLevel', timestamps: true })
export class EnergyChargingLevel extends Model<TEnergyChargingLevel> {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue : DataType.UUIDV4,primaryKey: true})
    id!: string;
    
    @Column({ type: DataType.INTEGER, allowNull: false })
    level!: number;

    @Column({ type: DataType.STRING, allowNull: false })
    levelName!: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    chargingSpeed!: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    amount!: number;

    @CreatedAt
    @Column({ type: DataType.DATE })
    createdAt?: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    updatedAt?: Date;

    // Optional: Exclude fields from JSON response
    toJSON() {
        const attributes: any = Object.assign({}, this.get());
        delete attributes.createdAt;
        delete attributes.updatedAt;
        return attributes;
    }
}



// import { Schema, Model, model } from 'mongoose';

// const energyChargingSchema = new Schema<TEnergyChargingLevelModel>(
//     {
//         level : {
//             type : Number,
//             required : true
//         },
//         levelName : {
//             type : String,
//             required : true
//         },
//         chargingSpeed : {
//             type : Number,
//             required : true
//         }, 
//         amount : {
//             type : Number,
//             required : true
//         }
//     },
//     {
//         timestamps : true
//     }
// );

// energyChargingSchema.set("toJSON", {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret.__v;
//         delete ret.id;
//         delete ret.createdAt;
//         delete ret.updatedAt;
//     },
// });

// const collectionName = 'energyChargingLevel';

// const energyChargingLevel = model<TEnergyChargingLevelModel>(collectionName, energyChargingSchema);

// export default energyChargingLevel;