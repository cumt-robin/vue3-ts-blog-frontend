/**
 * @author: Tusi
 * @description: 验证码服务
 */
import { ApiService } from "@/services/index";
import { PlainResponse } from "@/bean/xhr";

class ValidatorService extends ApiService {
    public imgCode() {
        return this.$get<PlainResponse<string>>("img_code");
    }
}

export const validatorService = new ValidatorService("validator");
