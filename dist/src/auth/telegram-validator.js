"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTelegramInitData = validateTelegramInitData;
const crypto = __importStar(require("crypto"));
function validateTelegramInitData(initData, botToken, maxAgeSeconds = 86400) {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
        throw new Error("initData ichida 'hash' topilmadi");
    }
    urlParams.delete('hash');
    const dataCheckArr = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
        dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    if (calculatedHash !== hash) {
        throw new Error("initData imzosi noto'g'ri — Telegram'dan kelmagan bo'lishi mumkin");
    }
    const authDate = Number(urlParams.get('auth_date'));
    if (!authDate) {
        throw new Error('auth_date topilmadi');
    }
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) {
        throw new Error('initData eskirgan, qayta kiring');
    }
    const userJson = urlParams.get('user');
    if (!userJson) {
        throw new Error("initData ichida 'user' topilmadi");
    }
    const user = JSON.parse(userJson);
    return {
        user,
        authDate,
        queryId: urlParams.get('query_id') ?? undefined,
    };
}
//# sourceMappingURL=telegram-validator.js.map