interface OTP{
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: number;
    otpGeneratedAt:Date
    otpExpiredAt:Date
}

export default OTP;