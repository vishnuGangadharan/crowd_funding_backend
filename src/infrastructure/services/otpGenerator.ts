import OTP from "../../useCase/interface/otp";

class OTPGenerator implements OTP {

        createOTP(): number {
        return Math.floor(1000 + Math.random() * 9000);
    }
}

export default OTPGenerator;    