export interface CurrentUserData {
    userId: number;
    telegramId: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
