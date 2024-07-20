
 interface fundraiser{
    user:string;
    relation:string
    beneficiary:string; //benificiary id
    title:string;
    category:string;
    description:string;
    startDate:Date;
    endDate:Date;
    goalAmount:number;
    raisedAmount:number;
    isActive:boolean;
    createdAt:Date;


}
export default fundraiser;